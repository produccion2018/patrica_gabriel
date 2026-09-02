// ================================
// PRIMERA PARTE
// IMPORTS + ESTADOS + CASAS
// ================================
import collage1_1 from "../assets/Carrusel/collage1/collage1.jpg";

import collage2_1 from "../assets/Carrusel/collage2/collage2.jpg";
import collage2_2 from "../assets/Carrusel/collage2/collage3.jpg";
import collage2_3 from "../assets/Carrusel/collage2/collage4.jpg"; //

import collage3_1 from "../assets/Carrusel/collage3/collage1.jpg";
import collage3_2 from "../assets/Carrusel/collage3/collage2.jpg";
import collage3_3 from "../assets/Carrusel/collage3/collage3.jpg";

import collage4_portada from "../assets/casa4.jpg";
import collage4_1 from "../assets/Carrusel/collage4/collage1.jpeg";

import "./Casas.css";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import CarruselModal from "./CarruselModal";

import { API_URL } from "../config/api";
import {
  FaBed,
  FaBath,
  FaWifi,
  FaCar,
  FaPaw,
  FaArrowRight,
  FaMapMarkerAlt,
  FaHeart,
  FaUmbrellaBeach,
  FaUsers,
  FaMountain,
} from "react-icons/fa";

// Cada cuántos milisegundos se vuelve a pedir la lista de propiedades
// en segundo plano, para que la página pública se actualice sola sin
// que el usuario tenga que apretar F5.
const INTERVALO_ACTUALIZACION_MS = 8000;

// ================================
// DETALLES FIJOS POR PROPIEDAD
// (lo que no viene de la base de datos: ubicación, badge, ambientes, etc.)
// Para sumar una casa nueva a futuro, solo hay que agregar una entrada
// acá con el mismo id que tenga la fila en la tabla "propiedades".
// ================================
const detallesPorId = {
  1: {
    badge: "CON PILETA",
    location: "Calle 46 Nº 445 entre 7 y 9",
    guests: "5/6 personas",
    rooms: "2 dormitorios",
    bath: "2 baños",
    extras: ["Cochera", "WiFi", "Apta mascotas"],
  },
  2: {
    badge: "FRENTE AL MAR",
    location: "Costanera 2169 entre 46 y 48",
    guests: "5/6 personas",
    rooms: "2 dormitorios",
    bath: "1 baño",
    extras: ["Cochera", "WiFi", "Apta mascotas"],
  },
  3: {
    badge: "CASA CON GRAN PARQUE",
    location: "Calle 13 Nº 1836 entre 40 y 42",
    guests: "5/6 personas",
    rooms: "2 dormitorios",
    bath: "1 baño",
    extras: ["Cochera", "WiFi", "Apta mascotas"],
  },
  4: {
    badge: "PERICO, JUJUY",
    location: "Av. Canadá 160 entre Santiago del Estero y Buenos Aires",
    guests: "Por habitación (doble o simple)",
    rooms: "3 dormitorios · 4 ambientes",
    bath: "1 baño",
    extras: ["Cochera (2 autos)", "WiFi", "Apta mascotas"],
    highlight: "A 14 minutos del aeropuerto",
    // Foto propia mientras el backend no tenga una cargada todavía
    // (se usa como respaldo más abajo, en "image").
    fallbackImage: collage4_portada,
    // Marca esta propiedad como fuera de Las Toninas, para que se
    // muestre en su propia sección aparte y no se confunda con las
    // demás (ver "otraZona" más abajo).
    otraZona: true,
  },
};

// Detalles genéricos por si en el futuro se agrega una propiedad
// nueva en la base de datos antes de cargar su entrada acá arriba —
// así la card no se rompe, solo se ve más simple hasta completarla.
const detallesPorDefecto = {
  badge: "ALOJAMIENTO",
  location: "",
  guests: "",
  rooms: "",
  bath: "",
  extras: ["Cochera", "WiFi", "Apta mascotas"],
};

