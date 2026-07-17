import { useEffect, useState } from "react";
import "./ComentariosPublicos.css";
import { API_URL } from "../config/api";

export default function ComentariosPublicos() {
  const [comentarios, setComentarios] = useState([]);
  const [nombre, setNombre] = useState("");
  const [comentario, setComentario] = useState("");
  const [estrellas, setEstrellas] = useState(5);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    cargar();
  }, []);

  const cargar = async () => {
    try {
      const res = await fetch(`${API_URL}/api/comentarios-publicos`);
      const data = await res.json();

      setComentarios(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error cargando comentarios:", error);
    }
  };

  // Carrusel automático
  useEffect(() => {
    if (comentarios.length <= 1) return;

    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % comentarios.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [comentarios]);

  const enviarComentario = async () => {
    if (!nombre.trim() || !comentario.trim()) return;

    try {
      await fetch(`${API_URL}/api/comentarios`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nombre,
          comentario,
          estrellas,
        }),
      });

      setNombre("");
      setComentario("");
      setEstrellas(5);

      await cargar();
    } catch (error) {
      console.error("Error enviando comentario:", error);
    }
  };

  const actual = comentarios[index];

  return (
    <section className="comentarios-publicos" id="comentarios">
      <div className="comentarios-container">
        <span className="comentarios-mini-title">
          Opiniones de nuestros huéspedes
        </span>

        <h2>Lo que dicen nuestros clientes</h2>

        {/* FORMULARIO */}
        <div className="comentario-form">
          <input
            type="text"
            placeholder="Tu nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />

          <textarea
            placeholder="Escribe tu experiencia..."
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
          />

          {/* ESTRELLAS */}
          <div className="rating-selector">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                className={`star-btn ${n <= estrellas ? "active" : ""}`}
                onClick={() => setEstrellas(n)}
              >
                ⭐
              </button>
            ))}
          </div>

          <button onClick={enviarComentario}>Enviar opinión</button>
        </div>

        {/* CARRUSEL */}
        {actual && (
          <div className="comentario-carrusel">
            <div className="comentario-card animated" key={actual.id}>
              <div className="estrellas">
                {"⭐".repeat(actual.estrellas || 5)}
              </div>

              <p className="texto">"{actual.comentario}"</p>

              <h4>{actual.nombre}</h4>
            </div>
          </div>
        )}

        {/* DOTS */}
        {comentarios.length > 1 && (
          <div className="dots">
            {comentarios.map((_, i) => (
              <span
                key={i}
                className={i === index ? "dot active" : "dot"}
                onClick={() => setIndex(i)}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
