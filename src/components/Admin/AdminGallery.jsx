import { useEffect, useState } from "react";
import "./AdminGallery.css";
import { API_URL } from "../../config/api";

// Colores de los puntitos por propiedad (mismo criterio que tu dashboard original)
const dotColors = ["#3b82f6", "#14b8a6", "#a855f7", "#f97316", "#ec4899"];

function AdminGallery() {
  const [propiedades, setPropiedades] = useState([]);
  const [editando, setEditando] = useState(null);
  const [precio, setPrecio] = useState("");
  const [promocion, setPromocion] = useState("");
  const [imagen, setImagen] = useState(null);

  const cargarPropiedades = () => {
    fetch(`${API_URL}/api/propiedades`)
      .then((res) => res.json())
      .then((data) => setPropiedades(data))
      .catch((error) => console.error("Error cargando propiedades:", error));
  };

  useEffect(() => {
    cargarPropiedades();
  }, []);

  const abrirGestion = (propiedad) => {
    setEditando(propiedad.id);
    setPrecio(propiedad.precio || "");
    setPromocion(propiedad.promocion || "");
    setImagen(null);
  };

  const cancelarEdicion = () => {
    setEditando(null);
    setPrecio("");
    setPromocion("");
    setImagen(null);
  };

  const subirImagen = async () => {
    const formData = new FormData();
    formData.append("imagen", imagen);
    const respuesta = await fetch(`${API_URL}/api/upload`, {
      method: "POST",
      body: formData,
    });
    const data = await respuesta.json();
    return data.imagen;
  };

  const guardarCambios = async (id) => {
    try {
      const propiedadActual = propiedades.find((p) => p.id === id);
      let rutaImagen = propiedadActual?.imagen || null;
      if (imagen) rutaImagen = await subirImagen();
      await fetch(`${API_URL}/api/propiedades/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ precio, promocion, imagen: rutaImagen }),
      });
      setEditando(null);
      setImagen(null);
      cargarPropiedades();
    } catch (error) {
      console.error("Error actualizando propiedad:", error);
    }
  };

  return (
    <div className="gallery-panel">
      <div className="gallery-panel-header">
        <div>
          <h3>Propiedades</h3>
        </div>
      </div>

      <div className="gallery-list">
        {propiedades.map((propiedad, index) => (
          <div className="gallery-card" key={propiedad.id}>
            <img
              src={
                propiedad.imagen
                  ? `${API_URL}${propiedad.imagen}`
                  : "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=1200"
              }
              alt={propiedad.nombre}
              className="gallery-card-img"
            />

            <div className="gallery-card-body">
              <div className="gallery-card-info">
                <div
                  className="gallery-dot"
                  style={{ background: dotColors[index % dotColors.length] }}
                ></div>
                <div className="gallery-card-text">
                  <h4>
                    {propiedad.id === 3 ? "Casa Familiar" : propiedad.nombre}
                  </h4>

                  {editando === propiedad.id ? (
                    <div className="gallery-edit-box">
                      <div className="gallery-field">
                        <label>Precio</label>
                        <input
                          value={precio}
                          onChange={(e) => setPrecio(e.target.value)}
                          placeholder="Ej: $150.000"
                        />
                      </div>
                      <div className="gallery-field">
                        <label>Promoción</label>
                        <input
                          value={promocion}
                          onChange={(e) => setPromocion(e.target.value)}
                          placeholder="Ej: Disfruta tus vacaciones en familia"
                        />
                      </div>
                      <div className="gallery-field">
                        <label>Imagen</label>
                        <label className="gallery-file-label">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setImagen(e.target.files[0])}
                          />
                          <span>Adjuntar imagen</span>
                        </label>
                        {imagen && (
                          <p className="gallery-file-name">📷 {imagen.name}</p>
                        )}
                      </div>
                      <div className="gallery-actions">
                        <button
                          className="gallery-save-btn"
                          onClick={() => guardarCambios(propiedad.id)}
                        >
                          Guardar
                        </button>
                        <button
                          className="gallery-cancel-btn"
                          onClick={cancelarEdicion}
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="gallery-subtext">
                        {propiedad.reservasMes ?? 0} reservas este mes
                      </p>
                      <a
                        href="#"
                        className="gallery-link"
                        onClick={(e) => {
                          e.preventDefault();
                          abrirGestion(propiedad);
                        }}
                      >
                        Ver detalles →
                      </a>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminGallery;