export default function Casas({ language }) {
  const navigate = useNavigate();

  const [openModal, setOpenModal] = useState(false);
  const [gallery, setGallery] = useState([]);

  const [favorites, setFavorites] = useState([]);

  // ================================
  // PROPIEDADES DESDE BACKEND
  // ================================

  const [propiedades, setPropiedades] = useState([]);

  useEffect(() => {
    const cargarPropiedades = () => {
      fetch(`${API_URL}/api/propiedades`)
        .then((res) => res.json())
        .then((data) => {
          setPropiedades(data);
        })
        .catch((error) => {
          console.error("Error cargando propiedades:", error);
        });
    };

    // Carga inicial al entrar a la página
    cargarPropiedades();

    // Y a partir de ahí, se repite sola cada X segundos en segundo
    // plano, así cualquier cambio hecho desde el panel (precio,
    // promoción, imagen) aparece acá sin que haga falta F5.
    const intervalo = setInterval(
      cargarPropiedades,
      INTERVALO_ACTUALIZACION_MS,
    );

    return () => clearInterval(intervalo);
  }, []);

  // ================================
  // GALERÍAS
  // ================================

  const galleries = {
    1: [collage1_1],
    2: [collage2_1, collage2_2, collage2_3],
    3: [collage3_1, collage3_2, collage3_3],
    4: [collage4_portada, collage4_1],
  };

  const handleOpenGallery = (id) => {
    setGallery(galleries[id] || []);
    setOpenModal(true);
  };

  // ================================
  // CASAS
  // AQUÍ SE CONECTA CON MYSQL/SQLITE
  // ================================

  const houses = propiedades.map((propiedad) => {
    const detalles = detallesPorId[propiedad.id] || detallesPorDefecto;

    return {
      id: propiedad.id,
      title: propiedad.nombre,
      price: propiedad.precio,
      promocion: propiedad.promocion,
      // Antes las imágenes se guardaban como paths relativos
      // (ej: "/uploads/foto.jpg") y había que pegarles el API_URL
      // adelante. Ahora, con Cloudinary, "propiedad.imagen" ya viene
      // como una URL completa (https://res.cloudinary.com/...), así
      // que hay que usarla tal cual y NO agregarle nada adelante.
      // Se dejan las dos formas por compatibilidad con imágenes
      // viejas que hayan quedado con el path relativo.
      image: propiedad.imagen
        ? propiedad.imagen.startsWith("http")
          ? propiedad.imagen
          : `${API_URL}${propiedad.imagen}`
        : detalles.fallbackImage || "",
      badge: detalles.badge,
      location: detalles.location,
      guests: detalles.guests,
      rooms: detalles.rooms,
      bath: detalles.bath,
      extras: detalles.extras,
      highlight: detalles.highlight || "",
      otraZona: detalles.otraZona || false,
    };
  });

  // Separamos: las casas de Las Toninas van en la grilla principal,
  // y las de otras provincias (por ahora, Jujuy) van en su propia
  // sección aparte más abajo, para que no se mezclen ni confundan.
  const housesLasToninas = houses.filter((h) => !h.otraZona);
  const housesOtrasZonas = houses.filter((h) => h.otraZona);

  // Tarjeta de una casa — reutilizada tanto en la grilla principal
  // como en la sección de otras zonas, para no duplicar el JSX.
  const renderHouseCard = (house) => (
    <div className="house-card" key={house.id}>
      <div className="image-wrapper">
        <img
          src={
            house.image
              ? house.image
              : "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=1200"
          }
          alt={house.title}
          className="house-image"
        />

        <span className="badge">{house.badge}</span>

        <button
          className="fav-btn"
          onClick={() =>
            setFavorites((prev) =>
              prev.includes(house.id)
                ? prev.filter((id) => id !== house.id)
                : [...prev, house.id],
            )
          }
        >
          <FaHeart
            color={favorites.includes(house.id) ? "#ef4444" : "#9ca3af"}
          />
        </button>
      </div>

      <div className="house-content">
        <h3>{house.title}</h3>

        <div className="location">
          <FaMapMarkerAlt />
          <span>{house.location}</span>
        </div>

        <div className="details">
          <div>
            <FaUsers />
            <span>{house.guests}</span>
          </div>
          <div>
            <FaBed />
            <span>{house.rooms}</span>
          </div>
          <div>
            <FaBath />
            <span>{house.bath}</span>
          </div>
        </div>

        <div className="extras">
          <div>
            <FaCar />
            <span>{house.extras[0]}</span>
          </div>
          <div>
            <FaWifi />
            <span>{house.extras[1]}</span>
          </div>
          <div>
            <FaPaw />
            <span>{house.extras[2]}</span>
          </div>
        </div>

        <div className="bottom">
          <div className="price">
            <span>{language === "es" ? "Desde" : "From"}</span>
            <h4>{house.price}</h4>
            <p>{language === "es" ? "por noche" : "per night"}</p>
            <small>{house.promocion}</small>
          </div>

          <button
            className="more-btn"
            onClick={() => handleOpenGallery(house.id)}
          >
            {language === "es" ? "Ver más" : "View more"}
            <FaArrowRight />
          </button>
        </div>
      </div>
    </div>
  );

  // ================================
  // SEGUNDA PARTE
  // RETURN + DISEÑO + CARDS
  // ================================

  return (
    <section className="houses-section" id="casas">
      <div className="houses-container">
        <div className="houses-top">
          <div>
            <span className="mini-title">
              {language === "es"
                ? "Alojamientos Premium"
                : language === "pt"
                  ? "Hospedagens Premium"
                  : "Premium Accommodations"}
            </span>

            <h2>
              {language === "es"
                ? "Nuestras Casas"
                : language === "pt"
                  ? "Nossas Casas"
                  : "Our Houses"}
            </h2>
          </div>

          <button className="view-all" onClick={() => navigate("/propiedades")}>
            {language === "es"
              ? "Ver todas las casas"
              : language === "pt"
                ? "Ver todas as casas"
                : "View all houses"}
            <FaArrowRight />
          </button>
        </div>

        <div className="houses-grid">
          {housesLasToninas.map((house) => renderHouseCard(house))}
        </div>

        {housesOtrasZonas.length > 0 && (
          <div className="otras-zonas-section">
            <div className="otras-zonas-bg" aria-hidden="true">
              <svg viewBox="0 0 1200 120" preserveAspectRatio="none">
                <path
                  d="M0,90 L120,55 L230,80 L340,30 L460,70 L580,20 L700,65 L820,35 L940,75 L1060,40 L1200,85 L1200,120 L0,120 Z"
                  fill="currentColor"
                />
              </svg>
            </div>

            <div className="otras-zonas-eyebrow">
              <FaMountain />
              <span>
                {language === "es"
                  ? "Otra provincia"
                  : language === "pt"
                    ? "Outra província"
                    : "Different province"}
              </span>
            </div>

            <div className="otras-zonas-titles">
              <h3>
                {language === "es"
                  ? "También tenemos alojamiento en Jujuy"
                  : language === "pt"
                    ? "Também temos hospedagem em Jujuy"
                    : "We also have a place to stay in Jujuy"}
              </h3>
              <p>
                {language === "es"
                  ? "Ojo: esta propiedad no está en Las Toninas — se encuentra en Jujuy, al norte de Argentina."
                  : language === "pt"
                    ? "Atenção: esta propriedade não fica em Las Toninas — está em Jujuy, no norte da Argentina."
                    : "Note: this property is not in Las Toninas — it's located in Jujuy, northern Argentina."}
              </p>
            </div>

            {housesOtrasZonas.map((house) => (
              <div className="otra-zona-feature" key={house.id}>
                <div className="otra-zona-feature-img">
                  <img
                    src={
                      house.image ||
                      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=1200"
                    }
                    alt={house.title}
                  />
                  <span className="otra-zona-badge">{house.badge}</span>
                </div>

                <div className="otra-zona-feature-info">
                  <h4>{house.title}</h4>

                  <div className="otra-zona-location">
                    <FaMapMarkerAlt />
                    <span>{house.location}</span>
                  </div>

                  {house.highlight && (
                    <div className="otra-zona-highlight">
                      ✈️ {house.highlight}
                    </div>
                  )}

                  <div className="otra-zona-chips">
                    <span className="otra-zona-chip">
                      <FaUsers /> {house.guests}
                    </span>
                    <span className="otra-zona-chip">
                      <FaBed /> {house.rooms}
                    </span>
                    <span className="otra-zona-chip">
                      <FaBath /> {house.bath}
                    </span>
                    <span className="otra-zona-chip">
                      <FaCar /> {house.extras[0]}
                    </span>
                    <span className="otra-zona-chip">
                      <FaWifi /> {house.extras[1]}
                    </span>
                    <span className="otra-zona-chip">
                      <FaPaw /> {house.extras[2]}
                    </span>
                  </div>

                  <div className="otra-zona-bottom">
                    <div className="price">
                      <span>{language === "es" ? "Desde" : "From"}</span>
                      <h4>{house.price}</h4>
                      <p>{language === "es" ? "por noche" : "per night"}</p>
                      <small>{house.promocion}</small>
                    </div>

                    <button
                      className="more-btn otra-zona-btn"
                      onClick={() => handleOpenGallery(house.id)}
                    >
                      {language === "es" ? "Ver más" : "View more"}
                      <FaArrowRight />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="benefits-section">
          <div className="benefit-card">
            <FaUsers />
            <span>Ideal para familias</span>
          </div>
          <div className="benefit-card">
            <FaPaw />
            <span>Pet Friendly</span>
          </div>
          <div className="benefit-card">
            <FaWifi />
            <span>WiFi Gratis</span>
          </div>
          <div className="benefit-card">
            <FaCar />
            <span>Cochera Privada</span>
          </div>
          <div className="benefit-card">
            <FaUmbrellaBeach />
            <span>Cerca del mar</span>
          </div>
        </div>
      </div>

      <CarruselModal
        openModal={openModal}
        setOpenModal={setOpenModal}
        gallery={gallery}
      />
    </section>
  );
}
