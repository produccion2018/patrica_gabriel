import "./CarruselModal.css";
import { useState, useEffect, useRef, useCallback } from "react";
import {
  FaTimes,
  FaChevronLeft,
  FaChevronRight,
  FaSearchPlus,
  FaSearchMinus,
  FaExpand,
} from "react-icons/fa";

// Límites de zoom: 1x (foto completa) hasta 4x.
const ZOOM_MIN = 1;
const ZOOM_MAX = 4;
const ZOOM_STEP_BOTON = 0.5;
const ZOOM_STEP_RUEDA = 0.3;
// Distancia mínima (en px) para considerar un deslizamiento de dedo.
const SWIPE_MIN = 50;

const clampScale = (v) => Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, v));

export default function CarruselModal({ openModal, setOpenModal, gallery }) {
  const total = gallery ? gallery.length : 0;

  const [current, setCurrent] = useState(0);
  const [scale, setScale] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);

  const stageRef = useRef(null);
  const thumbsRef = useRef(null);
  const scaleRef = useRef(1);
  const dragRef = useRef(false);
  const lastPointRef = useRef({ x: 0, y: 0 });
  const pinchRef = useRef(null);
  const swipeStartRef = useRef(null);
  const lastTapRef = useRef(0);

  // ================================
  // NAVEGACIÓN
  // ================================
  const next = useCallback(() => {
    setCurrent((c) => (total ? (c + 1) % total : 0));
  }, [total]);

  const prev = useCallback(() => {
    setCurrent((c) => (total ? (c - 1 + total) % total : 0));
  }, [total]);

  // ================================
  // ZOOM
  // ================================
  const changeScale = useCallback((delta) => {
    setScale((s) => clampScale(Math.round((s + delta) * 100) / 100));
  }, []);

  const resetZoom = useCallback(() => {
    setScale(1);
    setPos({ x: 0, y: 0 });
  }, []);

  const toggleZoom = () => {
    if (scaleRef.current > 1) resetZoom();
    else setScale(2);
  };

  // Mueve la foto ampliada sin dejar que se salga demasiado del marco.
  const movePos = (dx, dy) => {
    setPos((p) => {
      const rect = stageRef.current?.getBoundingClientRect();
      const maxX = rect ? (rect.width * (scaleRef.current - 1)) / 2 : 0;
      const maxY = rect ? (rect.height * (scaleRef.current - 1)) / 2 : 0;
      return {
        x: Math.min(maxX, Math.max(-maxX, p.x + dx)),
        y: Math.min(maxY, Math.max(-maxY, p.y + dy)),
      };
    });
  };

  // ================================
  // EFECTOS
  // ================================

  // Bloquea el scroll de la página mientras el visor está abierto.
  useEffect(() => {
    document.body.style.overflow = openModal ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [openModal]);

  // Al abrir, siempre arranca en la primera foto.
  useEffect(() => {
    if (openModal) setCurrent(0);
  }, [openModal]);

  // Al cambiar de foto o abrir/cerrar, se resetea el zoom.
  useEffect(() => {
    setScale(1);
    setPos({ x: 0, y: 0 });
  }, [current, openModal]);

  // Mantiene sincronizado el zoom actual para los listeners nativos.
  useEffect(() => {
    scaleRef.current = scale;
    if (scale === 1) setPos({ x: 0, y: 0 });
  }, [scale]);

  // Teclado: Esc cierra, flechas navegan, + y - hacen zoom.
  useEffect(() => {
    if (!openModal) return;

    const onKey = (e) => {
      if (e.key === "Escape") setOpenModal(false);
      else if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") prev();
      else if (e.key === "+" || e.key === "=") changeScale(ZOOM_STEP_BOTON);
      else if (e.key === "-") changeScale(-ZOOM_STEP_BOTON);
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openModal, next, prev, changeScale, setOpenModal]);

  // Rueda del mouse y gestos táctiles: se registran de forma nativa
  // (no pasiva) para poder bloquear el scroll de la página.
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;

    const onWheel = (e) => {
      e.preventDefault();
      changeScale(e.deltaY < 0 ? ZOOM_STEP_RUEDA : -ZOOM_STEP_RUEDA);
    };

    const onTouchMove = (e) => {
      if (e.touches.length === 2 || scaleRef.current > 1) e.preventDefault();
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("touchmove", onTouchMove, { passive: false });

    return () => {
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("touchmove", onTouchMove);
    };
  }, [openModal, changeScale]);

  // Lleva la miniatura activa al centro de la tira.
  useEffect(() => {
    if (!openModal) return;
    const thumb = thumbsRef.current?.children[current];
    if (thumb && thumb.scrollIntoView) {
      thumb.scrollIntoView({
        behavior: "smooth",
        inline: "nearest",
        block: "nearest",
      });
    }
  }, [current, openModal]);

  if (!openModal || total === 0) return null;

  // ================================
  // MOUSE (arrastrar cuando hay zoom)
  // ================================
  const handleMouseDown = (e) => {
    if (scale <= 1) return;
    dragRef.current = true;
    setDragging(true);
    lastPointRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e) => {
    if (!dragRef.current) return;
    const dx = e.clientX - lastPointRef.current.x;
    const dy = e.clientY - lastPointRef.current.y;
    lastPointRef.current = { x: e.clientX, y: e.clientY };
    movePos(dx, dy);
  };

  const handleMouseUp = () => {
    dragRef.current = false;
    setDragging(false);
  };

  // ================================
  // TOUCH (pellizco, arrastre, deslizar y doble toque)
  // ================================
  const distancia = (touches) => {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const handleTouchStart = (e) => {
    if (e.touches.length === 2) {
      pinchRef.current = distancia(e.touches);
      swipeStartRef.current = null;
      return;
    }

    if (e.touches.length === 1) {
      const t = e.touches[0];
      lastPointRef.current = { x: t.clientX, y: t.clientY };

      // Doble toque: alterna zoom.
      const ahora = Date.now();
      if (ahora - lastTapRef.current < 300) {
        toggleZoom();
        lastTapRef.current = 0;
        swipeStartRef.current = null;
        return;
      }
      lastTapRef.current = ahora;

      if (scaleRef.current > 1) {
        dragRef.current = true;
        setDragging(true);
      } else {
        swipeStartRef.current = { x: t.clientX, y: t.clientY };
      }
    }
  };

  const handleTouchMove = (e) => {
    if (e.touches.length === 2 && pinchRef.current) {
      const nueva = distancia(e.touches);
      const factor = nueva / pinchRef.current;
      pinchRef.current = nueva;
      setScale((s) => clampScale(s * factor));
    } else if (e.touches.length === 1 && dragRef.current) {
      const t = e.touches[0];
      const dx = t.clientX - lastPointRef.current.x;
      const dy = t.clientY - lastPointRef.current.y;
      lastPointRef.current = { x: t.clientX, y: t.clientY };
      movePos(dx, dy);
    }
  };

  const handleTouchEnd = (e) => {
    if (
      swipeStartRef.current &&
      scaleRef.current === 1 &&
      e.changedTouches[0]
    ) {
      const dx = e.changedTouches[0].clientX - swipeStartRef.current.x;
      const dy = e.changedTouches[0].clientY - swipeStartRef.current.y;
      if (Math.abs(dx) > SWIPE_MIN && Math.abs(dx) > Math.abs(dy)) {
        if (dx < 0) next();
        else prev();
      }
    }
    swipeStartRef.current = null;

    if (e.touches.length < 2) pinchRef.current = null;
    if (e.touches.length === 0) {
      dragRef.current = false;
      setDragging(false);
    }
  };

  const cerrar = () => setOpenModal(false);

  return (
    <div className="cm-overlay" onClick={cerrar}>
      <div className="cm-content" onClick={(e) => e.stopPropagation()}>
        {/* BARRA SUPERIOR */}
        <div className="cm-topbar">
          <span className="cm-counter">
            {current + 1} / {total}
          </span>
          <button
            className="cm-icon-btn"
            onClick={cerrar}
            aria-label="Cerrar"
            type="button"
          >
            <FaTimes />
          </button>
        </div>

        {/* CUERPO: foto grande + miniaturas en columna */}
        <div className="cm-body">
          {/* ESCENARIO */}
          <div
            ref={stageRef}
            className={`cm-stage ${scale > 1 ? "is-zoomed" : ""} ${
              dragging ? "is-dragging" : ""
            }`}
            onContextMenu={(e) => e.preventDefault()}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onDoubleClick={toggleZoom}
          >
            <div
              className="cm-img-wrap"
              style={{
                transform: `translate(${pos.x}px, ${pos.y}px) scale(${scale})`,
                transition: dragging ? "none" : "transform 0.2s ease",
              }}
            >
              <img
                key={current}
                src={gallery[current]}
                className="cm-main-image"
                alt={`Foto ${current + 1} de ${total}`}
                draggable={false}
              />
              <div className="cm-watermark" aria-hidden="true" />
            </div>

            {total > 1 && (
              <>
                <button
                  className="cm-arrow cm-arrow-left"
                  onClick={(e) => {
                    e.stopPropagation();
                    prev();
                  }}
                  onMouseDown={(e) => e.stopPropagation()}
                  onTouchStart={(e) => e.stopPropagation()}
                  onTouchEnd={(e) => e.stopPropagation()}
                  onDoubleClick={(e) => e.stopPropagation()}
                  aria-label="Foto anterior"
                  type="button"
                >
                  <FaChevronLeft />
                </button>
                <button
                  className="cm-arrow cm-arrow-right"
                  onClick={(e) => {
                    e.stopPropagation();
                    next();
                  }}
                  onMouseDown={(e) => e.stopPropagation()}
                  onTouchStart={(e) => e.stopPropagation()}
                  onTouchEnd={(e) => e.stopPropagation()}
                  onDoubleClick={(e) => e.stopPropagation()}
                  aria-label="Foto siguiente"
                  type="button"
                >
                  <FaChevronRight />
                </button>
              </>
            )}

            {/* CONTROLES DE ZOOM */}
            <div
              className="cm-zoom-bar"
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              onTouchEnd={(e) => e.stopPropagation()}
              onDoubleClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => changeScale(-ZOOM_STEP_BOTON)}
                disabled={scale <= ZOOM_MIN}
                aria-label="Alejar"
                type="button"
              >
                <FaSearchMinus />
              </button>
              <span className="cm-zoom-level">{Math.round(scale * 100)}%</span>
              <button
                onClick={() => changeScale(ZOOM_STEP_BOTON)}
                disabled={scale >= ZOOM_MAX}
                aria-label="Acercar"
                type="button"
              >
                <FaSearchPlus />
              </button>
              <button
                onClick={resetZoom}
                disabled={scale === 1}
                aria-label="Ver foto completa"
                type="button"
              >
                <FaExpand />
              </button>
            </div>
          </div>

          {/* MINIATURAS */}
          <div className="cm-thumbs" ref={thumbsRef}>
            {gallery.map((img, index) => (
              <button
                key={index}
                type="button"
                className={`cm-thumb ${current === index ? "active" : ""}`}
                onClick={() => setCurrent(index)}
                aria-label={`Ver foto ${index + 1}`}
              >
                <img src={img} alt="" draggable={false} />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
