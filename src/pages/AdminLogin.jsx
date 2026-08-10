import "./AdminLogin.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, User, Lock, ArrowRight } from "lucide-react";
import { API_URL } from "../config/api";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();

    try {
      const res = await fetch(`${API_URL}/api/admin/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          usuario: username,
          password: password,
        }),
      });

      const data = await res.json();

      if (data.success) {
        localStorage.setItem("auth", "true");
        localStorage.setItem("token", data.token);
        navigate("/admin");
      } else {
        alert(data.message || "Credenciales incorrectas");
      }
    } catch (error) {
      alert("Error de conexión con el servidor");
    }
  }

  return (
    <div className="admin-login">
      {/* Detalles decorativos de fondo — puramente visuales */}
      <div className="admin-login-glow admin-login-glow-1" />
      <div className="admin-login-glow admin-login-glow-2" />

      <div className="admin-login-card">
        <div className="admin-login-logo">🌊</div>

        <h1>Las Toninas</h1>
        <p>Panel de administración</p>

        <form onSubmit={handleLogin}>
          <div className="admin-login-field">
            <User size={18} className="admin-login-field-icon" />
            <input
              type="text"
              placeholder="Usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="admin-login-field admin-login-password-field">
            <Lock size={18} className="admin-login-field-icon" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              className="admin-login-eye-btn"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={
                showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
              }
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <button type="submit" className="admin-login-submit">
            Entrar
            <ArrowRight size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
