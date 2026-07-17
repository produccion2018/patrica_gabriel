import "./BookingCalendar.css";
import { useState, useEffect, useRef } from "react";
import { API_URL } from "../../config/api";

const HOUSE_COLORS = {
  "Casa frente al mar": { bg: "#22c55e", border: "#16a34a", icon: "🌊" },
  "Casa con pileta": { bg: "#ec4899", border: "#db2777", icon: "🏊" },
  "Casa familiar": { bg: "#f97316", border: "#ea580c", icon: "🏠" },
};

const PENDING_BG = "#fbbf24";
const PENDING_BORDER = "#f59e0b";

export default function BookingCalendar({
  selectedHouse,
  selectedDates,
  setSelectedDates,
}) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [reservas, setReservas] = useState([]);

  // --- Estado para selección con arrastre de mouse ---
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef(null); // día donde empezó el drag
  const movedRef = useRef(false); // si el mouse pasó por más de un día

  useEffect(() => {
    fetch(`${API_URL}/api/reservas`)
      .then((res) => res.json())
      .then((data) => {
        const activas = Array.isArray(data)
          ? data.filter((r) => r.estado !== "finalizada")
          : [];
        const unicas = Array.from(
          new Map(activas.map((r) => [r.id, r])).values(),
        );
        const reservasProcesadas = unicas.map((r) => ({
          ...r,
          fechas: JSON.parse(r.fechas || "[]"),
        }));
        setReservas(reservasProcesadas);
      })
      .catch((err) => console.error("Error al cargar reservas:", err));
  }, []);

  // Soltar el drag aunque el mouseup ocurra fuera del calendario
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setIsDragging(false);
      dragStartRef.current = null;
      movedRef.current = false;
    };
    window.addEventListener("mouseup", handleGlobalMouseUp);
    return () => window.removeEventListener("mouseup", handleGlobalMouseUp);
  }, []);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthName = currentDate.toLocaleString("es-AR", { month: "long" });

  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));

  const buildDate = (day) =>
    `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  const getReserva = (fullDate) =>
    reservas.find(
      (r) => r.casa === selectedHouse?.nombre && r.fechas.includes(fullDate),
    );

  const toggleDate = (day) => {
    const fullDate = buildDate(day);
    if (getReserva(fullDate)) return; // no tocar días ya reservados
    if (selectedDates.includes(fullDate)) {
      setSelectedDates(selectedDates.filter((d) => d !== fullDate));
    } else {
      setSelectedDates([...selectedDates, fullDate]);
    }
  };

  const selectRange = (startDay, endDay) => {
    const from = Math.min(startDay, endDay);
    const to = Math.max(startDay, endDay);
    const rango = [];
    for (let d = from; d <= to; d++) {
      const fullDate = buildDate(d);
      if (!getReserva(fullDate)) rango.push(fullDate); // saltea días ocupados
    }
    setSelectedDates(rango);
  };

  // --- Handlers de mouse ---
  const handleMouseDown = (day) => {
    if (getReserva(buildDate(day))) return;
    setIsDragging(true);
    dragStartRef.current = day;
    movedRef.current = false;
  };

  const handleMouseEnter = (day) => {
    if (!isDragging || dragStartRef.current === null) return;
    if (day !== dragStartRef.current) movedRef.current = true;
    selectRange(dragStartRef.current, day);
  };

  const handleMouseUp = (day) => {
    if (!isDragging) return;
    if (!movedRef.current) {
      // Fue un clic simple, no un arrastre: togglear ese día solo
      toggleDate(day);
    }
    setIsDragging(false);
    dragStartRef.current = null;
    movedRef.current = false;
  };

  const getInitials = (r) => {
    const n = r?.nombre?.trim()?.[0] || "";
    const a = r?.apellido?.trim()?.[0] || "";
    return `${n}${a}`.toUpperCase();
  };

  return (
    <div className="simple-calendar">
      <div className="calendar-top">
        <button type="button" className="calendar-arrow" onClick={prevMonth}>
          ←
        </button>
        <div>
          <h3>
            {monthName.charAt(0).toUpperCase() + monthName.slice(1)} {year}
          </h3>
          <span>Seleccioná los días (clic o arrastrando el mouse)</span>
        </div>
        <button type="button" className="calendar-arrow" onClick={nextMonth}>
          →
        </button>
      </div>

      <div className="calendar-grid" onMouseLeave={() => {}}>
        {["D", "L", "M", "M", "J", "V", "S"].map((item, index) => (
          <div key={index} className="calendar-week">
            {item}
          </div>
        ))}

        {[...Array(daysInMonth)].map((_, index) => {
          const day = index + 1;
          const fullDate = buildDate(day);
          const reservaDelDia = getReserva(fullDate);
          const isSelected = selectedDates.includes(fullDate);
          const houseInfo = HOUSE_COLORS[selectedHouse?.nombre] || {};

          let style = {};
          let showTag = false;

          if (isSelected) {
            style = {
              background: PENDING_BG,
              borderColor: PENDING_BORDER,
              color: "#7c2d12",
            };
          } else if (reservaDelDia?.estado === "pendiente") {
            style = {
              background: PENDING_BG,
              borderColor: PENDING_BORDER,
              color: "#7c2d12",
            };
            showTag = true;
          } else if (reservaDelDia?.estado === "confirmada") {
            style = {
              background: houseInfo.bg,
              borderColor: houseInfo.border,
              color: "#fff",
            };
            showTag = true;
          }

          return (
            <div
              key={day}
              className={`calendar-day ${reservaDelDia ? "has-reserva" : ""} ${isSelected ? "active" : ""}`}
              style={style}
              onMouseDown={() => handleMouseDown(day)}
              onMouseEnter={() => handleMouseEnter(day)}
              onMouseUp={() => handleMouseUp(day)}
            >
              <span className="calendar-day-number">{day}</span>
              {showTag && (
                <span className="calendar-day-tag">
                  {getInitials(reservaDelDia)} {houseInfo.icon}
                </span>
              )}
            </div>
          );
        })}
      </div>

      <div className="calendar-legend">
        <div className="calendar-legend-item">
          <span
            className="calendar-legend-dot"
            style={{ background: PENDING_BG }}
          />
          Pendiente
        </div>
        <div className="calendar-legend-item">
          <span
            className="calendar-legend-dot"
            style={{ background: HOUSE_COLORS["Casa frente al mar"].bg }}
          />
          Frente al mar
        </div>
        <div className="calendar-legend-item">
          <span
            className="calendar-legend-dot"
            style={{ background: HOUSE_COLORS["Casa con pileta"].bg }}
          />
          Con pileta
        </div>
        <div className="calendar-legend-item">
          <span
            className="calendar-legend-dot"
            style={{ background: HOUSE_COLORS["Casa familiar"].bg }}
          />
          Familiar
        </div>
      </div>

      {selectedDates.length > 0 && (
        <div className="calendar-info">
          <strong>Días seleccionados:</strong>
          <span>
            {selectedDates.length} noche{selectedDates.length > 1 ? "s" : ""}
          </span>
        </div>
      )}
    </div>
  );
}
