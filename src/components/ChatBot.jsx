import { useState, useEffect, useRef } from "react";
import "./ChatBot.css";

const OPTIONS = {
  A: {
    title: "Casa con pileta",
    text: "🏊 Casa con pileta (Las Toninas):\n• Capacidad: 5-6 personas\n• 2 dormitorios, 2 baños\n• Cochera y Wifi\n• Galería cubierta",
  },
  B: {
    title: "Frente al mar",
    text: "🌊 Casa frente al mar (Las Toninas):\n• Capacidad: 6 personas\n• 2 dormitorios, 1 baño\n• Cochera y Wifi\n• Apta para mascotas",
  },
  C: {
    title: "Casa familiar",
    text: "🏡 Casa familiar (Las Toninas):\n• Capacidad: 5-6 personas\n• 2 dormitorios, 1 baño\n• Cochera y Wifi\n• Apta para mascotas",
  },
};

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [particles, setParticles] = useState([]);
  const chatBodyRef = useRef(null);

  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messages, open]);

  // Generador de pompas/burbujas en los clics
  const triggerBubbleEffect = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const newParticles = Array.from({ length: 10 }).map((_, i) => ({
      id: `${Date.now()}-${i}-${Math.random()}`,
      left: clickX,
      top: clickY,
      size: Math.random() * 8 + 6,
      angle: Math.random() * 360,
      distance: Math.random() * 40 + 20,
      delay: Math.random() * 0.15,
    }));

    setParticles(newParticles);

    setTimeout(() => {
      setParticles([]);
    }, 700);
  };

  const startChat = (e) => {
    triggerBubbleEffect(e);
    setOpen(true);
    if (messages.length === 0) {
      setMessages([
        {
          from: "bot",
          text: "👋 ¡Hola! Soy tu asistente virtual.\n¿En qué propiedad estás interesado hoy?",
        },
      ]);
    }
  };

  const closeChat = (e) => {
    triggerBubbleEffect(e);
    setTimeout(() => {
      setOpen(false);
    }, 250);
  };

  const processResponse = (value, userText) => {
    setMessages((prev) => [...prev, { from: "user", text: userText }]);
    const cleanValue = value.trim().toUpperCase();

    if (OPTIONS[cleanValue]) {
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          { from: "bot", text: OPTIONS[cleanValue].text },
          {
            from: "bot",
            text: "📲 Presioná el botón de abajo o escribí *WHATSAPP* para reservar tu estadía.",
            isAction: true,
          },
        ]);
      }, 450);
      return;
    }

    if (cleanValue === "WHATSAPP") {
      setTimeout(() => {
        const msg =
          "Hola! Quiero información y disponibilidad de las casas en Las Toninas";
        window.open(
          `https://wa.me/5491125687707?text=${encodeURIComponent(msg)}`,
          "_blank",
        );
      }, 200);
      return;
    }

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          from: "bot",
          text: "❌ Por favor, seleccioná una opción válida o escribí WHATSAPP.",
        },
      ]);
    }, 350);
  };

  const handleSend = () => {
    if (!input.trim()) return;
    processResponse(input, input);
    setInput("");
  };

  return (
    <div className="pwb-master-container">
      {/* BOTÓN FLOTANTE CON POMPAS */}
      {!open && (
        <button className="pwb-fab-trigger" onClick={startChat}>
          <span className="pwb-fab-icon">💬</span>
          <span className="pwb-fab-pulse-ring"></span>

          {particles.map((p) => (
            <span
              key={p.id}
              className="pwb-bubble-particle"
              style={{
                left: p.left,
                top: p.top,
                width: p.size,
                height: p.size,
                "--pwb-angle": `${p.angle}deg`,
                "--pwb-dist": `${p.distance}px`,
                animationDelay: `${p.delay}s`,
              }}
            />
          ))}
        </button>
      )}

      {/* VENTANA DEL CHAT */}
      {open && (
        <div className="pwb-chat-window">
          {/* CABECERA */}
          <div className="pwb-chat-header">
            <div className="pwb-header-profile">
              <div className="pwb-avatar-container">
                <span className="pwb-avatar-emoji">🏠</span>
                <span className="pwb-status-dot pwb-status-online"></span>
              </div>
              <div className="pwb-header-text">
                <h4>Reservas Las Toninas</h4>
                <p>Online • Asistente Virtual</p>
              </div>
            </div>

            {/* BOTÓN CERRAR CON EFECTO POMPAS ROJAS */}
            <button className="pwb-close-button" onClick={closeChat}>
              ✕
              {particles.map((p) => (
                <span
                  key={p.id}
                  className="pwb-bubble-particle pwb-bubble-red"
                  style={{
                    left: p.left,
                    top: p.top,
                    width: p.size,
                    height: p.size,
                    "--pwb-angle": `${p.angle}deg`,
                    "--pwb-dist": `${p.distance}px`,
                    animationDelay: `${p.delay}s`,
                  }}
                />
              ))}
            </button>
          </div>

          {/* HISTORIAL DE MENSAJES */}
          <div className="pwb-chat-body" ref={chatBodyRef}>
            {messages.map((m, i) => (
              <div key={i} className={`pwb-message-row pwb-msg-${m.from}`}>
                <div className="pwb-message-bubble">
                  <p className="pwb-message-text">
                    {m.text.split("\n").map((line, idx) => (
                      <span key={idx}>
                        {line}
                        <br />
                      </span>
                    ))}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* CHIPS INTERACTIVOS */}
          <div className="pwb-chat-suggestions">
            {messages.some((m) => m.isAction) ? (
              <button
                className="pwb-suggest-chip pwb-suggest-wa"
                onClick={() =>
                  processResponse("WHATSAPP", "🟢 Quiero reservar por WhatsApp")
                }
              >
                💬 Ir a WhatsApp
              </button>
            ) : (
              <div className="pwb-suggestions-grid">
                <button
                  className="pwb-suggest-chip"
                  onClick={() =>
                    processResponse("A", "Opción A: Casa con pileta")
                  }
                >
                  🏊 Pileta
                </button>
                <button
                  className="pwb-suggest-chip"
                  onClick={() =>
                    processResponse("B", "Opción B: Frente al mar")
                  }
                >
                  🌊 Frente Mar
                </button>
                <button
                  className="pwb-suggest-chip"
                  onClick={() =>
                    processResponse("C", "Opción C: Casa familiar")
                  }
                >
                  🏡 Familiar
                </button>
              </div>
            )}
          </div>

          {/* CUADRO DE ESCRITURA */}
          <div className="pwb-chat-footer">
            <input
              className="pwb-chat-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escribí una opción..."
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
            />
            <button
              className="pwb-send-button"
              onClick={handleSend}
              disabled={!input.trim()}
            >
              <svg viewBox="0 0 24 24" className="pwb-send-svg">
                <path
                  fill="currentColor"
                  d="M3.4 22a.8.8 0 0 1-.74-1c.1-.38 1.83-6 1.83-6.5S3 10.38 2.84 10a.8.8 0 0 1 .53-1L21 2a.8.8 0 0 1 1 .1A.8.8 0 0 1 22 3L13 20.6a.8.8 0 0 1-.94.43L9 20l-4.5 1.8a.74.74 0 0 1-.1.2Z"
                />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
