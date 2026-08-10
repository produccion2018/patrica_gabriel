import { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import "./AdminComentarios.css";
import { apiFetch } from "../../utils/apiFetch";

function Comentarios() {
  const [comentarios, setComentarios] = useState([]);
  const [pagina, setPagina] = useState(1);

  const comentariosPorPagina = 8;

  useEffect(() => {
    cargarComentarios();
  }, []);

  const cargarComentarios = async () => {
    try {
      const res = await apiFetch("/api/comentarios");
      if (!res) return;

      const data = await res.json();
      setComentarios(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error cargando comentarios:", error);
      setComentarios([]);
    }
  };

  const ocultarComentario = async (id) => {
    try {
      const res = await apiFetch(`/api/comentarios/${id}/ocultar`, {
        method: "PUT",
      });
      if (!res) return;

      await cargarComentarios();

      Swal.fire({
        icon: "success",
        title: "Comentario ocultado",
        text: "El comentario ya no será visible públicamente.",
        confirmButtonColor: "#0f172a",
      });
    } catch (error) {
      console.error(error);
    }
  };

  const mostrarComentario = async (id) => {
    try {
      const res = await apiFetch(`/api/comentarios/${id}/mostrar`, {
        method: "PUT",
      });
      if (!res) return;

      await cargarComentarios();

      Swal.fire({
        icon: "success",
        title: "Comentario publicado",
        text: "El comentario volvió a ser visible.",
        confirmButtonColor: "#0f172a",
      });
    } catch (error) {
      console.error(error);
    }
  };

  const eliminarComentario = async (id) => {
    const result = await Swal.fire({
      title: "¿Eliminar comentario?",
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#64748b",
    });

    if (!result.isConfirmed) return;

    try {
      const res = await apiFetch(`/api/comentarios/${id}`, {
        method: "DELETE",
      });
      if (!res) return;

      await cargarComentarios();

      Swal.fire({
        icon: "success",
        title: "Comentario eliminado",
        text: "El comentario fue eliminado correctamente.",
        confirmButtonColor: "#0f172a",
      });
    } catch (error) {
      console.error(error);

      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo eliminar el comentario.",
      });
    }
  };

  const renderEstrellas = (cantidad) => {
    return "⭐".repeat(cantidad || 5);
  };

  const totalPaginas = Math.ceil(comentarios.length / comentariosPorPagina);

  const comentariosPaginados = useMemo(() => {
    const inicio = (pagina - 1) * comentariosPorPagina;

    return comentarios.slice(inicio, inicio + comentariosPorPagina);
  }, [comentarios, pagina]);

  return (
    <div className="comentarios-admin-container">
      <div className="comentarios-header">
        <div>
          <h1 className="comentarios-title">Comentarios de Clientes</h1>

          <p className="comentarios-subtitle">
            Gestiona las opiniones de los huéspedes, oculta o elimina
            comentarios y mantén la reputación de tu sitio.
          </p>
        </div>

        <div className="comentarios-resumen">
          <span>Total: {comentarios.length}</span>
        </div>
      </div>

      {comentarios.length === 0 ? (
        <div className="comentarios-vacio">
          Todavía no hay comentarios de clientes.
        </div>
      ) : (
        <>
          <div className="comentarios-grid">
            {comentariosPaginados.map((comentario) => (
              <div
                key={comentario.id}
                className={`comentario-admin-card ${
                  comentario.visible ? "visible" : "oculto"
                }`}
              >
                <div className="comentario-top">
                  <div>
                    <h3>{comentario.nombre}</h3>

                    <div className="comentario-estrellas">
                      {renderEstrellas(comentario.estrellas)}
                    </div>
                  </div>

                  <span
                    className={`estado-comentario ${
                      comentario.visible ? "publico" : "privado"
                    }`}
                  >
                    {comentario.visible ? "Visible" : "Oculto"}
                  </span>
                </div>

                <p className="comentario-texto">{comentario.comentario}</p>

                <div className="comentario-acciones">
                  {comentario.visible ? (
                    <button
                      className="btn-comentario btn-ocultar"
                      onClick={() => ocultarComentario(comentario.id)}
                    >
                      Ocultar
                    </button>
                  ) : (
                    <button
                      className="btn-comentario btn-mostrar"
                      onClick={() => mostrarComentario(comentario.id)}
                    >
                      Mostrar
                    </button>
                  )}

                  <button
                    className="btn-comentario btn-eliminar"
                    onClick={() => eliminarComentario(comentario.id)}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>

          {totalPaginas > 1 && (
            <div className="comentarios-paginacion">
              <button
                className="pagina-btn"
                disabled={pagina === 1}
                onClick={() => setPagina((p) => p - 1)}
              >
                ←
              </button>

              {Array.from({ length: totalPaginas }, (_, i) => i + 1).map(
                (numero) => (
                  <button
                    key={numero}
                    className={`pagina-btn ${
                      pagina === numero ? "activa" : ""
                    }`}
                    onClick={() => setPagina(numero)}
                  >
                    {numero}
                  </button>
                ),
              )}

              <button
                className="pagina-btn"
                disabled={pagina === totalPaginas}
                onClick={() => setPagina((p) => p + 1)}
              >
                →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Comentarios;
