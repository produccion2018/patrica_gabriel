import "./BookinPadre.css";
import { useState, useEffect } from "react";
import Swal from "sweetalert2";

import casa1 from "../../assets/casa1.jpg";
import casa2 from "../../assets/casa2.jpg";
import casa3 from "../../assets/casa3.jpg";

import HouseSelector from "./HouseSelector";
import BookingCalendar from "./BookingCalendar";
import BookingForm from "./BookingForm";
import BookingFinal from "./BookingFinal";
import { API_URL } from "../../config/api";

export default function BookingPadre({ openBooking, setOpenBooking }) {
  const [step, setStep] = useState(1);
  const [selectedHouse, setSelectedHouse] = useState(null);
  const [selectedDates, setSelectedDates] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    email: "",
    pais: "",
    direccion: "",
    telefono: "",
    huespedes: "",
    mascota: "no",
    cantidadMascotas: "",
    comentarios: "",
  });

  // Al cambiar de casa, el calendario de la nueva casa arranca limpio
  useEffect(() => {
    setSelectedDates([]);
  }, [selectedHouse]);

  const houses = [
    {
      id: 1,
      nombre: "Casa frente al mar",
      imagen: casa1,
      ubicacion: "Las Toninas",
    },
    {
      id: 2,
      nombre: "Casa con pileta",
      imagen: casa2,
      ubicacion: "Las Toninas",
    },
    { id: 3, nombre: "Casa familiar", imagen: casa3, ubicacion: "Las Toninas" },
  ];

  if (!openBooking) return null;

  const handleClose = () => {
    setOpenBooking(false);
    setStep(1);
    setSelectedHouse(null);
    setSelectedDates([]);
    setFormData({
      nombre: "",
      apellido: "",
      email: "",
      pais: "",
      direccion: "",
      telefono: "",
      huespedes: "",
      mascota: "no",
      cantidadMascotas: "",
      comentarios: "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!selectedHouse) {
      Swal.fire({
        icon: "warning",
        title: "Falta seleccionar una casa",
        text: "Elegí una casa antes de continuar.",
      });
      return;
    }

    if (!selectedDates || selectedDates.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "Faltan fechas",
        text: "Seleccioná las fechas de la reserva antes de enviarla.",
      });
      return;
    }

    setIsSubmitting(true);

    const fechasOrdenadas = [...selectedDates].sort();
    const payload = {
      casa: selectedHouse?.nombre || "",
      ...formData,
      fecha_ingreso: fechasOrdenadas[0] || "",
      fecha_salida: fechasOrdenadas[fechasOrdenadas.length - 1] || "",
      noches: fechasOrdenadas.length,
      fechas: fechasOrdenadas,
      estado: "pendiente",
    };

    // Avanzamos a la pantalla final de una vez, sin esperar al servidor
    setStep(3);
    setIsSubmitting(false);

    // El envío real se hace en paralelo, en segundo plano
    fetch(`${API_URL}/api/reservas`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success === false) {
          console.error("⚠️ El servidor respondió con error:", data.message);
        }
      })
      .catch((error) => {
        console.error("❌ ERROR EN RESERVA (segundo plano):", error);
      });
  };

  return (
    <div className="mireya-adalgiza-castro-booking-overlay">
      <div
        className="mireya-adalgiza-castro-booking-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mireya-adalgiza-castro-booking-header">
          <div>
            <h2>Disponibilidad y Reserva</h2>
            <div className="mireya-adalgiza-castro-booking-steps">
              <span className={step >= 1 ? "active" : ""}>1 Fechas</span>
              <span className={step >= 2 ? "active" : ""}>2 Formulario</span>
              <span className={step >= 3 ? "active" : ""}>3 Confirmación</span>
            </div>
          </div>
          <button
            className="mireya-adalgiza-castro-close-btn"
            onClick={handleClose}
          >
            ✕
          </button>
        </div>

        {step === 1 && (
          <>
            <HouseSelector
              houses={houses}
              selectedHouse={selectedHouse}
              setSelectedHouse={setSelectedHouse}
              selectedDates={selectedDates}
            />
            {selectedHouse && (
              <>
                <BookingCalendar
                  key={selectedHouse.id}
                  selectedHouse={selectedHouse}
                  selectedDates={selectedDates}
                  setSelectedDates={setSelectedDates}
                />
                <button
                  className="mireya-adalgiza-castro-next-btn"
                  disabled={selectedDates.length === 0}
                  onClick={() => setStep(2)}
                >
                  Continuar
                </button>
              </>
            )}
          </>
        )}

        {step === 2 && (
          <BookingForm
            language="es"
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        )}

        {step === 3 && (
          <BookingFinal
            selectedHouse={selectedHouse}
            selectedDates={selectedDates}
            formData={formData}
            handleClose={handleClose}
          />
        )}
      </div>
    </div>
  );
}
