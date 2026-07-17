import "./Hero.css";
import { PawPrint, Users, Umbrella, MapPin } from "lucide-react";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade, Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/pagination";

import hero1 from "../assets/hero1.jpg";
import hero2 from "../assets/hero2.jpg";
import hero3 from "../assets/hero3.jpg";

const slidesContent = {
  es: [
    {
      title: "Tu lugar\nen Las Toninas",
      subtitle:
        "Casas cómodas, familiares y pet friendly para disfrutar unas vacaciones inolvidables.",
    },

    {
      title: "Viví unas\nvacaciones únicas",
      subtitle:
        "Casas premium totalmente equipadas para disfrutar frente al mar.",
    },

    {
      title: "Descansá en\nLas Toninas",
      subtitle: "Naturaleza, tranquilidad y confort para toda la familia.",
    },
  ],

  pt: [
    {
      title: "Seu lugar\nem Las Toninas",
      subtitle:
        "Casas confortáveis, familiares e pet friendly para férias inesquecíveis.",
    },

    {
      title: "Viva férias\núnicas",
      subtitle:
        "Casas premium totalmente equipadas para aproveitar frente ao mar.",
    },

    {
      title: "Descanse em\nLas Toninas",
      subtitle: "Natureza, tranquilidade e conforto para toda a família.",
    },
  ],

  en: [
    {
      title: "Your place\nin Las Toninas",
      subtitle:
        "Comfortable family and pet friendly houses for unforgettable vacations.",
    },

    {
      title: "Enjoy unique\nvacations",
      subtitle: "Premium fully equipped houses to enjoy by the sea.",
    },

    {
      title: "Relax in\nLas Toninas",
      subtitle: "Nature, tranquility and comfort for the whole family.",
    },
  ],
};

const images = [hero1, hero2, hero3];

export default function Hero({ language }) {
  const slides = slidesContent[language].map((slide, index) => ({
    ...slide,
    image: images[index],
  }));

  return (
    <section className="hero-section" id="inicio">
      <Swiper
        modules={[Autoplay, EffectFade, Pagination]}
        effect="fade"
        loop={true}
        speed={1200}
        pagination={{ clickable: true }}
        autoplay={{
          delay: 7000,
          disableOnInteraction: false,
        }}
      >
        {slides.map((slide, index) => (
          <SwiperSlide key={index}>
            <div
              className="hero-slide"
              style={{
                backgroundImage: `url(${slide.image})`,
              }}
            >
              <div className="hero-overlay"></div>

              <div className="hero-container">
                <div className="hero-left">
                  <span className="hero-location">
                    <MapPin size={16} />
                    LAS TONINAS, BUENOS AIRES
                  </span>

                  <h1>
                    {slide.title.split("\n").map((line, i) => (
                      <span key={i}>
                        {line}
                        <br />
                      </span>
                    ))}
                  </h1>

                  <p>{slide.subtitle}</p>

                  <div className="hero-buttons">
                    <button
                      className="primary-btn"
                      onClick={() => {
                        const section = document.getElementById("casas");

                        if (!section) return;

                        const navbarHeight = 90;

                        const sectionPosition =
                          section.getBoundingClientRect().top +
                          window.pageYOffset;

                        window.scrollTo({
                          top: sectionPosition - navbarHeight,
                          behavior: "smooth",
                        });
                      }}
                    >
                      {language === "es"
                        ? "Ver nuestras casas"
                        : language === "pt"
                          ? "Ver nossas casas"
                          : "View our houses"}
                    </button>

                    <button
                      className="secondary-btn"
                      onClick={() => {
                        const section = document.getElementById("casas");

                        if (!section) return;

                        const navbarHeight = 90;

                        const sectionPosition =
                          section.getBoundingClientRect().top +
                          window.pageYOffset;

                        window.scrollTo({
                          top: sectionPosition - navbarHeight,
                          behavior: "smooth",
                        });
                      }}
                    >
                      {language === "es"
                        ? "Conocé Las Toninas"
                        : language === "pt"
                          ? "Conheça Las Toninas"
                          : "Discover Las Toninas"}
                    </button>
                  </div>

                  <div className="hero-features">
                    <div className="feature-card">
                      <PawPrint size={20} />

                      <h4>Pet Friendly</h4>

                      <span>
                        {language === "es"
                          ? "Mascotas bienvenidas"
                          : language === "pt"
                            ? "Animais bem-vindos"
                            : "Pets welcome"}
                      </span>
                    </div>

                    <div className="feature-card">
                      <Users size={20} />

                      <h4>
                        {language === "es"
                          ? "Para familias"
                          : language === "pt"
                            ? "Para famílias"
                            : "For families"}
                      </h4>

                      <span>
                        {language === "es"
                          ? "Espacios cómodos"
                          : language === "pt"
                            ? "Espaços confortáveis"
                            : "Comfortable spaces"}
                      </span>
                    </div>

                    <div className="feature-card">
                      <Umbrella size={20} />

                      <h4>
                        {language === "es"
                          ? "A pasos del mar"
                          : language === "pt"
                            ? "Perto do mar"
                            : "Near the sea"}
                      </h4>

                      <span>
                        {language === "es"
                          ? "Disfrutá la playa"
                          : language === "pt"
                            ? "Aproveite a praia"
                            : "Enjoy the beach"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}
