import "./AdminBottomNav.css";
import {
  Home,
  ClipboardList,
  CalendarDays,
  Building2,
  Plus,
} from "lucide-react";

function AdminBottomNav({ seccionActual, setSeccionActual, navigate }) {
  const itemsIzquierda = [
    { key: "Dashboard", label: "Inicio", icon: Home },
    {
      key: "Reservas",
      label: "Reservas",
      icon: ClipboardList,
      scrollTo: "tabla-reservas-section",
    },
  ];

  const itemsDerecha = [
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

  const renderItem = (item) => {
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
  };

  return (
    <nav className="patricia-bottom-nav">
      <div className="patricia-bottom-nav-side">
        {itemsIzquierda.map(renderItem)}
      </div>

      <button
        className="patricia-bottom-nav-fab"
        onClick={() => navigate("/admin/nueva-reserva")}
        aria-label="Nueva reserva"
      >
        <Plus size={24} />
      </button>

      <div className="patricia-bottom-nav-side">
        {itemsDerecha.map(renderItem)}
      </div>
    </nav>
  );
}

export default AdminBottomNav;
