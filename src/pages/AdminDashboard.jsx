import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import "./AdminDashboard.css";

// RUTA CORREGIDA: sube un nivel (..) y entra en context
import { useSettings } from "../context/SettingsContext";

import AdminSidebar from "../components/Admin/AdminSidebar";
import AdminHeader from "../components/Admin/AdminHeader";
import AdminStats from "../components/Admin/AdminStats";
import AdminPremiumHouses from "../components/Admin/AdminPremiumHouses";
import AdminCalendar from "../components/Admin/AdminCalendar";
import AdminGallery from "../components/Admin/AdminGallery";
import AdminGalleryPage from "../components/Admin/AdminGalleryPage";
import AdminReservationsTable from "../components/Admin/AdminReservationsTable";
import AdminHistorial from "../components/Admin/AdminHistorial";
import AdminConfiguracion from "../components/Admin/AdminConfiguracion";
import AdminComentarios from "../components/Admin/AdminComentarios";
import AdminScrollTop from "../components/Admin/AdminScrollTop";
import AdminActividadReciente from "../components/Admin/AdminActividadReciente";
import AdminReservasPanel from "../components/Admin/AdminReservasPanel";
import ChangePassword from "./ChangePassword";
import { API_URL } from "../config/api";

function AdminDashboard() {
  const navigate = useNavigate();
  // Conectado al contexto
  const { settings } = useSettings();

  const [reservas, setReservas] = useState([]);
  const [casaSeleccionada, setCasaSeleccionada] = useState("Todas");
  const [seccionActiva, setSeccionActiva] = useState("Dashboard");
  const [busqueda, setBusqueda] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const auth = localStorage.getItem("auth");
    if (!auth) {
      navigate("/admin/login", { replace: true });
    }
  }, [navigate]);

  const cargarReservas = () => {
    fetch(`${API_URL}/api/reservas`)
      .then((res) => res.json())
      .then((data) => setReservas(data))
      .catch((error) => console.error("Error cargando reservas:", error));
  };

  useEffect(() => {
    cargarReservas();
    const intervalo = setInterval(cargarReservas, 8000);
    return () => clearInterval(intervalo);
  }, []);

  const logout = () => {
    localStorage.removeItem("auth");
    navigate("/admin/login", { replace: true });
  };

  // ============ ACTIVIDAD RECIENTE (real: estado + mensajes) ============
  const actividadReciente = useMemo(() => {
    const iconosEstado = {
      pendiente: {
        icon: "📅",
        iconClass: "act-icon-blue",
        title: "Nueva reserva recibida",
      },
      confirmada: {
        icon: "✓",
        iconClass: "act-icon-teal",
        title: "Reserva confirmada",
      },
      eliminada: {
        icon: "✕",
        iconClass: "act-icon-red",
        title: "Reserva cancelada",
      },
    };

    const iconoMensaje = {
      icon: "💬",
      iconClass: "act-icon-purple",
      title: "Nuevo mensaje",
    };

    const formatearTiempo = (fecha) => {
      if (!fecha) return "";
      const diffMs = Date.now() - new Date(fecha).getTime();
      const diffMin = Math.floor(diffMs / 60000);
      if (diffMin < 1) return "Recién";
      if (diffMin < 60) return `Hace ${diffMin} min`;
      const diffH = Math.floor(diffMin / 60);
      if (diffH < 24) return `Hace ${diffH} hora${diffH > 1 ? "s" : ""}`;
      const diffD = Math.floor(diffH / 24);
      return `Hace ${diffD} día${diffD > 1 ? "s" : ""}`;
    };

    const eventos = [];

    reservas.forEach((r) => {
      const infoEstado = iconosEstado[r.estado] || iconosEstado.pendiente;

      // Evento por creación / cambio de estado de la reserva
      eventos.push({
        icon: infoEstado.icon,
        iconClass: infoEstado.iconClass,
        title: infoEstado.title,
        sub: r.casa || "-",
        time: formatearTiempo(r.created_at),
        fecha: r.created_at,
      });

      // Evento extra si la reserva trae un mensaje del huésped
      if (r.comentarios && r.comentarios.trim() !== "") {
        eventos.push({
          icon: iconoMensaje.icon,
          iconClass: iconoMensaje.iconClass,
          title: iconoMensaje.title,
          sub: r.casa || "-",
          time: formatearTiempo(r.updated_at || r.created_at),
          fecha: r.updated_at || r.created_at,
        });
      }
    });

    return eventos
      .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
      .slice(0, 5)
      .map(({ fecha, ...resto }) => resto); // limpia el campo auxiliar
  }, [reservas]);

  // ============ ESTADÍSTICAS DEL MES (real) ============
  const statsDelMes = useMemo(() => {
    const ahora = new Date();
    const delMes = reservas.filter((r) => {
      if (!r.created_at) return false;
      const f = new Date(r.created_at);
      return (
        f.getMonth() === ahora.getMonth() &&
        f.getFullYear() === ahora.getFullYear()
      );
    });

    const confirmadas = delMes.filter((r) => r.estado === "confirmada").length;
    const pendientes = delMes.filter((r) => r.estado === "pendiente").length;
    const canceladas = delMes.filter((r) => r.estado === "eliminada").length;
    const total = confirmadas + pendientes + canceladas;
    const occupancyPercent =
      total > 0 ? Math.round((confirmadas / total) * 100) : 0;

    return { confirmadas, pendientes, canceladas, occupancyPercent };
  }, [reservas]);

  return (
    <div className={`patricia-layout ${settings.darkMode ? "dark-mode" : ""}`}>
      <AdminSidebar
        navigate={navigate}
        logout={logout}
        reservas={reservas}
        setSeccionActual={setSeccionActiva}
        seccionActual={seccionActiva}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      <main className="mireya-content">
        <div className="patricia-mobile-topbar">
          <button
            className={`patricia-mobile-toggle ${sidebarOpen ? "is-open" : ""}`}
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
          <span className="patricia-mobile-topbar-title">Las Toninas</span>
        </div>

        {sidebarOpen && (
          <div
            className="patricia-sidebar-overlay"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        <AdminHeader reservas={reservas} alActualizar={cargarReservas} />

        {seccionActiva === "Dashboard" && (
          <>
            <AdminStats reservas={reservas} />

            <div id="tarjetas-casas-section">
              <AdminPremiumHouses />
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "flex-start",
                gap: "16px",
                flexWrap: "wrap",
              }}
            >
              <div style={{ flex: "1 1 0", minWidth: "460px" }}>
                <AdminCalendar
                  reservas={reservas}
                  setReservas={setReservas}
                  casaSeleccionada={casaSeleccionada}
                  setCasaSeleccionada={setCasaSeleccionada}
                />
              </div>

              <div style={{ flex: "0 0 260px" }}>
                <AdminGallery />
              </div>

              <div style={{ flexShrink: 0 }}>
                <AdminActividadReciente actividades={actividadReciente} />
                <AdminReservasPanel
                  occupancyPercent={statsDelMes.occupancyPercent}
                  stats={{
                    confirmadas: statsDelMes.confirmadas,
                    pendientes: statsDelMes.pendientes,
                    canceladas: statsDelMes.canceladas,
                  }}
                  statusColors={{
                    confirmadas: "#2563eb",
                    pendientes: "#f59e0b",
                    canceladas: "#dc2626",
                  }}
                />
              </div>
            </div>

            <div id="tabla-reservas-section">
              <AdminReservationsTable
                reservas={reservas}
                setReservas={setReservas}
                casaSeleccionada={casaSeleccionada}
              />
            </div>
          </>
        )}

        {seccionActiva === "Calendario" && (
          <div className="gabriel-single-view">
            <AdminCalendar
              reservas={reservas}
              setReservas={setReservas}
              casaSeleccionada={casaSeleccionada}
              setCasaSeleccionada={setCasaSeleccionada}
            />
          </div>
        )}

        {seccionActiva === "Historial" && (
          <div className="gabriel-single-view">
            <AdminHistorial />
          </div>
        )}

        {seccionActiva === "Clientes" && (
          <div className="gabriel-single-view">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "12px",
                marginBottom: "20px",
                flexWrap: "wrap",
              }}
            >
              <h2>Historial de Clientes</h2>

              <input
                type="text"
                placeholder="Buscar por nombre..."
                className="search-input"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>

            <div className="historial-container">
              {reservas
                .filter(
                  (r) =>
                    (r.estado === "completada" || r.estado === "finalizada") &&
                    r.nombre?.toLowerCase().includes(busqueda.toLowerCase()),
                )
                .map((r) => (
                  <div key={r.id} className="historial-card">
                    <div>
                      <strong>{r.nombre || "Cliente"}</strong>
                      <p
                        style={{
                          margin: "5px 0",
                          fontSize: "0.9em",
                          color: "#64748b",
                        }}
                      >
                        {r.casa}
                      </p>
                    </div>

                    <div style={{ textAlign: "right" }}>
                      <span className="fecha-tag">{r.fechas}</span>
                      <p style={{ fontSize: "0.8em", color: "#333" }}>
                        {r.estado}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {seccionActiva === "Galería" && (
          <div className="gabriel-single-view">
            <AdminGalleryPage />
          </div>
        )}

        {seccionActiva === "Comentarios" && (
          <div className="gabriel-single-view">
            <AdminComentarios />
          </div>
        )}

        {seccionActiva === "Configuración" && (
          <div className="gabriel-single-view">
            <AdminConfiguracion />
          </div>
        )}

        {seccionActiva === "Password" && (
          <div className="gabriel-single-view">
            <ChangePassword />
          </div>
        )}
      </main>

      <AdminScrollTop />
    </div>
  );
}

export default AdminDashboard;
