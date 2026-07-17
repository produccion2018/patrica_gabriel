import { useEffect, useState } from "react";
import "./AdminPremiumHouses.css";
import { API_URL } from "../../config/api";

function AdminPremiumHouses() {
  const [propiedades, setPropiedades] = useState([]);

  // Buscamos las propiedades reales de la base de datos
  useEffect(() => {
    fetch(`${API_URL}/api/propiedades`)
      .then((res) => res.json())
      .then((data) => {
        setPropiedades(data);
      })
      .catch((error) => {
        console.error("Error cargando propiedades en el panel:", error);
      });
  }, []);

  return (
    <div className="gabriel-premium-houses">
      {propiedades.map((propiedad) => {
        // Armamos la URL de la foto subida
        const imageSrc = propiedad.imagen
          ? `${API_URL}${propiedad.imagen}`
          : "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=1200";

        // Mantenemos las características fijas originales según el ID de la casa
        let caracteristicas = "Jardín • Cochera • 5 Personas";
        if (propiedad.id === 1)
          caracteristicas = "4 Habitaciones • 2 Baños • Wifi";
        if (propiedad.id === 2)
          caracteristicas = "3 Habitaciones • Parrilla • Wifi";

        return (
          <div className="gabriel-premium-card" key={propiedad.id}>
            <img src={imageSrc} alt={propiedad.nombre} />

            <div className="gabriel-premium-content">
              <div>
                <h3>{propiedad.nombre}</h3>
                <p>{caracteristicas}</p>
              </div>

              {/* Ahora las tres muestran "Activa" en verde de forma limpia */}
              <span className="premium-status available">Activa</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default AdminPremiumHouses;
