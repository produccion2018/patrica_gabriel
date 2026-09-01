import "./About.css";

import {
  FaArrowLeft,
  FaHouse,
  FaWater,
  FaPaw,
  FaBars,
  FaXmark,
} from "react-icons/fa6";

import { useState, useEffect } from "react";

import heroAbout from "../assets/about/hero-about.jpg";
import aboutHouse from "../assets/about/about-house.jpg";

export default function About() {
  const [menuOpen, setMenuOpen] = useState(false);

  // IDIOMA GLOBAL
  const language = localStorage.getItem("language") || "es";

  const text = {
    es: {
      back: "Volver al inicio",
      who: "QUIÉNES SOMOS",
      title: "Un proyecto nacido de la pasión",
      subtitle:
        "Creamos espacios acogedores para que tus vacaciones se sientan como estar en casa, con tus mascotas también bienvenidas.",

      years: "Cuidando cada detalle",

      sectionTitle: "Bienvenido a Tortuninas",

      quote:
        "Creemos que todos merecemos unas vacaciones, un lugar donde te sientas como en casa.",

      description:
        "Somos Tortuninas, un proyecto nacido de la pasión por crear espacios acogedores para alquileres temporarios. En cada casa cuidamos cada detalle para que regreses con energía renovada.",

      premium: "Casas Premium",
      premiumDesc: "Diseño moderno y confort.",

      sea: "Cerca del mar",
      seaDesc: "Ubicaciones estratégicas.",

      pet: "Pet Friendly",
      petDesc: "Tus mascotas también son bienvenidas.",
    },

    en: {
      back: "Back to home",
      who: "ABOUT US",
      title: "A project born from passion",
      subtitle:
        "We create cozy spaces so your vacation feels like home, with your pets welcome too.",

      years: "Caring for every detail",

      sectionTitle: "Welcome to Tortuninas",

      quote:
        "We believe everyone deserves a vacation, a place where you feel at home.",

      description:
        "We are Tortuninas, a project born from a passion for creating cozy spaces for short-term rentals. In every house we take care of every detail so you return with renewed energy.",

      premium: "Premium Houses",
      premiumDesc: "Modern design and comfort.",

      sea: "Near the sea",
      seaDesc: "Strategic locations.",

      pet: "Pet Friendly",
      petDesc: "Your pets are welcome too.",
    },

    pt: {
      back: "Voltar ao início",
      who: "QUEM SOMOS",
      title: "Um projeto nascido da paixão",
      subtitle:
        "Criamos espaços aconchegantes para que suas férias pareçam estar em casa, com suas mascotes também bem-vindas.",

      years: "Cuidando de cada detalhe",

      sectionTitle: "Bem-vindo à Tortuninas",

      quote:
        "Acreditamos que todos merecem umas férias, um lugar onde você se sinta em casa.",

      description:
        "Somos a Tortuninas, um projeto nascido da paixão por criar espaços aconchegantes para aluguéis temporários. Em cada casa cuidamos de cada detalhe para que você volte com energia renovada.",

      premium: "Casas Premium",
      premiumDesc: "Design moderno e conforto.",

      sea: "Perto do mar",
      seaDesc: "Localizações estratégicas.",

      pet: "Pet Friendly",
      petDesc: "Suas mascotes também são bem-vindas.",
    },
  };

  const t = text[language];

  // Protección básica
  useEffect(() => {
    const disableRightClick = (e) => e.preventDefault();

    const disableKeys = (e) => {
      if (
        e.key === "F12" ||
        (e.ctrlKey && ["u", "U", "c", "C", "s", "S"].includes(e.key)) ||
        (e.ctrlKey && e.shiftKey && ["i", "I", "j", "J"].includes(e.key))
      ) {
        e.preventDefault();
      }
    };

    document.addEventListener("contextmenu", disableRightClick);
    document.addEventListener("keydown", disableKeys);

    return () => {
      document.removeEventListener("contextmenu", disableRightClick);
      document.removeEventListener("keydown", disableKeys);
    };
  }, []);

  return (
    <section className="about-page">
      {/* WATERMARK */}

      <div className="watermark">TORTUNINAS</div>

      {/* MOBILE MENU */}

      <div className="mobile-navbar">
        <div className="mobile-logo">TORTUNINAS</div>

        <button className="menu-button" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <FaXmark /> : <FaBars />}
        </button>
      </div>

      <div className={`mobile-menu ${menuOpen ? "active" : ""}`}>
        <a href="/">{t.back}</a>
      </div>

      {/* HERO */}

      <div
        className="about-hero"
        style={{
          backgroundImage: `url(${heroAbout})`,
        }}
      >
        <div className="about-overlay"></div>

        <div className="about-hero-content">
          <a href="/" className="back-home">
            <FaArrowLeft />
            {t.back}
          </a>

          <span className="animated-text">{t.who}</span>

          <h1>{t.title}</h1>

          <p>{t.subtitle}</p>
        </div>
      </div>

      {/* CONTENT */}

      <div className="about-container">
        {/* LEFT */}

        <div className="about-image">
          <img src={aboutHouse} alt="Casa premium" />

          <div className="experience-card">
            <h2>+10 años</h2>

            <p>{t.years}</p>
          </div>
        </div>

        {/* RIGHT */}

        <div className="about-info">
          <span className="mini-title">TORTUNINAS</span>

          <h2>{t.sectionTitle}</h2>

          <blockquote className="about-quote">{t.quote}</blockquote>

          <p className="description">{t.description}</p>

          <div className="features">
            <div className="feature-item">
              <div className="feature-icon">
                <FaHouse />
              </div>

              <div>
                <h3>{t.premium}</h3>

                <p>{t.premiumDesc}</p>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-icon">
                <FaWater />
              </div>

              <div>
                <h3>{t.sea}</h3>

                <p>{t.seaDesc}</p>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-icon">
                <FaPaw />
              </div>

              <div>
                <h3>{t.pet}</h3>

                <p>{t.petDesc}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
