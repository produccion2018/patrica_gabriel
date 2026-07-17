import { useState } from "react";
import "./AdminReservationsTable.css";
import Swal from "sweetalert2";
import { API_URL } from "../../config/api";
import {
  Trash2,
  Check,
  Archive,
  MessageSquare,
  Home,
  Calendar,
  Search,
  ChevronLeft,
  ChevronRight,
  Users,
  PawPrint,
} from "lucide-react";

function AdminReservationsTable({
  reservas = [],
  setReservas,
  casaSeleccionada,
}) {
  const [busqueda, setBusqueda] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const reservasPorPagina = 5;

  const getBadgeClass = (estado, casa = "") => {
    const estadoSeguro = estado || "pendiente";
    const casaNorm = (casa || "").toLowerCase();

    if (estadoSeguro === "pendiente") return "art-badge art-badge--pendiente";

    if (estadoSeguro === "eliminada") return "art-badge art-badge--eliminada";

    if (estadoSeguro === "confirmada") {
      if (casaNorm.includes("pileta"))
        return "art-badge art-badge--confirmada-pileta";

      if (casaNorm.includes("mar"))
        return "art-badge art-badge--confirmada-mar";

      if (casaNorm.includes("familiar"))
        return "art-badge art-badge--confirmada-familiar";

      return "art-badge art-badge--confirmada-pileta";
    }

    return "art-badge";
  };

  const confirmarReserva = async (id) => {
    const result = await Swal.fire({
      title: "¿Confirmar reserva?",
      text: "¿Está seguro que desea confirmar esta reserva?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#22c55e",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Sí, confirmar",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) return;

    try {
      const response = await fetch(`${API_URL}/api/reservas/${id}/estado`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          estado: "confirmada",
        }),
      });

      if (response.ok) {
        setReservas((prev) =>
          prev.map((r) =>
            r.id === id || r._id === id ? { ...r, estado: "confirmada" } : r,
          ),
        );

        Swal.fire("Éxito", "Reserva confirmada correctamente.", "success");
      }
    } catch (error) {
      Swal.fire("Error", "No se pudo confirmar la reserva", "error");
    }
  };

  const finalizarReserva = async (id) => {
    const result = await Swal.fire({
      title: "¿Finalizar reserva?",
      text: "La reserva será archivada e irá al historial.",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#0ea5e9",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Sí, finalizar",
    });

    if (!result.isConfirmed) return;

    try {
      const response = await fetch(`${API_URL}/api/reservas/${id}/archivar`, {
        method: "POST",
      });

      if (response.ok) {
        setReservas((prev) => prev.filter((r) => r.id !== id && r._id !== id));

        Swal.fire("Finalizada", "Enviada al historial con éxito.", "success");
      }
    } catch {
      Swal.fire("Error", "No se pudo finalizar", "error");
    }
  };

  const eliminarReserva = async (id) => {
    const result = await Swal.fire({
      title: "¿Eliminar reserva?",
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Sí, eliminar",
    });

    if (!result.isConfirmed) return;

    try {
      const response = await fetch(`${API_URL}/api/reservas/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setReservas((prev) =>
          prev.map((r) =>
            r.id === id || r._id === id ? { ...r, estado: "eliminada" } : r,
          ),
        );

        Swal.fire("Eliminada", "La reserva fue borrada.", "success");
      }
    } catch {
      Swal.fire("Error", "No se pudo eliminar", "error");
    }
  };

  const obtenerFechas = (fechas) => {
    try {
      if (Array.isArray(fechas)) return fechas;
      return JSON.parse(fechas || "[]");
    } catch {
      return [];
    }
  };

  const mostrarMensajeCompleto = (msg) => {
    Swal.fire({
      title: "Mensaje del Huésped",
      text: msg || "Sin observaciones.",
      icon: "info",
      confirmButtonColor: "#0ea5e9",
    });
  };

  const tieneMascota = (valor) => {
    if (typeof valor === "boolean") return valor;

    if (typeof valor === "string") {
      return valor.toLowerCase() === "si" || valor.toLowerCase() === "sí";
    }

    return false;
  };

  const reservasFiltradas = reservas.filter((reserva) => {
    const texto = busqueda.toLowerCase();

    const nombre = (reserva.nombre || "").toLowerCase();
    const apellido = (reserva.apellido || "").toLowerCase();
    const casa = (reserva.casa || "").toLowerCase();
    const telefono = String(reserva.telefono || "");

    const estado = reserva.estado || "pendiente";

    const esActiva = estado !== "finalizada" && estado !== "eliminada";

    const coincideBusqueda =
      nombre.includes(texto) ||
      apellido.includes(texto) ||
      casa.includes(texto) ||
      telefono.includes(texto);

    const coincideCasa =
      !casaSeleccionada ||
      casaSeleccionada === "Todas" ||
      casa === casaSeleccionada.toLowerCase();

    return esActiva && coincideBusqueda && coincideCasa;
  });

  const totalPaginas = Math.ceil(reservasFiltradas.length / reservasPorPagina);

  const reservasPaginadas = reservasFiltradas.slice(
    (paginaActual - 1) * reservasPorPagina,
    paginaActual * reservasPorPagina,
  );

  const getIniciales = (nombre, apellido) => {
    const nom = nombre || "";
    const ape = apellido || "";

    const iniciales = `${nom.charAt(0)}${ape.charAt(0)}`.toUpperCase();

    return iniciales || "U";
  };

  const avatarColors = [
    "#c7d2fe",
    "#fecaca",
    "#bbf7d0",
    "#fde68a",
    "#ddd6fe",
    "#bae6fd",
  ];

  const getAvatarColor = (str = "") => {
    let hash = 0;

    for (let i = 0; i < str.length; i++) {
      hash += str.charCodeAt(i);
    }

    return avatarColors[hash % avatarColors.length];
  };

  return (
    <div className="art-container">
      <div className="art-header">
        <h3 className="art-title">Últimas Reservas</h3>

        <div className="art-search-wrapper">
          <Search size={16} className="art-search-icon" />

          <input
            type="text"
            placeholder="Buscar..."
            value={busqueda}
            onChange={(e) => {
              setBusqueda(e.target.value);
              setPaginaActual(1);
            }}
            className="art-search-input"
          />
        </div>
      </div>

      <div className="art-table-wrapper">
        <table className="art-table">
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Propiedad</th>
              <th>Huéspedes</th>
              <th>Mascota</th>
              <th>Entrada</th>
              <th>Salida</th>
              <th>Mensaje</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {reservasPaginadas.length === 0 ? (
              <tr>
                <td colSpan="9" className="art-empty">
                  Sin reservas activas.
                </td>
              </tr>
            ) : (
              reservasPaginadas.map((r) => {
                const f = obtenerFechas(r.fechas);

                const id = r.id || r._id;

                const bgColor = getAvatarColor(
                  `${r.nombre || ""}${r.apellido || ""}`,
                );

                const conMascota = tieneMascota(r.mascota);

                return (
                  <tr key={id} className="art-row">
                    <td>
                      <div className="art-cliente">
                        <div
                          className="art-avatar"
                          style={{
                            background: bgColor,
                          }}
                        >
                          {getIniciales(r.nombre, r.apellido)}
                        </div>

                        <div>
                          <div className="art-nombre">
                            {r.nombre || "Sin nombre"} {r.apellido || ""}
                          </div>

                          <div className="art-telefono">
                            {r.telefono || "-"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="art-propiedad">
                        <Home size={15} className="art-home-icon" />
                        <span>{r.casa || "Sin propiedad"}</span>
                      </div>
                    </td>

                    <td>
                      <div className="art-huespedes">
                        <Users size={14} className="art-huespedes-icon" />
                        <span>{r.huespedes || "-"}</span>
                      </div>
                    </td>

                    <td>
                      <span
                        className={`art-mascota-badge${
                          conMascota ? " con-mascota" : ""
                        }`}
                      >
                        <PawPrint size={13} />

                        {conMascota
                          ? `Sí${
                              r.cantidadMascotas
                                ? ` (${r.cantidadMascotas})`
                                : ""
                            }`
                          : "No"}
                      </span>
                    </td>

                    <td>
                      <div className="art-fecha">
                        <Calendar size={14} className="art-cal-icon" />
                        <span>{f[0] || "-"}</span>
                      </div>
                    </td>

                    <td>
                      <div className="art-fecha">
                        <Calendar size={14} className="art-cal-icon" />
                        <span>{f[f.length - 1] || "-"}</span>
                      </div>
                    </td>

                    <td className="art-msg-cell">
                      <button
                        className={`art-msg-btn${
                          r.comentarios ? " has-msg" : ""
                        }`}
                        onClick={() =>
                          r.comentarios && mostrarMensajeCompleto(r.comentarios)
                        }
                        title={r.comentarios ? "Ver mensaje" : "Sin mensaje"}
                      >
                        <MessageSquare size={16} />

                        {r.comentarios && <span className="art-msg-dot" />}
                      </button>
                    </td>

                    <td>
                      <span className={getBadgeClass(r.estado, r.casa)}>
                        {(r.estado || "pendiente") === "confirmada" && (
                          <span className="art-badge-dot">✓</span>
                        )}

                        {(r.estado || "pendiente").toUpperCase()}
                      </span>
                    </td>

                    <td>
                      <div className="art-actions">
                        {(r.estado || "pendiente") === "pendiente" && (
                          <button
                            className="art-action-btn art-action-btn--check"
                            onClick={() => confirmarReserva(id)}
                            title="Confirmar"
                          >
                            <Check size={14} />
                          </button>
                        )}

                        {r.estado === "confirmada" && (
                          <button
                            className="art-action-btn art-action-btn--archive"
                            onClick={() => finalizarReserva(id)}
                            title="Finalizar"
                          >
                            <Archive size={14} />
                          </button>
                        )}

                        <button
                          className="art-action-btn art-action-btn--delete"
                          onClick={() => eliminarReserva(id)}
                          title="Eliminar"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="art-footer">
        <span className="art-count">
          Mostrando{" "}
          {reservasPaginadas.length > 0
            ? (paginaActual - 1) * reservasPorPagina + 1
            : 0}{" "}
          a{" "}
          {Math.min(paginaActual * reservasPorPagina, reservasFiltradas.length)}{" "}
          de {reservasFiltradas.length} reservas
        </span>

        <div className="art-pagination">
          <button
            className="art-page-btn"
            onClick={() => setPaginaActual((p) => Math.max(p - 1, 1))}
            disabled={paginaActual === 1}
          >
            <ChevronLeft size={16} />
          </button>

          {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              className={`art-page-btn${
                paginaActual === n ? " art-page-btn--active" : ""
              }`}
              onClick={() => setPaginaActual(n)}
            >
              {n}
            </button>
          ))}

          <button
            className="art-page-btn"
            onClick={() =>
              setPaginaActual((p) => Math.min(p + 1, totalPaginas))
            }
            disabled={paginaActual === totalPaginas || totalPaginas === 0}
          >
            <ChevronRight size={16} />
          </button>

          <button className="art-ver-todas">Ver todas las reservas →</button>
        </div>
      </div>
    </div>
  );
}

export default AdminReservationsTable;
