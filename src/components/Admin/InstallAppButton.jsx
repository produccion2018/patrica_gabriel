import { useEffect, useState } from "react";
import { FaDownload, FaTimes } from "react-icons/fa";

// ¿Ya está abierta como app instalada?
const esAppInstalada = () =>
  window.matchMedia("(display-mode: standalone)").matches ||
  window.navigator.standalone === true;

// iPhone / iPad (Safari no tiene botón automático de instalar)
const esIOS = () =>
  /iphone|ipad|ipod/i.test(navigator.userAgent) ||
  (navigator.userAgent.includes("Macintosh") && navigator.maxTouchPoints > 1);

export default function InstallAppButton() {
  // Evento que el navegador (Chrome, Edge, Android) nos da para poder instalar.
  const [promptEvent, setPromptEvent] = useState(null);
  const [instalada, setInstalada] = useState(() => esAppInstalada());
  const [ayuda, setAyuda] = useState(false);

  useEffect(() => {
    // Registra el service worker (necesario para que se pueda instalar).
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }

    const onBeforeInstall = (e) => {
      e.preventDefault();
      setPromptEvent(e);
    };
    const onInstalled = () => {
      setInstalada(true);
      setPromptEvent(null);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  // Si ya está instalada, no se muestra nada.
  if (instalada) return null;

  const ios = esIOS();

  // El botón se muestra siempre (mientras la app no esté instalada).
  // Si el navegador permite instalar con un toque, instala directo;
  // si no, muestra una ayuda con los pasos manuales.
  const instalar = async () => {
    if (promptEvent) {
      promptEvent.prompt();
      await promptEvent.userChoice;
      setPromptEvent(null);
    } else {
      setAyuda(true);
    }
  };

  return (
    <>
      <style>{`
        .install-app-btn{
          display:inline-flex;
          align-items:center;
          gap:8px;
          padding:10px 16px;
          border:none;
          border-radius:12px;
          background:linear-gradient(135deg,#0ea5e9,#0369a1);
          color:#fff;
          font-weight:700;
          font-size:14px;
          cursor:pointer;
          box-shadow:0 6px 16px rgba(14,165,233,.35);
          transition:transform .2s ease, box-shadow .2s ease;
        }
        .install-app-btn:hover{
          transform:translateY(-2px);
          box-shadow:0 10px 22px rgba(14,165,233,.5);
        }
        .install-ios-overlay{
          position:fixed;
          inset:0;
          z-index:99999;
          background:rgba(0,0,0,.6);
          display:flex;
          align-items:flex-end;
          justify-content:center;
          padding:16px;
        }
        .install-ios-card{
          position:relative;
          width:100%;
          max-width:420px;
          background:#fff;
          color:#0f172a;
          border-radius:20px;
          padding:22px 20px;
          box-shadow:0 20px 50px rgba(0,0,0,.4);
        }
        .install-ios-card h4{
          margin:0 0 10px;
          font-size:17px;
        }
        .install-ios-card ol{
          margin:0;
          padding-left:20px;
          line-height:1.6;
          font-size:15px;
        }
        .install-ios-close{
          position:absolute;
          top:12px;
          right:12px;
          width:32px;
          height:32px;
          border:none;
          border-radius:50%;
          background:#e2e8f0;
          cursor:pointer;
        }
      `}</style>

      <button type="button" className="install-app-btn" onClick={instalar}>
        <FaDownload />
        Instalar app
      </button>

      {ayuda && (
        <div className="install-ios-overlay" onClick={() => setAyuda(false)}>
          <div
            className="install-ios-card"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="install-ios-close"
              onClick={() => setAyuda(false)}
              aria-label="Cerrar"
            >
              <FaTimes />
            </button>

            {ios ? (
              <>
                <h4>Instalar en tu iPhone</h4>
                <ol>
                  <li>Abrí esta página en Safari.</li>
                  <li>Tocá el botón Compartir (el cuadrado con la flecha).</li>
                  <li>Elegí "Agregar a inicio".</li>
                </ol>
              </>
            ) : (
              <>
                <h4>Instalar la app</h4>
                <ol>
                  <li>
                    Abrí el menú del navegador (los tres puntitos arriba a la
                    derecha).
                  </li>
                  <li>
                    Elegí "Instalar app" o "Agregar a la pantalla de inicio".
                  </li>
                  <li>Confirmá y listo: aparece el ícono de Tortuninas.</li>
                </ol>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
