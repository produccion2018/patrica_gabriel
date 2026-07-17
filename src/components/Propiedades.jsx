import "./Propiedades.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FaArrowLeft,
  FaMapMarkerAlt,
  FaWifi,
  FaCar,
  FaPaw,
  FaBed,
  FaBath,
} from "react-icons/fa";

import collage1 from "../assets/Carrusel/collage1/collage1.jpg";
import collage2 from "../assets/Carrusel/collage2/collage2.jpg";
import collage3 from "../assets/Carrusel/collage3/collage1.jpg";

export default function Propiedades() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  // IDIOMA GLOBAL
  const language = localStorage.getItem("language") || "es";

  const text = {
    es: {
      back: "Volver al inicio",
      premium: "EXPERIENCIA PREMIUM",
      title: "Explorá nuestras propiedades",
      subtitle:
        "Casas cómodas, familiares y totalmente equipadas para disfrutar Las Toninas con tranquilidad, confort y cercanía al mar.",

      pool: "CON PILETA",
      sea: "FRENTE AL MAR",
      park: "GRAN PARQUE",

      housePool: "Casa con pileta",
      houseSea: "Casa frente al mar",
      housePark: "Casa con gran parque",

      rooms: "2 dormitorios",
      bath1: "1 baño",
      bath2: "2 baños",

      wifi: "WiFi Gratis",
      garage: "Cochera",
      pet: "Pet Friendly",

      desc1:
        "Espacios amplios, luminosos y diseñados para disfrutar unas vacaciones cómodas en familia a pocos minutos del mar.",

      desc2:
        "Ubicación privilegiada frente al mar, ideal para descansar y disfrutar amaneceres únicos en Las Toninas.",

      desc3:
        "Un entorno tranquilo rodeado de naturaleza para relajarse y disfrutar en familia.",
    },

    en: {
      back: "Back to home",
      premium: "PREMIUM EXPERIENCE",
      title: "Explore our properties",
      subtitle:
        "Comfortable and fully equipped houses to enjoy Las Toninas with peace and comfort near the sea.",

      pool: "WITH POOL",
      sea: "SEA FRONT",
      park: "BIG PARK",

      housePool: "House with pool",
      houseSea: "Sea front house",
      housePark: "House with big park",

      rooms: "2 bedrooms",
      bath1: "1 bathroom",
      bath2: "2 bathrooms",

      wifi: "Free WiFi",
      garage: "Garage",
      pet: "Pet Friendly",

      desc1:
        "Large and bright spaces designed for comfortable family vacations near the sea.",

      desc2:
        "Privileged sea front location to relax and enjoy unique sunrises in Las Toninas.",

      desc3: "A peaceful natural environment to relax and enjoy with family.",
    },

    pt: {
      back: "Voltar ao início",
      premium: "EXPERIÊNCIA PREMIUM",
      title: "Explore nossas propriedades",
      subtitle:
        "Casas confortáveis e totalmente equipadas para aproveitar Las Toninas com tranquilidade e conforto perto do mar.",

      pool: "COM PISCINA",
      sea: "FRENTE AO MAR",
      park: "GRANDE PARQUE",

      housePool: "Casa com piscina",
      houseSea: "Casa frente ao mar",
      housePark: "Casa com grande parque",

      rooms: "2 quartos",
      bath1: "1 banheiro",
      bath2: "2 banheiros",

      wifi: "WiFi Grátis",
      garage: "Garagem",
      pet: "Pet Friendly",

      desc1:
        "Espaços amplos e iluminados para férias confortáveis em família perto do mar.",

      desc2:
        "Localização privilegiada frente ao mar para descansar e aproveitar amanheceres únicos.",

      desc3:
        "Um ambiente tranquilo cercado pela natureza para relaxar em família.",
    },
  };

  const t = text[language];

  return (
    <section className="propiedades-page">
      {/* HERO */}
      <div className="propiedades-hero">
        {/* BOTÓN ÚNICO RESPONSIVE */}
        <div className="back-wrapper">
          {/* DESKTOP */}
          <button
            className="back-btn desktop-only"
            onClick={() => navigate("/")}
          >
            <FaArrowLeft />
            {t.back}
          </button>

          {/* MOBILE */}
          <div className="mobile-only">
            <button
              className="hamburger-btn"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              ☰
            </button>

            {menuOpen && (
              <div className="mobile-menu-dropdown">
                <button
                  onClick={() => {
                    navigate("/");
                    setMenuOpen(false);
                  }}
                >
                  {t.back}
                </button>
              </div>
            )}
          </div>
        </div>

        <span>{t.premium}</span>

        <h1>{t.title}</h1>

        <p>{t.subtitle}</p>
      </div>

      {/* CASA 1 */}
      <div className="property-card">
        <div className="property-gallery">
          <img src={collage1} alt={t.housePool} />
        </div>

        <div className="property-info">
          <span className="property-badge">{t.pool}</span>

          <h2>{t.housePool}</h2>

          <div className="property-location">
            <FaMapMarkerAlt />
            Calle 46 Nº 445 entre 7 y 9
          </div>

          <div className="property-features">
            <div>
              <FaBed />
              <span>{t.rooms}</span>
            </div>

            <div>
              <FaBath />
              <span>{t.bath2}</span>
            </div>

            <div>
              <FaWifi />
              <span>{t.wifi}</span>
            </div>

            <div>
              <FaCar />
              <span>{t.garage}</span>
            </div>

            <div>
              <FaPaw />
              <span>{t.pet}</span>
            </div>
          </div>

          <p className="property-description">{t.desc1}</p>

          <div className="property-map">
            <iframe
              src="https://www.google.com/maps?q=Las+Toninas&output=embed"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Mapa Casa con pileta"
            />
          </div>
        </div>
      </div>

      {/* CASA 2 */}
      <div className="property-card reverse">
        <div className="property-gallery">
          <img src={collage2} alt={t.houseSea} />
        </div>

        <div className="property-info">
          <span className="property-badge">{t.sea}</span>

          <h2>{t.houseSea}</h2>

          <div className="property-location">
            <FaMapMarkerAlt />
            Costanera 2169 entre 46 y 48
          </div>

          <div className="property-features">
            <div>
              <FaBed />
              <span>{t.rooms}</span>
            </div>

            <div>
              <FaBath />
              <span>{t.bath1}</span>
            </div>

            <div>
              <FaWifi />
              <span>{t.wifi}</span>
            </div>

            <div>
              <FaCar />
              <span>{t.garage}</span>
            </div>

            <div>
              <FaPaw />
              <span>{t.pet}</span>
            </div>
          </div>

          <p className="property-description">{t.desc2}</p>

          <div className="property-map">
            <iframe
              src="https://www.google.com/maps?q=Las+Toninas&output=embed"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Mapa Casa frente al mar"
            />
          </div>
        </div>
      </div>

      {/* CASA 3 */}
      <div className="property-card">
        <div className="property-gallery">
          <img src={collage3} alt={t.housePark} />
        </div>

        <div className="property-info">
          <span className="property-badge">{t.park}</span>

          <h2>{t.housePark}</h2>

          <div className="property-location">
            <FaMapMarkerAlt />
            Calle 13 Nº 1836 entre 40 y 42
          </div>

          <div className="property-features">
            <div>
              <FaBed />
              <span>{t.rooms}</span>
            </div>

            <div>
              <FaBath />
              <span>{t.bath1}</span>
            </div>

            <div>
              <FaWifi />
              <span>{t.wifi}</span>
            </div>

            <div>
              <FaCar />
              <span>{t.garage}</span>
            </div>

            <div>
              <FaPaw />
              <span>{t.pet}</span>
            </div>
          </div>

          <p className="property-description">{t.desc3}</p>

          <div className="property-map">
            <iframe
              src="https://www.google.com/maps?q=Las+Toninas&output=embed"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Mapa Casa con gran parque"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
