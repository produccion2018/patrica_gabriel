import "./BookingFinal.css";
import Swal from "sweetalert2";

export default function BookingFinal({
  selectedHouse,
  selectedDates = [],
  formData = {},
  handleClose,
}) {
  // Aseguramos que selectedDates sea un array para evitar errores
  const dates = Array.isArray(selectedDates) ? selectedDates : [];

  // Ordenamos las fechas correctamente usando localeCompare
  const sortedDates = [...dates].sort((a, b) => a.localeCompare(b));

  const firstDay = sortedDates.length > 0 ? sortedDates[0] : "--";
  const lastDay =
    sortedDates.length > 0 ? sortedDates[sortedDates.length - 1] : "--";

  const totalNights = sortedDates.length;

  const handleFinish = () => {
    Swal.fire({
      title: "¡Reserva enviada!",
      text: "Nos comunicaremos pronto para confirmar tu reserva.",
      icon: "success",
      confirmButtonText: "Perfecto",
      confirmButtonColor: "#ea580c",
      background: "#ffffff",
    }).then(() => {
      handleClose();
    });
  };

  return (
    <div className="booking-final">
      <div className="booking-final-icon">✅</div>

      <h2>Solicitud enviada</h2>

      <p>
        Patricia y Gabriel revisarán tu reserva y se comunicarán a la brevedad.
      </p>

      <div className="booking-ticket">
        <div className="booking-ticket-row">
          <span>Casa</span>
          <strong>{selectedHouse?.nombre || "No especificada"}</strong>
        </div>

        <div className="booking-ticket-row">
          <span>Fechas</span>
          <strong>
            {firstDay} → {lastDay}
          </strong>
        </div>

        <div className="booking-ticket-row">
          <span>Noches</span>
          <strong>{totalNights}</strong>
        </div>

        <div className="booking-ticket-row">
          <span>Huéspedes</span>
          <strong>{formData.huespedes || "0"}</strong>
        </div>

        {formData.comentarios && (
          <div className="booking-comments">
            <span>Comentarios</span>
            <p>{formData.comentarios}</p>
          </div>
        )}
      </div>

      <button className="booking-btn" onClick={handleFinish}>
        Finalizar
      </button>
    </div>
  );
}
