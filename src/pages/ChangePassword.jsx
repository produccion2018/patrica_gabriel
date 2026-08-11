import { useState } from "react";
import { Lock, Eye, EyeOff, CheckCircle2, XCircle } from "lucide-react";
import "./ChangePassword.css";
import { apiFetch } from "../utils/apiFetch";

// Al menos 8 caracteres, una mayúscula, una minúscula y un número.
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

function ChangePassword() {
  const [passwordActual, setPasswordActual] = useState("");
  const [passwordNueva, setPasswordNueva] = useState("");

  const [showActual, setShowActual] = useState(false);
  const [showNueva, setShowNueva] = useState(false);

  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [mensajeTipo, setMensajeTipo] = useState(""); // "ok" | "error"

  const cambiarPassword = async (e) => {
    e.preventDefault();
    setMensaje("");
    setMensajeTipo("");

    // Validación del lado del cliente, para avisar al toque sin
    // esperar la vuelta del servidor.
    if (!PASSWORD_REGEX.test(passwordNueva)) {
      setMensaje(
        "La nueva contraseña debe tener al menos 8 caracteres, con una mayúscula, una minúscula y un número.",
      );
      setMensajeTipo("error");
      return;
    }

    setLoading(true);

    try {
      const res = await apiFetch("/api/admin/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          passwordActual,
          passwordNueva,
        }),
      });

      if (!res) {
        setLoading(false);
        return;
      }

      const data = await res.json();

      if (data.success) {
        setMensaje("Contraseña cambiada correctamente");
        setMensajeTipo("ok");
        setPasswordActual("");
        setPasswordNueva("");
      } else {
        setMensaje(data.message || "Error al cambiar contraseña");
        setMensajeTipo("error");
      }
    } catch (error) {
      setMensaje("Error de conexión con el servidor");
      setMensajeTipo("error");
    }

    setLoading(false);
  };

  return (
    <div className="change-password-container">
      <div className="change-password-header">
        <div className="change-password-icon">
          <Lock size={18} />
        </div>
        <div>
          <h2>Cambiar contraseña</h2>
          <p className="change-password-subtitle">
            Actualizá tus credenciales de acceso al panel
          </p>
        </div>
      </div>

      <form onSubmit={cambiarPassword} className="change-password-form">
        {/* CONTRASEÑA ACTUAL */}
        <div className="cp-field">
          <label htmlFor="cp-actual">Contraseña actual</label>
          <div className="input-eye">
            <input
              id="cp-actual"
              type={showActual ? "text" : "password"}
              placeholder="Ingresá tu contraseña actual"
              value={passwordActual}
              onChange={(e) => setPasswordActual(e.target.value)}
              autoComplete="current-password"
              required
            />
            <button
              type="button"
              className="cp-eye-btn"
              onClick={() => setShowActual(!showActual)}
              aria-label={
                showActual ? "Ocultar contraseña" : "Mostrar contraseña"
              }
            >
              {showActual ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
        </div>

        {/* NUEVA CONTRASEÑA */}
        <div className="cp-field">
          <label htmlFor="cp-nueva">Nueva contraseña</label>
          <div className="input-eye">
            <input
              id="cp-nueva"
              type={showNueva ? "text" : "password"}
              placeholder="Ingresá tu nueva contraseña"
              value={passwordNueva}
              onChange={(e) => setPasswordNueva(e.target.value)}
              autoComplete="new-password"
              required
            />
            <button
              type="button"
              className="cp-eye-btn"
              onClick={() => setShowNueva(!showNueva)}
              aria-label={
                showNueva ? "Ocultar contraseña" : "Mostrar contraseña"
              }
            >
              {showNueva ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
          <small className="cp-hint">
            Mínimo 8 caracteres, con una mayúscula, una minúscula y un número.
          </small>
        </div>

        <button type="submit" className="cp-submit-btn" disabled={loading}>
          {loading ? "Cambiando..." : "Cambiar contraseña"}
        </button>
      </form>

      {mensaje && (
        <p className={`change-password-message cp-msg--${mensajeTipo}`}>
          {mensajeTipo === "ok" ? (
            <CheckCircle2 size={15} />
          ) : (
            <XCircle size={15} />
          )}
          {mensaje}
        </p>
      )}
    </div>
  );
}

export default ChangePassword;
