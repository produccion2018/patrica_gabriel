import "./CarruselModal.css";
import { FaTimes, FaSearchPlus, FaSearchMinus } from "react-icons/fa";
import { useState, useEffect, useRef } from "react";

// Límites de zoom: no se puede achicar más que la foto original (1x)
// ni agrandar más de 4 veces.
const ZOOM_MIN = 1;
const ZOOM_MAX = 4;
// Cuánto zoom agrega/quita cada "click" de la rueda del mouse.
const ZOOM_STEP_RUEDA = 0.3;

export default function CarruselModal({ openModal, setOpenModal, gallery }) {
  const [current, setCurrent] = useState(0);

  // Nivel de zoom actual (1 = tamaño normal) y desplazamiento (para
  // poder mover la foto con el dedo/mouse cuando está ampliada).
  const [scale, setScale] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  // Referencias internas para calcular arrastre y pellizco sin
  // provocar renders de más.
  const draggingRef = useRef(false);
  const lastPointRef = useRef({ x: 0, y: 0 });
  const lastPinchDistRef = useRef(null);

  useEffect(() => {
    if (openModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [openModal]);

  // Si cambio de foto o cierro el modal, reseteo el zoom y la posición.
  useEffect(() => {
    setScale(1);
    setPos({ x: 0, y: 0 });
  }, [current, openModal]);

  if (!openModal) return null;

  // Mantiene el zoom siempre dentro de los límites permitidos.
  const clampScale = (value) => Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, value));

  // Botón de Zoom que ya existía: alterna entre 1x y 2x.
  const toggleZoomBoton = (e) => {
    e.stopPropagation();
    setScale((s) => (s > 1 ? 1 : 2));
    setPos({ x: 0, y: 0 });
  };

  // ================================
  // ZOOM CON RUEDA DEL MOUSE (PC)
  // ================================
  const handleWheel = (e) => {
    e.preventDefault();
    setScale((s) => {
      const nuevo = e.deltaY < 0 ? s + ZOOM_STEP_RUEDA : s - ZOOM_STEP_RUEDA;
      const limitado = clampScale(nuevo);
      if (limitado === 1) setPos({ x: 0, y: 0 });
      return limitado;
    });
  };

  // ================================
  // ARRASTRAR CON MOUSE (solo si hay zoom aplicado)
  // ================================
  const handleMouseDown = (e) => {
    if (scale <= 1) return;
    draggingRef.current = true;
    lastPointRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e) => {
    if (!draggingRef.current) return;
    const dx = e.clientX - lastPointRef.current.x;
    const dy = e.clientY - lastPointRef.current.y;
    lastPointRef.current = { x: e.clientX, y: e.clientY };
    setPos((p) => ({ x: p.x + dx, y: p.y + dy }));
  };

  const handleMouseUp = () => {
    draggingRef.current = false;
  };

  // ================================
  // PELLIZCO CON DOS DEDOS (celular)
  // ================================
  const distanciaEntreDedos = (touches) => {
    const [a, b] = touches;
    const dx = a.clientX - b.clientX;
    const dy = a.clientY - b.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const handleTouchStart = (e) => {
    if (e.touches.length === 2) {
      // Empieza un pellizco de dos dedos.
      lastPinchDistRef.current = distanciaEntreDedos(e.touches);
    } else if (e.touches.length === 1 && scale > 1) {
      // Un solo dedo, arrastrando la foto ya ampliada.
      draggingRef.current = true;
      lastPointRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
    }
  };

  const handleTouchMove = (e) => {
    if (e.touches.length === 2 && lastPinchDistRef.current) {
      e.preventDefault();
      const nuevaDistancia = distanciaEntreDedos(e.touches);
      const factor = nuevaDistancia / lastPinchDistRef.current;
      lastPinchDistRef.current = nuevaDistancia;

      setScale((s) => {
        const limitado = clampScale(s * factor);
        if (limitado === 1) setPos({ x: 0, y: 0 });
        return limitado;
      });
    } else if (e.touches.length === 1 && draggingRef.current) {
      e.preventDefault();
      const dx = e.touches[0].clientX - lastPointRef.current.x;
      const dy = e.touches[0].clientY - lastPointRef.current.y;
      lastPointRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
      setPos((p) => ({ x: p.x + dx, y: p.y + dy }));
    }
  };

  const handleTouchEnd = (e) => {
    if (e.touches.length < 2) {
      lastPinchDistRef.current = null;
    }
    if (e.touches.length === 0) {
      draggingRef.current = false;
    }
  };

  return (
    <div className="modal-overlay" onClick={() => setOpenModal(false)}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={() => setOpenModal(false)}>
          <FaTimes />
        </button>

        <div
          className="image-container"
          onContextMenu={(e) => e.preventDefault()}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{ touchAction: "none" }}
        >
          <img
            src={gallery[current]}
            className="main-image"
            alt=""
            draggable={false}
            style={{
              transform: `translate(${pos.x}px, ${pos.y}px) scale(${scale})`,
              transition: draggingRef.current ? "none" : "transform 0.15s ease",
              cursor: scale > 1 ? "grab" : "default",
            }}
          />

          <div className="watermark">Las_Toninas</div>
        </div>

        <button
          className="zoom-btn"
          onClick={toggleZoomBoton}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
            margin: "10px auto",
            padding: "8px 16px",
            border: "none",
            borderRadius: "20px",
            background: "rgba(0,0,0,0.6)",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          {scale > 1 ? <FaSearchMinus /> : <FaSearchPlus />}
          {scale > 1 ? "Alejar" : "Zoom"}
        </button>

        <div className="thumbs">
          {gallery.map((img, index) => (
            <img
              key={index}
              src={img}
              alt=""
              className={`thumb ${current === index ? "active" : ""}`}
              onClick={() => setCurrent(index)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
