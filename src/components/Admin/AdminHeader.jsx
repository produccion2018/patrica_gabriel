import "./AdminHeader.css";
import { useEffect, useRef } from "react";
import { Bell, Plus, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";

function AdminHeader({ reservas = [] }) {
  const navigate = useNavigate();

  const idsAnterioresRef = useRef(new Set());
  const baseCapturadaRef = useRef(false); // true recién cuando tenemos una base real (no vacía)

  // --- FIX SONIDO ---
  const audioRef = useRef(null);
  const audioDesbloqueadoRef = useRef(false);

  // Creamos el audio una sola vez (se usa como "plantilla" para clonar en cada reproducción)
  useEffect(() => {
    audioRef.current = new Audio("/sounds/notificacion.mp3");
    audioRef.current.volume = 1;
    audioRef.current.load();
  }, []);

  // "Desbloqueamos" el audio con la primera interacción del usuario en la página.
  useEffect(() => {
    const desbloquear = () => {
      if (audioDesbloqueadoRef.current || !audioRef.current) return;

      audioRef.current
        .play()
        .then(() => {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
          audioDesbloqueadoRef.current = true;
        })
        .catch(() => {
          // Si falla, se reintentará en el próximo click/tap
        });
    };

    document.addEventListener("click", desbloquear);
    document.addEventListener("keydown", desbloquear);
    document.addEventListener("touchstart", desbloquear);

    return () => {
      document.removeEventListener("click", desbloquear);
      document.removeEventListener("keydown", desbloquear);
      document.removeEventListener("touchstart", desbloquear);
    };
  }, []);

  const reproducirNotificacion = () => {
    if (!audioRef.current) return;
    // Clonamos el nodo de audio para que cada notificación se reproduzca
    // de forma independiente, sin pisar una reproducción anterior que
    // el navegador todavía esté resolviendo (esto es lo que hacía que
    // a veces "no sonara").
    const sonido = audioRef.current.cloneNode();
    sonido.volume = 1;
    sonido.play().catch((err) => {
      console.warn("No se pudo reproducir la notificación:", err);
    });
  };

  useEffect(() => {
    const idsActuales = new Set(reservas.map((r) => r.id || r._id));

    // Si todavía no llegaron datos del backend, no hacemos nada (evita falsos positivos)
    if (idsActuales.size === 0) return;

    if (!baseCapturadaRef.current) {
      // Primera vez que vemos datos reales: esto es la base, no una "reserva nueva"
      baseCapturadaRef.current = true;
    } else {
      // Dispara para CUALQUIER reserva nueva, sin importar el estado
      // (pendiente, confirmada, etc.) — esto ya estaba bien, el fix real
      // era la reproducción del audio en sí.
      const hayReservaNueva = [...idsActuales].some(
        (id) => !idsAnterioresRef.current.has(id),
      );

      if (hayReservaNueva) {
        reproducirNotificacion();
      }
    }

    idsAnterioresRef.current = idsActuales;
  }, [reservas]);

  const pendientes = reservas.filter((r) => r.estado === "pendiente").length;

  const fechaActual = new Date().toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="mireya-header">
      <div className="mireya-left">
        <Calendar size={34} className="mireya-header-icon" strokeWidth={1.8} />

        <div className="mireya-left-text">
          <h1 className="gabriel-title">
            ¡Bienvenidos, Patricia & Gabriel!
            <span className="gabriel-wave">👋</span>
          </h1>
          <p className="mireya-subtitle">
            Resumen general de tu sistema de gestión
          </p>
        </div>
      </div>

      <div className="mireya-actions">
        <div className="gabriel-date-pill">
          <Calendar size={16} className="gabriel-date-icon" strokeWidth={1.8} />
          <span>{fechaActual}</span>
        </div>

        <button className="mireya-bell" title="Notificaciones">
          <Bell size={18} />
          {pendientes > 0 && (
            <span className="notification-badge">{pendientes}</span>
          )}
        </button>

        <button
          className="mireya-btn"
          onClick={() => navigate("/admin/nueva-reserva")}
        >
          <Plus size={16} className="mireya-btn-icon" />
          Nueva Reserva
        </button>
      </div>
    </div>
  );
}

export default AdminHeader;
