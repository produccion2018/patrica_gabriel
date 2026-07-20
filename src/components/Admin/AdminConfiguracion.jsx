import { useRef, useState } from "react";
import "./AdminConfiguracion.css";
import { Moon, Camera, Palette, Type, Check } from "lucide-react";
import { useSettings } from "../../context/SettingsContext";

const COLORES_ACENTO = [
  { nombre: "Celeste", valor: "#2563eb" },
  { nombre: "Verde", valor: "#16a34a" },
  { nombre: "Violeta", valor: "#7c3aed" },
  { nombre: "Rojo", valor: "#ef4444" },
  { nombre: "Naranja", valor: "#f97316" },
  { nombre: "Rosa", valor: "#ec4899" },
  { nombre: "Blanco", valor: "#ffffff" }, // 🔥 RESTAURADO
  { nombre: "Negro", valor: "#0f172a" },
];

const TAMANOS_LETRA = [
  { valor: "chico", etiqueta: "Chico", preview: 12 },
  { valor: "normal", etiqueta: "Normal", preview: 14 },
  { valor: "grande", etiqueta: "Grande", preview: 17 },
];

// Redimensiona y comprime la imagen antes de convertirla a base64.
// Esto evita que fotos pesadas de cámara de celular (varios MB)
// hagan fallar el guardado en localStorage.
function comprimirImagen(archivo, maxAncho = 400, calidad = 0.8) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        let { width, height } = img;

        if (width > maxAncho) {
          height = Math.round((height * maxAncho) / width);
          width = maxAncho;
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        resolve(canvas.toDataURL("image/jpeg", calidad));
      };

      img.onerror = reject;
      img.src = e.target.result;
    };

    reader.onerror = reject;
    reader.readAsDataURL(archivo);
  });
}

function AdminConfiguracion() {
  const { settings, setSettings } = useSettings();

  const inputFotoRef = useRef(null);
  const [fotoPerfil, setFotoPerfil] = useState(null);

  const cambiarFoto = async (e) => {
    const archivo = e.target.files[0];
    if (!archivo) return;

    try {
      const imagenComprimida = await comprimirImagen(archivo);
      setFotoPerfil(imagenComprimida);
      setSettings({
        ...settings,
        profilePic: imagenComprimida,
      });
    } catch (error) {
      console.error("Error al procesar la foto de perfil:", error);
    }
  };

  return (
    <div className="admin-oscuro-panel">
      <div className="admin-oscuro-header">
        <span className="admin-oscuro-eyebrow">Panel administrativo</span>
        <h3>Configuración</h3>
        <p>Personaliza tu panel administrativo</p>
      </div>

      {/* PERFIL */}
      <div className="config-row">
        <div className="admin-oscuro-left">
          <div className="config-avatar-preview">
            {settings.profilePic ? (
              <img src={settings.profilePic} alt="Admin" />
            ) : (
              "AD"
            )}
          </div>

          <div>
            <h4>{settings.userName || "Administrador"}</h4>
            <p>Administrador</p>
          </div>
        </div>

        <div className="config-avatar-control">
          <input
            ref={inputFotoRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={cambiarFoto}
          />

          <button
            className="config-btn-secundario"
            onClick={() => inputFotoRef.current.click()}
          >
            <Camera size={16} />
            <span>Cambiar foto</span>
          </button>
        </div>
      </div>

      {/* MODO OSCURO */}
      <div className="config-row">
        <div className="admin-oscuro-left">
          <div className="admin-oscuro-icon">
            <Moon size={18} />
          </div>
          <div>
            <h4>Modo oscuro</h4>
            <p>Reduce el brillo de la interfaz</p>
          </div>
        </div>

        <button
          className={`admin-oscuro-toggle ${settings.darkMode ? "active" : ""}`}
          onClick={() =>
            setSettings({
              ...settings,
              darkMode: !settings.darkMode,
            })
          }
          aria-pressed={settings.darkMode}
        >
          <span className="admin-oscuro-ball"></span>
        </button>
      </div>

      {/* COLOR ACENTO (CON BLANCO RESTAURADO) */}
      <div className="config-row config-row-column">
        <div className="admin-oscuro-left">
          <div className="admin-oscuro-icon">
            <Palette size={18} />
          </div>
          <div>
            <h4>Color de acento</h4>
            <p>Elige el color principal de tu panel</p>
          </div>
        </div>

        <div className="config-colores">
          {COLORES_ACENTO.map((c) => (
            <button
              key={c.valor}
              className={`config-color-swatch ${
                settings.accentColor === c.valor ? "active" : ""
              } ${c.valor === "#ffffff" ? "es-blanco" : ""}`}
              style={{ background: c.valor }}
              title={c.nombre}
              aria-label={c.nombre}
              onClick={() =>
                setSettings({
                  ...settings,
                  accentColor: c.valor,
                })
              }
            >
              {settings.accentColor === c.valor && (
                <Check size={14} className="config-color-check" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* TAMAÑO DE LETRA */}
      <div className="config-row config-row-column">
        <div className="admin-oscuro-left">
          <div className="admin-oscuro-icon">
            <Type size={18} />
          </div>
          <div>
            <h4>Tamaño de letra</h4>
            <p>Ajusta el tamaño del texto en el panel</p>
          </div>
        </div>

        <div className="config-segmentado">
          {TAMANOS_LETRA.map(({ valor, etiqueta, preview }) => (
            <button
              key={valor}
              className={settings.fontSize === valor ? "active" : ""}
              onClick={() =>
                setSettings({
                  ...settings,
                  fontSize: valor,
                })
              }
            >
              <span className="config-aa" style={{ fontSize: preview }}>
                Aa
              </span>
              {etiqueta}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AdminConfiguracion;
