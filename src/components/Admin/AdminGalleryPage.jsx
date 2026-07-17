import { useEffect, useState } from "react";
import "./AdminGalleryPage.css";
import { API_URL } from "../../config/api";

const dotColors = ["#3b82f6", "#14b8a6", "#a855f7", "#f97316", "#ec4899"];

function AdminGalleryPage() {
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
    <div className="gallery2-panel">
      <div className="gallery2-header">
        <h2>Galería de Propiedades</h2>
        <p>Gestioná precios, promociones e imágenes de cada propiedad</p>
      </div>

      <div className="gallery2-grid">
        {propiedades.map((propiedad, index) => (
          <div className="gallery2-card" key={propiedad.id}>
            <img
              src={
                propiedad.imagen
                  ? `${API_URL}${propiedad.imagen}`
                  : "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=1200"
              }
              alt={propiedad.nombre}
              className="gallery2-card-img"
            />

            <div className="gallery2-card-body">
              <div className="gallery2-card-title">
                <span
                  className="gallery2-dot"
                  style={{ background: dotColors[index % dotColors.length] }}
                ></span>
                <h4>
                  {propiedad.id === 3 ? "Casa Familiar" : propiedad.nombre}
                </h4>
              </div>

              {editando === propiedad.id ? (
                <div className="gallery2-edit-box">
                  <div className="gallery2-field">
                    <label>Precio</label>
                    <input
                      value={precio}
                      onChange={(e) => setPrecio(e.target.value)}
                      placeholder="Ej: $150.000"
                    />
                  </div>

                  <div className="gallery2-field">
                    <label>Promoción</label>
                    <textarea
                      value={promocion}
                      onChange={(e) => setPromocion(e.target.value)}
                      placeholder="Escribí acá la promoción completa: qué incluye, condiciones, fechas válidas, descuentos..."
                      rows={6}
                    />
                  </div>

                  <div className="gallery2-field">
                    <label>Imagen</label>
                    <label className="gallery2-file-label">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setImagen(e.target.files[0])}
                      />
                      <span>Adjuntar imagen</span>
                    </label>
                    {imagen && (
                      <p className="gallery2-file-name">📷 {imagen.name}</p>
                    )}
                  </div>

                  <div className="gallery2-actions">
                    <button
                      className="gallery2-save-btn"
                      onClick={() => guardarCambios(propiedad.id)}
                    >
                      Guardar
                    </button>
                    <button
                      className="gallery2-cancel-btn"
                      onClick={cancelarEdicion}
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="gallery2-subtext">
                    {propiedad.reservasMes ?? 0} reservas este mes
                  </p>
                  {propiedad.promocion && (
                    <p className="gallery2-promo-preview">
                      {propiedad.promocion}
                    </p>
                  )}
                  <a
                    href="#"
                    className="gallery2-link"
                    onClick={(e) => {
                      e.preventDefault();
                      abrirGestion(propiedad);
                    }}
                  >
                    Editar propiedad →
                  </a>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminGalleryPage;
