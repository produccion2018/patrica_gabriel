import "./Navbar.css";

import { useEffect, useState } from "react";

import ReactCountryFlag from "react-country-flag";

import { Menu, X, CalendarDays, ChevronDown } from "lucide-react";

export default function Navbar({ language, setLanguage, setOpenBooking }) {
  const [scrolled, setScrolled] = useState(false);

  const [mobileOpen, setMobileOpen] = useState(false);

  const [languageOpen, setLanguageOpen] = useState(false);

  const languages = {
    es: {
      flag: "AR",
      label: "Español",
    },

    pt: {
      flag: "BR",
      label: "Português",
    },

    en: {
      flag: "US",
      label: "English",
    },
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // =========================================================
  // SCROLL SUAVE
  // =========================================================

  const scrollToSection = (id) => {
    const section = document.getElementById(id);

    if (!section) return;

    section.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });

    setMobileOpen(false);
  };

  const changeLanguage = (lang) => {
    setLanguage(lang);

    setLanguageOpen(false);
  };

  return (
    <header className={`navbar ${scrolled ? "navbar-scrolled" : ""}`}>
      {/* LOGO */}

      <div
        className="logo"
        onClick={() => scrollToSection("inicio")}
        style={{ cursor: "pointer" }}
      >
        Tortuninas
      </div>

      {/* LINKS */}

      <nav className={`nav-links ${mobileOpen ? "nav-active" : ""}`}>
        {/* INICIO */}

        <button onClick={() => scrollToSection("inicio")}>
          {language === "es" ? "Inicio" : language === "pt" ? "Início" : "Home"}
        </button>

        {/* CASAS */}

        <button onClick={() => scrollToSection("casas")}>
          {language === "es" ? "Casas" : language === "pt" ? "Casas" : "Houses"}
        </button>

        {/* Comentarios */}
        <button onClick={() => scrollToSection("comentarios")}>
          {language === "es"
            ? "Opiniones"
            : language === "pt"
              ? "Avaliações"
              : "Reviews"}
        </button>

        {/* ABOUT */}

        <a href="/about">
          {language === "es"
            ? "Quiénes Somos"
            : language === "pt"
              ? "Quem Somos"
              : "About Us"}
        </a>

        {/* CONTACTO */}

        <button onClick={() => scrollToSection("contacto")}>
          {language === "es"
            ? "Contacto"
            : language === "pt"
              ? "Contato"
              : "Contact"}
        </button>

        {/* MOBILE BUTTON */}

        <button
          className="mobile-reserve-btn"
          onClick={() => setOpenBooking(true)}
        >
          <CalendarDays size={18} />

          {language === "es"
            ? "Reservar ahora"
            : language === "pt"
              ? "Reservar agora"
              : "Book now"}
        </button>
      </nav>

      {/* RIGHT */}

      <div className="right-navbar">
        {/* LANGUAGES */}

        <div className="language-selector">
          <button
            className="language-btn"
            onClick={() => setLanguageOpen(!languageOpen)}
          >
            <ReactCountryFlag
              countryCode={languages[language].flag}
              svg
              style={{
                width: 24,
                height: 24,
                borderRadius: "50%",
              }}
            />

            <span>{languages[language].label}</span>

            <ChevronDown size={18} />
          </button>

          {languageOpen && (
            <div className="language-dropdown">
              <div
                className="language-item"
                onClick={() => changeLanguage("es")}
              >
                <ReactCountryFlag
                  countryCode="AR"
                  svg
                  style={{
                    width: 22,
                    height: 22,
                  }}
                />
                Español
              </div>

              <div
                className="language-item"
                onClick={() => changeLanguage("pt")}
              >
                <ReactCountryFlag
                  countryCode="BR"
                  svg
                  style={{
                    width: 22,
                    height: 22,
                  }}
                />
                Português
              </div>

              <div
                className="language-item"
                onClick={() => changeLanguage("en")}
              >
                <ReactCountryFlag
                  countryCode="US"
                  svg
                  style={{
                    width: 22,
                    height: 22,
                  }}
                />
                English
              </div>
            </div>
          )}
        </div>

        {/* DESKTOP RESERVE */}

        <button className="reserve-btn" onClick={() => setOpenBooking(true)}>
          <CalendarDays size={18} />

          {language === "es"
            ? "Reservar ahora"
            : language === "pt"
              ? "Reservar agora"
              : "Book now"}
        </button>

        {/* MOBILE MENU */}

        <button
          className={`mobile-menu-btn ${mobileOpen ? "is-open" : ""}`}
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>
    </header>
  );
}
