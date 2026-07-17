import "./AdminSidebar.css";
import { useSettings } from "../../context/SettingsContext";

function AdminSidebar({
  navigate,
  logout,
  seccionActual = "Dashboard",
  setSeccionActual,
  sidebarOpen = false,
  setSidebarOpen,
}) {
  const { settings } = useSettings();

  const handleMenuClick = (seccion, elementoId = null) => {
    setSeccionActual(seccion);
    if (seccion === "Dashboard" && elementoId) {
      setTimeout(() => {
        const el = document.getElementById(elementoId);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
    if (window.innerWidth <= 900 && setSidebarOpen) setSidebarOpen(false);
  };

  const obtenerIniciales = (nombre) => {
    if (!nombre) return "AD";
    return nombre
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <aside className={`patricia-sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
      <div className="patricia-logo">
        <img
          src="/favicon-512x512.png"
          alt="Las Toninas"
          className="patricia-logo-img"
        />
        <div>
          <h2>Las Toninas</h2>
          <span>Alojamientos</span>
        </div>
      </div>

      <nav className="patricia-menu">
        <div className="menu-group">
          <li
            className={seccionActual === "Dashboard" ? "active-menu-item" : ""}
            onClick={() => handleMenuClick("Dashboard")}
          >
            <span className="menu-emoji">🏠</span> Dashboard
          </li>
          <li
            onClick={() =>
              handleMenuClick("Dashboard", "tabla-reservas-section")
            }
          >
            <span className="menu-emoji">📋</span> Reservas
          </li>
          <li
            className={seccionActual === "Calendario" ? "active-menu-item" : ""}
            onClick={() => handleMenuClick("Calendario")}
          >
            <span className="menu-emoji">📅</span> Calendario
          </li>
          <li
            className={seccionActual === "Historial" ? "active-menu-item" : ""}
            onClick={() => handleMenuClick("Historial")}
          >
            <span className="menu-emoji">🕐</span> Historial
          </li>
          <li
            onClick={() =>
              handleMenuClick("Dashboard", "tarjetas-casas-section")
            }
          >
            <span className="menu-emoji">🏘️</span> Propiedades
          </li>
          <li
            className={
              seccionActual === "Comentarios" ? "active-menu-item" : ""
            }
            onClick={() => handleMenuClick("Comentarios")}
          >
            <span className="menu-emoji">💬</span> Comentarios
          </li>
          <li
            className={seccionActual === "Galería" ? "active-menu-item" : ""}
            onClick={() => handleMenuClick("Galería")}
          >
            <span className="menu-emoji">🖼️</span> Galería
          </li>
          <li
            className={
              seccionActual === "Configuración" ? "active-menu-item" : ""
            }
            onClick={() => handleMenuClick("Configuración")}
          >
            <span className="menu-emoji">⚙️</span> Configuración
          </li>
        </div>

        <div className="menu-group-actions">
          <li
            className="action-item btn-reserva"
            onClick={() => navigate("/admin/nueva-reserva")}
          >
            <strong>
              <span className="menu-emoji">➕</span> Nueva Reserva
            </strong>
            <span>Crea una nueva reserva</span>
            <span className="arrow">→</span>
          </li>
          <li
            className="action-item"
            onClick={() => handleMenuClick("Password")}
          >
            <span className="menu-emoji">🔒</span> Cambiar Contraseña
          </li>
          <li className="action-item logout" onClick={logout}>
            <span className="menu-emoji">↩️</span> Cerrar Sesión
          </li>
        </div>
      </nav>

      <div className="patricia-admin-footer">
        {settings.profilePic ? (
          <img
            src={settings.profilePic}
            alt="Admin"
            className="admin-avatar"
            style={{ objectFit: "cover", padding: 0, overflow: "hidden" }}
          />
        ) : (
          <div className="admin-avatar">
            {obtenerIniciales(settings.userName)}
          </div>
        )}

        <div className="admin-info">
          <div className="name">Administrador</div>
          <div className="role role-nombre">Patricia &amp; Gabriel</div>
        </div>
      </div>
    </aside>
  );
}

export default AdminSidebar;
