import { useEffect, useMemo, useRef, useState } from "react";
import "./AdminCalendar.css";
import { API_URL } from "../../config/api";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

const HOUSE_CONFIRM_COLORS = {
  "casa frente al mar": "#22c55e",
  "casa con pileta": "#ec4899",
  "casa familiar": "#f97316",
};
const HOUSE_ICONS = {
  "casa frente al mar": "🌊",
  "casa con pileta": "🏊",
  "casa familiar": "🏠",
};
const PENDING_COLOR = "#f59e0b";
const DEFAULT_COLOR = "#94a3b8";

// Parsea "YYYY-MM-DD" como fecha LOCAL (evita el corrimiento de un día por UTC)
const parseLocalDate = (str) => {
  if (!str) return null;
  const [y, m, d] = str.split("-").map(Number);
  return new Date(y, m - 1, d);
};

function AdminCalendar({
  reservas,
  setReservas,
  casaSeleccionada,
  setCasaSeleccionada,
}) {
  const [currentDate, setCurrentDate] = useState(new Date());
  // Guarda los ids que ya se mandaron a archivar, para no repetir el POST
  // en cada re-render o en cada ciclo del polling del padre (cada 8s)
  // mientras el backend todavía no confirmó el cambio.
  const archivandoRef = useRef(new Set());

  // Recorre las reservas activas y archiva (finaliza) automáticamente
  // las que ya vencieron, usando el mismo endpoint que el botón manual
  // "Finalizar" de AdminReservationsTable. Como 'reservas' y 'setReservas'
  // ahora vienen del mismo padre que se las pasa a la tabla, el cambio
  // se refleja al instante en calendario + tabla + stats, todo junto.
  useEffect(() => {
    if (!Array.isArray(reservas) || reservas.length === 0) return;

    const hoyInicio = new Date();
    hoyInicio.setHours(0, 0, 0, 0);

    reservas.forEach((r) => {
      if (r.estado === "finalizada" || r.estado === "eliminada") return;

      const id = r.id || r._id;
      if (!id || archivandoRef.current.has(id)) return;

      let fechas = [];
      try {
        fechas = JSON.parse(r.fechas || "[]");
      } catch {
        fechas = [];
      }
      if (fechas.length === 0) return;

      const endDate = parseLocalDate(fechas[fechas.length - 1]);
      if (!endDate) return;

      // Vencida si su último día ya pasó (antes de hoy)
      if (endDate < hoyInicio) {
        archivandoRef.current.add(id);
        fetch(`${API_URL}/api/reservas/${id}/archivar`, {
          method: "POST",
        })
          .then((res) => {
            if (res.ok && typeof setReservas === "function") {
              setReservas((prev) => prev.filter((x) => (x.id || x._id) !== id));
            }
          })
          .catch((err) =>
            console.error("Error al archivar reserva vencida:", err),
          )
          .finally(() => {
            archivandoRef.current.delete(id);
          });
      }
    });
  }, [reservas, setReservas]);

  const month = currentDate.getMonth();
  const year = currentDate.getFullYear();

  const meses = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];

  const diasSemana = ["LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB", "DOM"];

  const primerDia = new Date(year, month, 1).getDay();
  const offsetLunes = primerDia === 0 ? 6 : primerDia - 1;
  const diasEnMes = new Date(year, month + 1, 0).getDate();
  const diasMesAnterior = new Date(year, month, 0).getDate();

  const celdas = useMemo(() => {
    const result = [];
    for (let i = offsetLunes - 1; i >= 0; i--)
      result.push({
        day: diasMesAnterior - i,
        currentMonth: false,
        prev: true,
      });
    for (let d = 1; d <= diasEnMes; d++)
      result.push({ day: d, currentMonth: true });
    const restantes = 42 - result.length;
    for (let d = 1; d <= restantes; d++)
      result.push({ day: d, currentMonth: false, next: true });
    return result;
  }, [month, year, offsetLunes, diasEnMes, diasMesAnterior]);

  const cambiarMes = (dir) => {
    setCurrentDate((prev) => {
      const next = new Date(prev);
      next.setMonth(prev.getMonth() + dir);
      return new Date(next.getFullYear(), next.getMonth(), 1);
    });
  };

  const cambiarAnio = (dir) => {
    setCurrentDate((prev) => {
      const next = new Date(prev);
      next.setFullYear(prev.getFullYear() + dir);
      return new Date(next.getFullYear(), next.getMonth(), 1);
    });
  };

  const irAHoy = () => {
    const hoy = new Date();
    setCurrentDate(new Date(hoy.getFullYear(), hoy.getMonth(), 1));
  };

  const hoy = new Date();
  const esHoy = (celda) =>
    celda.currentMonth &&
    celda.day === hoy.getDate() &&
    month === hoy.getMonth() &&
    year === hoy.getFullYear();

  const reservasProcesadas = useMemo(() => {
    return reservas
      .filter((r) => r.estado !== "finalizada")
      .map((r) => {
        let fechas = [];
        try {
          fechas = JSON.parse(r.fechas || "[]");
        } catch {
          fechas = [];
        }
        const startDate = fechas.length > 0 ? parseLocalDate(fechas[0]) : null;
        const endDate =
          fechas.length > 0 ? parseLocalDate(fechas[fechas.length - 1]) : null;
        return { ...r, startDate, endDate };
      })
      .filter((r) => r.startDate && r.endDate);
  }, [reservas]);

  const getReservasDia = (day, currentMonth) => {
    if (!currentMonth) return [];
    const fecha = new Date(year, month, day);
    return reservasProcesadas.filter((r) => {
      if (casaSeleccionada && casaSeleccionada !== "Todas") {
        if (r.casa?.toLowerCase() !== casaSeleccionada.toLowerCase())
          return false;
      }
      return fecha >= r.startDate && fecha <= r.endDate;
    });
  };

  const getPillInfo = (reserva, day) => {
    const fecha = new Date(year, month, day);
    const startOfMonth = new Date(year, month, 1);
    const endOfMonth = new Date(year, month, diasEnMes);
    const visibleStart =
      reserva.startDate < startOfMonth ? startOfMonth : reserva.startDate;
    const visibleEnd =
      reserva.endDate > endOfMonth ? endOfMonth : reserva.endDate;
    const isStart = fecha.toDateString() === visibleStart.toDateString();
    const isEnd = fecha.toDateString() === visibleEnd.toDateString();
    return { isStart, isEnd };
  };

  const getPillColor = (reserva) => {
    if (reserva.estado === "pendiente") return PENDING_COLOR;
    if (reserva.estado === "confirmada") {
      const casaNorm = (reserva.casa || "").toLowerCase();
      return HOUSE_CONFIRM_COLORS[casaNorm] || DEFAULT_COLOR;
    }
    return DEFAULT_COLOR;
  };

  const getIniciales = (reserva) => {
    const n = reserva.nombre?.trim()?.[0] || "";
    const a = reserva.apellido?.trim()?.[0] || "";
    return `${n}${a}`.toUpperCase();
  };

  return (
    <div className="cal-wrap">
      <div className="cal-container">
        <div className="cal-header">
          <h2 className="cal-title">Calendario de Ocupación</h2>
          <div className="cal-nav">
            <button
              className="cal-nav-btn"
              onClick={() => cambiarAnio(-1)}
              title="Año anterior"
            >
              <ChevronsLeft size={13} />
            </button>
            <button
              className="cal-nav-btn"
              onClick={() => cambiarMes(-1)}
              title="Mes anterior"
            >
              <ChevronLeft size={13} />
            </button>
            <span className="cal-month-label">
              {meses[month]} {year}
            </span>
            <button
              className="cal-nav-btn"
              onClick={() => cambiarMes(1)}
              title="Mes siguiente"
            >
              <ChevronRight size={13} />
            </button>
            <button
              className="cal-nav-btn"
              onClick={() => cambiarAnio(1)}
              title="Año siguiente"
            >
              <ChevronsRight size={13} />
            </button>
            <button className="cal-hoy-btn" onClick={irAHoy}>
              Hoy
            </button>
          </div>
        </div>

        <div className="cal-legend">
          <span className="cal-legend-item">
            <i
              className="cal-legend-dot"
              style={{ background: PENDING_COLOR }}
            />
            Pendiente
          </span>
          <span className="cal-legend-item">
            <i
              className="cal-legend-dot"
              style={{ background: HOUSE_CONFIRM_COLORS["casa frente al mar"] }}
            />
            Frente al mar
          </span>
          <span className="cal-legend-item">
            <i
              className="cal-legend-dot"
              style={{ background: HOUSE_CONFIRM_COLORS["casa con pileta"] }}
            />
            Con pileta
          </span>
          <span className="cal-legend-item">
            <i
              className="cal-legend-dot"
              style={{ background: HOUSE_CONFIRM_COLORS["casa familiar"] }}
            />
            Familiar
          </span>
        </div>

        <div className="cal-grid">
          {diasSemana.map((d) => (
            <div key={d} className="cal-weekday">
              {d}
            </div>
          ))}

          {celdas.map((celda, idx) => {
            const reservasDia = getReservasDia(celda.day, celda.currentMonth);
            return (
              <div
                key={idx}
                className={`cal-cell${!celda.currentMonth ? " cal-cell--other" : ""}${esHoy(celda) ? " cal-cell--today" : ""}`}
              >
                <span
                  className={`cal-day-num${esHoy(celda) ? " cal-day-num--today" : ""}`}
                >
                  {celda.day}
                </span>
                <div className="cal-pills">
                  {reservasDia.map((r, i) => {
                    const { isStart, isEnd } = getPillInfo(r, celda.day);
                    const color = getPillColor(r);
                    return (
                      <div
                        key={i}
                        className={`cal-pill${isStart ? " pill-start" : ""}${isEnd ? " pill-end" : ""}${!isStart && !isEnd ? " pill-mid" : ""}`}
                        style={{ background: color }}
                        title={`${r.casa} — ${r.nombre || ""} ${r.apellido || ""} (${r.estado})`}
                      >
                        {isStart && (
                          <span className="cal-pill-label">
                            {getIniciales(r)}{" "}
                            {HOUSE_ICONS[(r.casa || "").toLowerCase()] || ""}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default AdminCalendar;
