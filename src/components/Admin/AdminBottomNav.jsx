import "./AdminBottomNav.css";
import {
  Home,
  ClipboardList,
  CalendarDays,
  Building2,
  Menu,
} from "lucide-react";

function AdminBottomNav({
  seccionActual,
  setSeccionActual,
  sidebarOpen,
  setSidebarOpen,
}) {
  const items = [
    { key: "Dashboard", label: "Dashboard", icon: Home },
    {
      key: "Reservas",
      label: "Reservas",
      icon: ClipboardList,
      scrollTo: "tabla-reservas-section",
    },
    { key: "Calendario", label: "Calendario", icon: CalendarDays },
    {
      key: "Propiedades",
      label: "Propiedades",
      icon: Building2,
      scrollTo: "tarjetas-casas-section",
    },
  ];

  const handleClick = (item) => {
    if (item.scrollTo) {
      setSeccionActual("Dashboard");
      setTimeout(() => {
        const el = document.getElementById(item.scrollTo);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    } else {
      setSeccionActual(item.key);
    }
  };

  return (
    <nav className="patricia-bottom-nav">
      {items.map((item) => {
        const Icon = item.icon;
        const active = seccionActual === item.key;
        return (
          <button
            key={item.key}
            className={`patricia-bottom-nav-btn ${active ? "active" : ""}`}
            onClick={() => handleClick(item)}
          >
            <Icon size={20} />
            <span>{item.label}</span>
          </button>
        );
      })}

      <button
        className={`patricia-bottom-nav-btn ${sidebarOpen ? "active" : ""}`}
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        <Menu size={20} />
        <span>Más</span>
      </button>
    </nav>
  );
}

export default AdminBottomNav;
