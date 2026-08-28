import "./CarruselModal.css";
import { FaTimes, FaSearchPlus, FaSearchMinus } from "react-icons/fa";
import { useState, useEffect } from "react";

export default function CarruselModal({ openModal, setOpenModal, gallery }) {
  const [current, setCurrent] = useState(0);
  const [zoomed, setZoomed] = useState(false); // 👈 nuevo estado para el zoom

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

  // Si cambio de foto o cierro el modal, reseteo el zoom
  useEffect(() => {
    setZoomed(false);
  }, [current, openModal]);

  if (!openModal) return null;

  return (
    <div className="modal-overlay" onClick={() => setOpenModal(false)}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={() => setOpenModal(false)}>
          <FaTimes />
        </button>

        <div
          className="image-container"
          onContextMenu={(e) => e.preventDefault()}
        >
          <img
            src={gallery[current]}
            className="main-image"
            alt=""
            draggable={false}
            style={{
              transform: zoomed ? "scale(1.8)" : "scale(1)",
              transition: "transform 0.25s ease",
              cursor: zoomed ? "zoom-out" : "zoom-in",
            }}
            onClick={(e) => {
              e.stopPropagation();
              setZoomed((z) => !z);
            }}
          />

          <div className="watermark">Las_Toninas</div>
        </div>

        <button
          className="zoom-btn"
          onClick={(e) => {
            e.stopPropagation();
            setZoomed((z) => !z);
          }}
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
          {zoomed ? <FaSearchMinus /> : <FaSearchPlus />}
          {zoomed ? "Alejar" : "Zoom"}
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
