import "./HouseSelector.css";
import { Waves, Droplets, Users, MapPin } from "lucide-react";

// Ícono + color + descripción por casa, igual al diseño de referencia.
// Esto es solo presentación: no toca selectedHouse, ni la lógica de clicks.
const DETALLE_CASA = {
  1: {
    Icono: Waves,
    iconBg: "#e8f2fb",
    iconColor: "#2563eb",
    descripcion:
      "Disfrutá de la mejor vista y la brisa marina a solo pasos de la playa.",
  },
  2: {
    Icono: Droplets,
    iconBg: "#e6f6ee",
    iconColor: "#16a34a",
    descripcion:
      "Relajate en nuestra pileta y disfrutá de un entorno natural único.",
  },
  3: {
    Icono: Users,
    iconBg: "#efe9fb",
    iconColor: "#7c3aed",
    descripcion: "Espacios cómodos y seguros para que disfrutes en familia.",
  },
};

export default function HouseSelector({
  houses,
  selectedHouse,
  setSelectedHouse,
  selectedDates,
}) {
  // CORRECCIÓN: Si selectedDates es undefined o null, lo inicializamos como array vacío
  const dates = Array.isArray(selectedDates) ? selectedDates : [];

  const sortedDates = [...dates].sort();

  const firstDay = sortedDates.length > 0 ? sortedDates[0] : "--";
  const lastDay =
    sortedDates.length > 0 ? sortedDates[sortedDates.length - 1] : "--";

  const handleSelectHouse = (house) => {
    setSelectedHouse(house);
  };

  const getCorrectedImage = (houseId, currentImage) => {
    if (houseId === 1) {
      const house2 = houses.find((h) => h.id === 2);
      return house2 ? house2.imagen : currentImage;
    }
    if (houseId === 2) {
      const house1 = houses.find((h) => h.id === 1);
      return house1 ? house1.imagen : currentImage;
    }
    return currentImage;
  };

  return (
    <div className="house-selector">
      <div>
        <h2 className="booking-title">Disponibilidad y Reserva</h2>
        <p className="booking-subtitle">Seleccioná tu casa y las fechas</p>
      </div>

      <div className="booking-houses">
        {houses.map((house) => {
          const correctedImg = getCorrectedImage(house.id, house.imagen);
          const detalle = DETALLE_CASA[house.id] || DETALLE_CASA[1];
          const Icono = detalle.Icono;

          return (
            <div
              key={house.id}
              className={`booking-house-card ${
                selectedHouse?.id === house.id ? "active" : ""
              }`}
              onClick={() => handleSelectHouse(house)}
            >
              <img src={correctedImg} alt={house.nombre} />

              <div className="booking-house-info">
                <div
                  className="booking-house-icon"
                  style={{
                    background: detalle.iconBg,
                    color: detalle.iconColor,
                  }}
                >
                  <Icono size={17} />
                </div>

                <h4>{house.nombre}</h4>

                <div className="booking-house-location">
                  <MapPin size={14} />
                  <span>{house.ubicacion}</span>
                </div>

                <p className="booking-house-desc">{detalle.descripcion}</p>
              </div>
            </div>
          );
        })}
      </div>

      {selectedHouse && (
        <div className="booking-resumen">
          <h3>Resumen de reserva</h3>
          <div className="booking-resumen-card">
            <img
              src={getCorrectedImage(selectedHouse.id, selectedHouse.imagen)}
              alt={selectedHouse.nombre}
            />
            <div>
              <h4>{selectedHouse.nombre}</h4>
              <p>{selectedHouse.ubicacion}</p>
              <p>
                <strong>Fechas:</strong>{" "}
                {dates.length > 0 ? `${firstDay} → ${lastDay}` : "--"}
              </p>
              <p>
                <strong>Noches:</strong> {dates.length}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
