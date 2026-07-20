import "./AdminStats.css";

function AdminStats({ reservas = [] }) {
  const reservasActivas = reservas.filter(
    (reserva) =>
      reserva.estado === "pendiente" || reserva.estado === "confirmada",
  ).length;

  const confirmadas = reservas.filter(
    (reserva) => reserva.estado === "confirmada",
  ).length;

  const pendientes = reservas.filter(
    (reserva) => reserva.estado === "pendiente",
  ).length;

  const totalClientes = new Set(
    reservas
      .filter(
        (reserva) =>
          reserva.estado === "pendiente" || reserva.estado === "confirmada",
      )
      .map((reserva) =>
        `${reserva.nombre || ""}-${reserva.telefono || reserva.email || ""}`
          .trim()
          .toLowerCase(),
      )
      .filter((clave) => clave.replace("-", "") !== ""),
  ).size;

  return (
    <>
      <div className="mireya-header-row">
        <div className="mireya-icon-circle">
          <svg viewBox="0 0 24 24" fill="none">
            <rect x="4" y="12" width="3.5" height="8" rx="1" fill="#0ea5e9" />
            <rect
              x="10.2"
              y="7"
              width="3.5"
              height="13"
              rx="1"
              fill="#0369a1"
            />
            <rect
              x="16.4"
              y="3"
              width="3.5"
              height="17"
              rx="1"
              fill="#0ea5e9"
            />
          </svg>
        </div>
        <div className="mireya-title">
          <h2>Resumen General</h2>
          <p className="mireya-subtitle">
            Vista rápida del estado actual de tu sistema de reservas
          </p>
        </div>
      </div>

      <div className="gabriel-cards">
        {/* Reservas Activas */}
        <div className="gabriel-item">
          <div className="gabriel-icon-col">
            <div className="gabriel-icon-box gabriel-icon-blue">
              <svg viewBox="0 0 24 24" fill="none">
                <rect
                  x="3"
                  y="4"
                  width="18"
                  height="17"
                  rx="2"
                  stroke="white"
                  strokeWidth="2"
                />
                <path
                  d="M3 9H21"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M8 2V6"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M16 2V6"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <span className="gabriel-underline gabriel-underline-blue"></span>
          </div>
          <div className="gabriel-info">
            <div className="gabriel-info-top">
              <span className="gabriel-value">{reservasActivas}</span>
              <button className="gabriel-menu-dots" aria-label="Más opciones">
                <svg viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="5" r="1.6" fill="currentColor" />
                  <circle cx="12" cy="12" r="1.6" fill="currentColor" />
                  <circle cx="12" cy="19" r="1.6" fill="currentColor" />
                </svg>
              </button>
            </div>
            <span className="gabriel-label">Reservas Activas</span>
          </div>
        </div>

        {/* Reservas Confirmadas */}
        <div className="gabriel-item">
          <div className="gabriel-icon-col">
            <div className="gabriel-icon-box gabriel-icon-teal">
              <svg viewBox="0 0 24 24" fill="none">
                <path
                  d="M5 13L9.5 17.5L19 7"
                  stroke="white"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <span className="gabriel-underline gabriel-underline-teal"></span>
          </div>
          <div className="gabriel-info">
            <div className="gabriel-info-top">
              <span className="gabriel-value">{confirmadas}</span>
              <button className="gabriel-menu-dots" aria-label="Más opciones">
                <svg viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="5" r="1.6" fill="currentColor" />
                  <circle cx="12" cy="12" r="1.6" fill="currentColor" />
                  <circle cx="12" cy="19" r="1.6" fill="currentColor" />
                </svg>
              </button>
            </div>
            <span className="gabriel-label">Reservas Confirmadas</span>
          </div>
        </div>

        {/* Pendientes */}
        <div className="gabriel-item">
          <div className="gabriel-icon-col">
            <div className="gabriel-icon-box gabriel-icon-purple">
              <svg viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="9" stroke="white" strokeWidth="2" />
                <path
                  d="M12 7V12L15.5 14.5"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <span className="gabriel-underline gabriel-underline-purple"></span>
          </div>
          <div className="gabriel-info">
            <div className="gabriel-info-top">
              <span className="gabriel-value">{pendientes}</span>
              <button className="gabriel-menu-dots" aria-label="Más opciones">
                <svg viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="5" r="1.6" fill="currentColor" />
                  <circle cx="12" cy="12" r="1.6" fill="currentColor" />
                  <circle cx="12" cy="19" r="1.6" fill="currentColor" />
                </svg>
              </button>
            </div>
            <span className="gabriel-label">Pendientes</span>
          </div>
        </div>

        {/* Total Clientes */}
        <div className="gabriel-item">
          <div className="gabriel-icon-col">
            <div className="gabriel-icon-box gabriel-icon-orange">
              <svg viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="8" r="3.5" stroke="white" strokeWidth="2" />
                <path
                  d="M4.5 20c0-4.1 3.4-7 7.5-7s7.5 2.9 7.5 7"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <span className="gabriel-underline gabriel-underline-orange"></span>
          </div>
          <div className="gabriel-info">
            <div className="gabriel-info-top">
              <span className="gabriel-value">{totalClientes}</span>
              <button className="gabriel-menu-dots" aria-label="Más opciones">
                <svg viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="5" r="1.6" fill="currentColor" />
                  <circle cx="12" cy="12" r="1.6" fill="currentColor" />
                  <circle cx="12" cy="19" r="1.6" fill="currentColor" />
                </svg>
              </button>
            </div>
            <span className="gabriel-label">Total Clientes</span>
          </div>
        </div>
      </div>
    </>
  );
}

export default AdminStats;
