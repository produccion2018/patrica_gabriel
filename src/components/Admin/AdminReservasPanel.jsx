import "./AdminReservasPanel.css";

/**
 * AdminReservasPanel
 * --------------------------------------------------------
 * Tarjeta "Estadísticas del Mes" (donut + leyenda).
 * Va debajo de AdminActividadReciente, dentro de la misma columna.
 *
 * Datos en 0 por defecto (mock) hasta conectar al backend.
 * Los colores de estado se reciben por props (statusColors)
 * para no acoplar un color fijo a un significado.
 */

const defaultStatusColors = {
  confirmadas: "#38BDF8",
  pendientes: "#7DD3FC",
  canceladas: "#BAE6FD",
};

function Donut({ data, statusColors, size = 96, strokeWidth = 14 }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const total = data.reduce((acc, d) => acc + d.value, 0);

  let cumulative = 0;
  const segments = data.map((d) => {
    const fraction = total > 0 ? d.value / total : 0;
    const dash = fraction * circumference;
    const offset = cumulative * circumference;
    cumulative += fraction;
    return { ...d, dash, offset };
  });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#E0F2FE"
        strokeWidth={strokeWidth}
      />
      {total > 0 &&
        segments.map((seg) => (
          <circle
            key={seg.key}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={statusColors[seg.key] ?? "#38BDF8"}
            strokeWidth={strokeWidth}
            strokeDasharray={`${seg.dash} ${circumference - seg.dash}`}
            strokeDashoffset={-seg.offset}
            strokeLinecap="butt"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        ))}
    </svg>
  );
}

export default function AdminReservasPanel({
  occupancyPercent = 0,
  stats = {
    confirmadas: 0,
    pendientes: 0,
    canceladas: 0,
  },
  statusColors = defaultStatusColors,
}) {
  const total = stats.confirmadas + stats.pendientes + stats.canceladas;
  const pct = (n) => (total > 0 ? Math.round((n / total) * 100) : 0);

  const donutData = [
    { key: "confirmadas", value: stats.confirmadas },
    { key: "pendientes", value: stats.pendientes },
    { key: "canceladas", value: stats.canceladas },
  ];

  const legend = [
    { key: "confirmadas", label: "Reservas Confirmadas" },
    { key: "pendientes", label: "Reservas Pendientes" },
    { key: "canceladas", label: "Reservas Canceladas" },
  ];

  return (
    <div className="arp">
      <div className="arp-stats">
        <h3 className="arp-stats-title">Estadísticas del Mes</h3>

        <div className="arp-donut-wrap">
          <Donut data={donutData} statusColors={statusColors} />
          <div className="arp-donut-center">
            <span className="arp-donut-pct">{occupancyPercent}%</span>
            <span className="arp-donut-label">Ocupación</span>
          </div>
        </div>

        <ul className="arp-legend">
          {legend.map((item) => (
            <li key={item.key} className="arp-legend-item">
              <span className="arp-legend-left">
                <span
                  className="arp-dot"
                  style={{ backgroundColor: statusColors[item.key] }}
                />
                {item.label}
              </span>
              <span className="arp-legend-value">
                {stats[item.key]} ({pct(stats[item.key])}%)
              </span>
            </li>
          ))}
        </ul>

        <div className="arp-total">Total: {total} reservas</div>
      </div>
    </div>
  );
}
