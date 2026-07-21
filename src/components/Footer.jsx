import "./Footer.css";

// IMPORTS DE ICONOS (REACT ICONS - CORRECTO)
import { FaFacebookF, FaInstagram, FaWhatsapp } from "react-icons/fa";

// IMPORTS DE LOGOS (los tuyos)
import logo1 from "../assets/logos/logo1.jpg";
import logo2 from "../assets/logos/logo2.jpg";

// ================================
// DATOS DE CONTACTO Y REDES
// EDITAR SOLO ACÁ ABAJO
// ================================

// Correo principal (el que ya está funcionando)
const EMAIL_PRINCIPAL = "info@tortuninas.com.ar";

// Mauro: acá va el correo que te dé el hosting cuando te lo entreguen.
// Reemplazá el texto de ejemplo por el correo real (sin sacar las comillas).
const EMAIL_SECUNDARIO = "correo-del-hosting@ejemplo.com";

// Mauro: acá va el link de la página de Facebook cuando la crees.
// Ejemplo de formato: "https://facebook.com/tortuninas"
const FACEBOOK_URL = "https://facebook.com";

// Mauro: acá va el link de Instagram cuando crees la cuenta.
// Ejemplo de formato: "https://instagram.com/tortuninas"
const INSTAGRAM_URL = "https://instagram.com";

// Número real de WhatsApp (formato internacional: 54 + 9 + código de área + número, sin espacios ni signos)
const WHATSAPP_NUMBER = "5491170822059";

export default function Footer({ language }) {
  return (
    <footer className="footer" id="contacto">
      <div className="footer-container">
        {/* ================= BRAND ================= */}
        <div className="footer-brand">
          <div className="brand-top">
            <div className="sun-icon">☀</div>

            <div>
              <h2>Tortuninas</h2>
              <span>LAS TONINAS</span>
            </div>
          </div>

          <p>
            {language === "es"
              ? "Casas para disfrutar en familia, con amigos y con tus mascotas."
              : language === "pt"
                ? "Casas para aproveitar em família, com amigos e com seus pets."
                : "Houses to enjoy with family, friends, and your pets."}
          </p>

          {/* ================= REDES ================= */}
          <div className="socials">
            <a href={FACEBOOK_URL} target="_blank" rel="noreferrer">
              <FaFacebookF />
            </a>

            <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer">
              <FaInstagram />
            </a>

            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noreferrer"
            >
              <FaWhatsapp />
            </a>
          </div>
        </div>

        {/* ================= LINKS ================= */}
        <div className="footer-links">
          <h3>
            {language === "es"
              ? "Enlaces rápidos"
              : language === "pt"
                ? "Links rápidos"
                : "Quick links"}
          </h3>

          <a href="#inicio">
            {language === "es"
              ? "Inicio"
              : language === "pt"
                ? "Início"
                : "Home"}
          </a>

          <a href="#casas">
            {language === "es"
              ? "Casas"
              : language === "pt"
                ? "Casas"
                : "Houses"}
          </a>

          <a href="#quienes">
            {language === "es"
              ? "Quiénes Somos"
              : language === "pt"
                ? "Quem Somos"
                : "About Us"}
          </a>

          <a href="#contacto">
            {language === "es"
              ? "Contacto"
              : language === "pt"
                ? "Contato"
                : "Contact"}
          </a>
        </div>

        {/* ================= CONTACTO ================= */}
        <div className="footer-contact">
          <h3>
            {language === "es"
              ? "Contacto"
              : language === "pt"
                ? "Contato"
                : "Contact"}
          </h3>

          <p>📞 +54 9 11 7082-2059</p>
          <p>✉ {EMAIL_PRINCIPAL}</p>
          <p>✉ {EMAIL_SECUNDARIO}</p>
          <p>📍 Las Toninas, Buenos Aires</p>
        </div>

        {/* ================= PAGOS ================= */}
        <div className="footer-payment">
          <h3>
            {language === "es"
              ? "Medios de pago"
              : language === "pt"
                ? "Formas de pagamento"
                : "Payment methods"}
          </h3>

          <div className="payment-real">
            <img src={logo1} alt="Visa" className="pay" />

            <img
              src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg"
              alt="Mastercard"
              className="pay"
            />

            <img src={logo2} alt="Mercado Pago" className="pay" />
          </div>

          <div className="transfer">
            {language === "es"
              ? "TRANSFERENCIA BANCARIA"
              : language === "pt"
                ? "TRANSFERÊNCIA BANCÁRIA"
                : "BANK TRANSFER"}
          </div>
        </div>
      </div>

      {/* ================= FOOTER BOTTOM ================= */}
      <div className="footer-bottom">
        <div className="footer-bottom-container">
          <p>
            © 2026 Tortuninas - Las Toninas.{" "}
            {language === "es"
              ? "Todos los derechos reservados."
              : language === "pt"
                ? "Todos os direitos reservados."
                : "All rights reserved."}
          </p>

          <span>
            {language === "es"
              ? "Diseñado con ❤ para vos"
              : language === "pt"
                ? "Desenvolvido com ❤ para você"
                : "Designed with ❤ for you"}
          </span>
        </div>
      </div>
    </footer>
  );
}
