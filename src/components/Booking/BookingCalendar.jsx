import "./BookingCalendar.css";
import { useState, useEffect, useRef } from "react";

const HOUSE_COLORS = {
  "Casa frente al mar": { bg: "#22c55e", border: "#16a34a", icon: "🌊" },
  "Casa con pileta": { bg: "#ec4899", border: "#db2777", icon: "🏊" },
  "Casa familiar": { bg: "#f97316", border: "#ea580c", icon: "🏠" },
  "Departamento en Jujuy": { bg: "#b5651d", border: "#8a4d16", icon: "🏔️" },
};

const PENDING_BG = "#fbbf24";
const PENDING_BORDER = "#f59e0b";

export default function BookingCalendar({
  selectedHouse,
  selectedDates,
  setSelectedDates,
  reservas,
}) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef(null);
  const movedRef = useRef(false);

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

  const primerDiaSemana = new Date(year, month, 1).getDay();

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const esDiaPasado = (day) => {
    const fecha = new Date(year, month, day);
    fecha.setHours(0, 0, 0, 0);
    return fecha < hoy;
  };

  const puedeIrAMesAnterior =
    year > hoy.getFullYear() ||
    (year === hoy.getFullYear() && month > hoy.getMonth());

  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const prevMonth = () => {
    if (!puedeIrAMesAnterior) return;
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const buildDate = (day) =>
    `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  const getReserva = (fullDate) =>
    (reservas || []).find(
      (r) => r.casa === selectedHouse?.nombre && r.fechas.includes(fullDate),
    );

  const toggleDate = (day) => {
    if (esDiaPasado(day)) return;
    const fullDate = buildDate(day);
    if (getReserva(fullDate)) return;
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
      if (esDiaPasado(d)) continue;
      const fullDate = buildDate(d);
      if (!getReserva(fullDate)) rango.push(fullDate);
    }
    setSelectedDates(rango);
  };

  const handleMouseDown = (day) => {
    if (esDiaPasado(day)) return;
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
        <button
          type="button"
          className="calendar-arrow"
          onClick={prevMonth}
          disabled={!puedeIrAMesAnterior}
          style={
            !puedeIrAMesAnterior
              ? { opacity: 0.35, cursor: "not-allowed" }
              : undefined
          }
        >
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
          <div key={`h-${index}`} className="calendar-week">
            {item}
          </div>
        ))}

        {Array.from({ length: primerDiaSemana }).map((_, index) => (
          <div
            key={`empty-${index}`}
            className="calendar-day"
            style={{
              background: "transparent",
              border: "none",
              cursor: "default",
              pointerEvents: "none",
              boxShadow: "none",
            }}
          />
        ))}

        {[...Array(daysInMonth)].map((_, index) => {
          const day = index + 1;
          const fullDate = buildDate(day);
          const reservaDelDia = getReserva(fullDate);
          const isSelected = selectedDates.includes(fullDate);
          const esPasado = esDiaPasado(day);
          const houseInfo = HOUSE_COLORS[selectedHouse?.nombre] || {};

          let style = {};
          let showTag = false;

          if (esPasado) {
            style = {
              background: "#f1f5f9",
              borderColor: "#e2e8f0",
              color: "#cbd5e1",
              cursor: "not-allowed",
              pointerEvents: "none",
            };
          } else if (isSelected) {
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
        <div className="calendar-legend-item">
          <span
            className="calendar-legend-dot"
            style={{ background: HOUSE_COLORS["Departamento en Jujuy"].bg }}
          />
          Jujuy
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
