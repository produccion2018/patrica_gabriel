import "./BookingForm.css";
import {
  User,
  Mail,
  MapPin,
  Phone,
  PawPrint,
  Users,
  MessageSquare,
} from "lucide-react";

export default function BookingForm({
  language,
  formData,
  setFormData,
  onSubmit,
  isSubmitting, // <--- Propiedad nueva para bloquear el botón
}) {
  const text = {
    es: {
      nombre: "Nombre",
      apellido: "Apellido",
      email: "Correo electrónico",
      pais: "País",
      direccion: "Dirección",
      telefono: "Teléfono",
      huespedes: "Cantidad de huéspedes",
      mascota: "¿Viaja con mascotas?",
      cantidadMascotas: "Cantidad de mascotas",
      comentarios: "Comentarios",
      reservar: "Reservar ahora",
      enviando: "Enviando...", // <--- Texto mientras carga
    },
    pt: {
      nombre: "Nome",
      apellido: "Sobrenome",
      email: "E-mail",
      pais: "País",
      direccion: "Endereço",
      telefono: "Telefone",
      huespedes: "Quantidade de hóspedes",
      mascota: "Viaja com animais?",
      cantidadMascotas: "Quantidade de animais",
      comentarios: "Comentários",
      reservar: "Reservar agora",
      enviando: "Enviando...",
    },
    en: {
      nombre: "First Name",
      apellido: "Last Name",
      email: "Email",
      pais: "Country",
      direccion: "Address",
      telefono: "Phone",
      huespedes: "Guests",
      mascota: "Traveling with pets?",
      cantidadMascotas: "Number of pets",
      comentarios: "Comments",
      reservar: "Book Now",
      enviando: "Sending...",
    },
  };

  const t = text[language];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <form className="booking-form" onSubmit={onSubmit}>
      {/* NOMBRE Y APELLIDO */}
      <div className="booking-row">
        <div className="booking-input">
          <User size={18} />
          <input
            type="text"
            name="nombre"
            placeholder={language === "en" ? "Patricia" : "Patricia"}
            value={formData.nombre}
            onChange={handleChange}
            required
            disabled={isSubmitting} // Deshabilitar si está enviando
          />
        </div>
        <div className="booking-input">
          <User size={18} />
          <input
            type="text"
            name="apellido"
            placeholder="Toninas"
            value={formData.apellido}
            onChange={handleChange}
            required
            disabled={isSubmitting}
          />
        </div>
      </div>

      {/* EMAIL */}
      <div className="booking-input">
        <Mail size={18} />
        <input
          type="email"
          name="email"
          placeholder="patricia.toninas@gmail.com"
          value={formData.email}
          onChange={handleChange}
          required
          disabled={isSubmitting}
        />
      </div>

      {/* PAIS */}
      <div className="booking-input">
        <MapPin size={18} />
        <input
          type="text"
          name="pais"
          placeholder="Argentina"
          value={formData.pais}
          onChange={handleChange}
          required
          disabled={isSubmitting}
        />
      </div>

      {/* DIRECCION */}
      <div className="booking-input">
        <MapPin size={18} />
        <input
          type="text"
          name="direccion"
          placeholder="Av. Costanera 1450, Las Toninas"
          value={formData.direccion}
          onChange={handleChange}
          required
          disabled={isSubmitting}
        />
      </div>

      {/* TELEFONO */}
      <div className="booking-input">
        <Phone size={18} />
        <input
          type="tel"
          name="telefono"
          inputMode="numeric"
          pattern="[0-9+\s()-]*"
          placeholder="+54 9 2257 55-1234"
          value={formData.telefono}
          onChange={(e) => {
            const value = e.target.value.replace(/[^0-9+\s()-]/g, "");
            setFormData({ ...formData, telefono: value });
          }}
          required
          disabled={isSubmitting}
        />
      </div>

      {/* HUESPEDES */}
      <div className="booking-input">
        <Users size={18} />
        <input
          type="number"
          min="1"
          name="huespedes"
          placeholder={t.huespedes}
          value={formData.huespedes}
          onChange={handleChange}
          required
          disabled={isSubmitting}
        />
      </div>

      {/* MASCOTAS */}
      <div className="booking-pets">
        <label>{t.mascota}</label>
        <select
          name="mascota"
          value={formData.mascota}
          onChange={handleChange}
          disabled={isSubmitting}
        >
          <option value="no">No</option>
          <option value="si">Sí</option>
        </select>
      </div>

      {/* CANTIDAD MASCOTAS */}
      {formData.mascota === "si" && (
        <div className="booking-input">
          <PawPrint size={18} />
          <input
            type="number"
            min="1"
            name="cantidadMascotas"
            placeholder={t.cantidadMascotas}
            value={formData.cantidadMascotas}
            onChange={handleChange}
            disabled={isSubmitting}
          />
        </div>
      )}

      {/* COMENTARIOS */}
      <div className="booking-textarea">
        <MessageSquare size={18} />
        <textarea
          name="comentarios"
          maxLength="200"
          placeholder={t.comentarios}
          value={formData.comentarios}
          onChange={handleChange}
          disabled={isSubmitting}
        />
        <small>{formData.comentarios?.length || 0}/200</small>
      </div>

      {/* BOTON CON ESTADO DE CARGA */}
      <button type="submit" className="booking-btn" disabled={isSubmitting}>
        {isSubmitting ? t.enviando : t.reservar}
      </button>
    </form>
  );
}
