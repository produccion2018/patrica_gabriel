import "./CarruselModal.css";
import { FaTimes } from "react-icons/fa";
import { useState, useEffect } from "react";

export default function CarruselModal({ openModal, setOpenModal, gallery }) {
  const [current, setCurrent] = useState(0);

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
          />

          <div className="watermark">Las_Toninas</div>
        </div>

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
