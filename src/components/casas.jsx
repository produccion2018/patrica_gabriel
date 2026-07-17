// ================================
// PRIMERA PARTE
// IMPORTS + ESTADOS + CASAS
// ================================
import collage1_1 from "../assets/Carrusel/collage1/collage1.jpg";

import collage2_1 from "../assets/Carrusel/collage2/collage2.jpg";
import collage2_2 from "../assets/Carrusel/collage2/collage3.jpg";

import collage3_1 from "../assets/Carrusel/collage3/collage1.jpg";
import collage3_2 from "../assets/Carrusel/collage3/collage2.jpg";

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
} from "react-icons/fa";

// Cada cuántos milisegundos se vuelve a pedir la lista de propiedades
// en segundo plano, para que la página pública se actualice sola sin
// que el usuario tenga que apretar F5.
const INTERVALO_ACTUALIZACION_MS = 8000;

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
    2: [collage2_1, collage2_2],
    3: [collage3_1, collage3_2],
  };

  const handleOpenGallery = (id) => {
    setGallery(galleries[id]);
    setOpenModal(true);
  };

  // ================================
  // CASAS
  // AQUÍ SE CONECTA CON MYSQL/SQLITE
  // ================================

  const houses = propiedades.map((propiedad) => ({
    id: propiedad.id,
    title: propiedad.nombre,
    price: propiedad.precio,
    promocion: propiedad.promocion,
    image: propiedad.imagen ? `${API_URL}${propiedad.imagen}` : "",
    badge:
      propiedad.id === 1
        ? "CON PILETA"
        : propiedad.id === 2
          ? "FRENTE AL MAR"
          : "CASA FAMILIAR",
    location:
      propiedad.id === 1
        ? "Calle 46 Nº 445 entre 7 y 9"
        : propiedad.id === 2
          ? "Costanera 2169 entre 46 y 48"
          : "Calle 13 Nº 1836 entre 40 y 42",
    guests: "5/6 personas",
    rooms: "2 dormitorios",
    bath: propiedad.id === 1 ? "2 baños" : "1 baño",
    extras: ["Cochera", "WiFi", "Apta mascotas"],
  }));

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
          {houses.map((house) => (
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
          ))}
        </div>

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
