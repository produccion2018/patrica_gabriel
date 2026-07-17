import "./AdminActividadReciente.css";

function AdminActividadReciente({ actividades = [] }) {
  return (
    <div className="act-panel">
      <h3 className="act-title">Actividad Reciente</h3>

      <div className="act-list">
        {actividades.length === 0 && (
          <span className="act-sub">Sin actividad reciente</span>
        )}

        {actividades.map((a, i) => (
          <div className="act-item" key={i}>
            <div className={`act-icon ${a.iconClass}`}>{a.icon}</div>
            <div className="act-info">
              <span className="act-name">{a.title}</span>
              <span className="act-sub">{a.sub}</span>
            </div>
            <span className="act-time">{a.time}</span>
          </div>
        ))}
      </div>

      <button className="act-ver-btn">Ver toda la actividad →</button>
    </div>
  );
}

export default AdminActividadReciente;
