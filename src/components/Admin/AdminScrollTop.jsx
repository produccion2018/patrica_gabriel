import { useEffect, useState } from "react";
import { ChevronUp } from "lucide-react";
import "./AdminScrollTop.css";

function AdminScrollTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const panel = document.querySelector(".mireya-content");
      const panelScroll = panel ? panel.scrollTop : 0;
      const windowScroll = window.scrollY || document.documentElement.scrollTop;

      if (panelScroll > 250 || windowScroll > 250) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    const panel = document.querySelector(".mireya-content");
    if (panel) {
      panel.addEventListener("scroll", handleScroll);
    }

    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (panel) {
        panel.removeEventListener("scroll", handleScroll);
      }
    };
  }, []);

  const subirArriba = () => {
    const panel = document.querySelector(".mireya-content");

    if (panel && panel.scrollTop > 0) {
      panel.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <button
      className={`admin-scroll-top ${visible ? "show" : ""}`}
      onClick={subirArriba}
      type="button"
      aria-label="Subir arriba"
    >
      <ChevronUp size={18} />
    </button>
  );
}

export default AdminScrollTop;
