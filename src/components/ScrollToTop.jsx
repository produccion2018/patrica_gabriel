import { useState, useEffect } from "react";
import "./ScrollToTop.css";

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  // Detecta el scroll para mostrar el botón solo cuando el usuario baja en la página
  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth", // Desplazamiento suave y elegante
    });
  };

  return (
    <>
      {isVisible && (
        <button
          className="pwb-scroll-top-btn"
          onClick={scrollToTop}
          aria-label="Subir al inicio"
        >
          <svg viewBox="0 0 24 24" className="pwb-scroll-top-svg">
            <path
              fill="currentColor"
              d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z"
            />
          </svg>
        </button>
      )}
    </>
  );
}
