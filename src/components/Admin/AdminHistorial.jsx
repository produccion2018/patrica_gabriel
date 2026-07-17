import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { Home, Calendar, LogOut, Trash2, Send, FileDown } from "lucide-react";
import "./AdminHistorial.css";
import { API_URL } from "../../config/api";

const HOUSE_COLORS = {
  "casa frente al mar": "#22c55e",
  "casa con pileta": "#ec4899",
  "casa familiar": "#f97316",
};

const NOMBRES_MES = [
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

// Rango fijo de años para el selector del reporte PDF.
// La página arrancó en 2006, así que no tiene sentido mostrar
// años anteriores. Se deja margen hasta 2030.
const ANIO_MIN = 2006;
const ANIO_MAX = 2030;

function AdminHistorial() {
  const [historial, setHistorial] = useState([]);
  const [pagina, setPagina] = useState(1);
  const porPagina = 5;

  const ahora = new Date();
  const [mesReporte, setMesReporte] = useState(ahora.getMonth() + 1);
  const [anioReporte, setAnioReporte] = useState(ahora.getFullYear());
  const [generandoPDF, setGenerandoPDF] = useState(false);

  const cargar = () => {
    fetch(`${API_URL}/api/historial`)
      .then((res) => res.json())
      .then((data) => setHistorial(Array.isArray(data) ? data : []))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    cargar();
  }, []);

  const eliminar = async (id) => {
    const resultado = await Swal.fire({
      title: "¿Eliminar registro?",
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#dc2626",
    });
    if (!resultado.isConfirmed) return;

    try {
      const res = await fetch(`${API_URL}/api/historial/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        Swal.fire(
          "Eliminado",
          "El registro fue eliminado correctamente.",
          "success",
        );
        cargar();
      } else {
        Swal.fire("Error", "No se pudo eliminar el registro.", "error");
      }
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "No se pudo conectar con el servidor.", "error");
    }
  };

  const enviarMensaje = async (r) => {
    const { value: mensaje } = await Swal.fire({
      title: `Mensaje para ${r.nombre} ${r.apellido}`,
      input: "textarea",
      inputPlaceholder:
        "Escribí acá lo que le querés enviar (promoción, agradecimiento, aviso, etc.)...",
      inputAttributes: {
        "aria-label": "Escribí el mensaje",
      },
      showCancelButton: true,
      confirmButtonText: "Enviar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#2563eb",
      inputValidator: (value) => {
        if (!value || !value.trim()) {
          return "Escribí algo antes de enviar";
        }
      },
    });

    if (!mensaje) return;

    try {
      const res = await fetch(
        `${API_URL}/api/historial/${r.id}/email`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mensaje }),
        },
      );
      const data = await res.json();
      if (data.success) {
        Swal.fire("Enviado", "El correo se envió correctamente.", "success");
      } else {
        Swal.fire(
          "Error",
          data.error || "No se pudo enviar el correo.",
          "error",
        );
      }
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "No se pudo conectar con el servidor.", "error");
    }
  };

  const descargarReporte = async () => {
    setGenerandoPDF(true);
    try {
      const res = await fetch(
        `${API_URL}/api/historial/reporte?mes=${mesReporte}&anio=${anioReporte}`,
      );
      if (!res.ok) throw new Error("Error generando el reporte");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `reporte-${anioReporte}-${String(mesReporte).padStart(2, "0")}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "No se pudo generar el reporte PDF.", "error");
    } finally {
      setGenerandoPDF(false);
    }
  };

  const getIniciales = (nombre = "", apellido = "") =>
    `${nombre.charAt(0)}${apellido.charAt(0)}`.toUpperCase();

  const totalPaginas = Math.ceil(historial.length / porPagina);
  const dataVisible = historial.slice(
    (pagina - 1) * porPagina,
    pagina * porPagina,
  );

  // Rango fijo 2006-2030 en vez de anioActual -1/+1
  const anios = [];
  for (let a = ANIO_MAX; a >= ANIO_MIN; a--) {
    anios.push(a);
  }

  return (
    <div className="historial-container">
      <div className="historial-header">
        <h2 className="historial-title">Historial de Reservas</h2>
        <span className="historial-count">
          {historial.length} reservas finalizadas
        </span>
      </div>

      <div className="historial-reporte-bar">
        <div className="historial-reporte-selects">
          <select
            value={mesReporte}
            onChange={(e) => setMesReporte(Number(e.target.value))}
          >
            {NOMBRES_MES.map((nombre, i) => (
              <option key={i + 1} value={i + 1}>
                {nombre}
              </option>
            ))}
          </select>
          <select
            value={anioReporte}
            onChange={(e) => setAnioReporte(Number(e.target.value))}
          >
            {anios.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>
        <button
          className="btn-reporte-pdf"
          onClick={descargarReporte}
          disabled={generandoPDF}
        >
          <FileDown size={15} />
          {generandoPDF ? "Generando..." : "Descargar reporte PDF"}
        </button>
      </div>

      {dataVisible.length === 0 ? (
        <div className="historial-empty">
          Todavía no hay reservas en el historial.
        </div>
      ) : (
        <div className="historial-grid">
          {dataVisible.map((r) => {
            let entrada = "-";
            let salida = "-";
            try {
              const fechas = JSON.parse(r.fechas || "[]");
              if (Array.isArray(fechas) && fechas.length > 0) {
                entrada = fechas[0];
                salida = fechas[fechas.length - 1];
              }
            } catch {
              entrada = "-";
              salida = "-";
            }

            const casaColor =
              HOUSE_COLORS[(r.casa || "").toLowerCase()] || "#94a3b8";

            return (
              <div key={r.id} className="historial-card">
                <div className="historial-card-top">
                  <div className="historial-avatar">
                    {getIniciales(r.nombre, r.apellido)}
                  </div>
                  <div className="historial-nombre-wrap">
                    <h3>
                      {r.nombre} {r.apellido}
                    </h3>
                    <span
                      className="historial-badge-casa"
                      style={{
                        background: `${casaColor}22`,
                        color: casaColor,
                        borderColor: `${casaColor}55`,
                      }}
                    >
                      <Home size={11} /> {r.casa}
                    </span>
                  </div>
                </div>

                <div className="historial-fechas">
                  <div className="historial-fecha-item">
                    <Calendar size={14} />
                    <span>
                      Entró: <strong>{entrada}</strong>
                    </span>
                  </div>
                  <div className="historial-fecha-item">
                    <LogOut size={14} />
                    <span>
                      Salió: <strong>{salida}</strong>
                    </span>
                  </div>
                </div>

                <div className="historial-actions">
                  <button
                    className="btn-mensaje"
                    onClick={() => enviarMensaje(r)}
                  >
                    <Send size={14} /> Enviar mensaje
                  </button>
                  <button
                    className="btn-eliminar"
                    onClick={() => eliminar(r.id)}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {totalPaginas > 1 && (
        <div className="paginacion">
          {Array.from({ length: totalPaginas }, (_, i) => (
            <button
              key={i}
              className={pagina === i + 1 ? "pagina-activa" : ""}
              onClick={() => setPagina(i + 1)}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminHistorial;
