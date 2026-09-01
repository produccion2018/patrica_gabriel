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
        // Armamos la URL de la foto subida.
        // Ahora las imágenes se suben a Cloudinary y ya vienen como
        // URL completa (https://res.cloudinary.com/...). Si en cambio
        // es un path viejo (/uploads/...) le agregamos el API_URL
        // adelante, para no romper propiedades que todavía no
        // resubieron su foto después de la migración.
        const imageSrc = propiedad.imagen
          ? propiedad.imagen.startsWith("http")
            ? propiedad.imagen
            : `${API_URL}${propiedad.imagen}`
          : "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=1200";

        // Características por casa, según su ID
        let caracteristicas = "2 Habitaciones • Jardín • Cochera • 5 Personas";
        if (propiedad.id === 1)
          caracteristicas =
            "Calle 46 Nº 445 entre 7 y 9 • 2 dormitorios • 2 baños";
        if (propiedad.id === 2)
          caracteristicas =
            "Costanera 2169 entre 46 y 48 • 2 dormitorios • 1 baño";
        if (propiedad.id === 3)
          caracteristicas =
            "Calle 13 Nº 1836 entre 40 y 42 • 2 dormitorios • 1 baño";
        if (propiedad.id === 4)
          caracteristicas =
            "Av. Canadá 160 • 3 dormitorios · 4 ambientes • 1 baño";

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
