require("dotenv").config();

const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const enviarCorreo = async (destinatario, asunto, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"Reservas Las Toninas" <${process.env.EMAIL_USER}>`,
      to: destinatario,
      subject: asunto,
      html,
    });
    console.log("📧 EMAIL ENVIADO OK:", info.messageId);
  } catch (error) {
    console.error("❌ ERROR EMAIL:", error);
  }
};

const bloqueGarrafa = `
  <hr/>
  <h3>Información sobre el gas (garrafa)</h3>
  <p>Para fines de semana cortos (hasta 4 días), el consumo está incluido en el alquiler. 
  Si se termina la garrafa, comunicate con YPF Gas para que te la repongan a domicilio 
  (se reintegra el valor).</p>
  <p><strong>YPF Gas / Gladys:</strong><br/>
  +54 9 2246 44-5830 (casa)<br/>
  +54 9 800 222-4113 (móvil)<br/>
  +54 9 2257 54-5805 (Gladys - casa)</p>
`;

const plantillasCasa = {
  "casa frente al mar": (nombre) => `
    <div style="font-family: Arial; padding:30px;">
      <h1>¡Hola ${nombre}! Bienvenido a Casa Frente al Mar</h1>
      <p><strong>Dirección:</strong> Costanera 2169 e/46 y 48</p>
      <p><strong>Wifi:</strong> Gabi — <strong>Contraseña:</strong> otto2023</p>
      <p><strong>Alarma:</strong> 4648</p>
      <h3>Traer:</h3>
      <ul>
        <li>1 juego de sábanas de 2 plazas</li>
        <li>3 o 4 juegos de sábanas de 1 plaza</li>
        <li>Toalla, toallones y repasadores</li>
      </ul>
      <p>En la casa dejamos cubrecamas y frazadas para todas las camas.</p>
      <h3>Termotanque:</h3>
      <ol>
        <li>Sacar la tapa</li>
        <li>Girar la perilla hasta la llamita</li>
        <li>Introducir el Magic click abajo y hacia la izquierda</li>
        <li>Bajar el botón de arriba, se enciende el piloto</li>
        <li>Girar la perilla al máximo y esperar 20 minutos</li>
      </ol>
      <p><strong>Depósito:</strong> $60.000 efectivo (se entrega al ingresar, se devuelve al retirarse).</p>
    </div>`,

  "casa con pileta": (nombre) => `
    <div style="font-family: Arial; padding:30px;">
      <h1>¡Hola ${nombre}! Bienvenido a Casa con Pileta</h1>
      <p><strong>Dirección:</strong> Calle 46 entre 7 y 9</p>
      <p><strong>Wifi:</strong> Mega_red_21 — <strong>Contraseña:</strong> 87008567</p>
      <p><strong>Alarma:</strong> 4646</p>
      <h3>Traer:</h3>
      <ul>
        <li>1 juego de sábanas de 2 plazas</li>
        <li>3 o 4 juegos de sábanas de 1 plaza</li>
        <li>Toalla, toallones y repasadores</li>
      </ul>
      <h3>Calefón:</h3>
      <p>Girar y apretar la perilla al símbolo de llamita (piloto) y apretar el botón tipo chispero. 
      Una vez prendido el piloto, girar hasta la tercera marca (entre la 2da y 3ra el agua sale perfecta). 
      El baño exterior es con agua fría.</p>
      <p><strong>Depósito:</strong> $60.000 efectivo (se entrega al ingresar, se devuelve al retirarse).</p>
    </div>`,

  "casa familiar": (nombre) => `
    <div style="font-family: Arial; padding:30px;">
      <h1>¡Hola ${nombre}! Bienvenido a Casa Familiar</h1>
      <p><strong>Dirección:</strong> Calle 13 N° 1836 e/40 y 42</p>
      <p><strong>Wifi:</strong> Megared 1836 — <strong>Contraseña:</strong> KUIKMA990</p>
      <p><strong>Alarma:</strong> 4042</p>
      <h3>Traer:</h3>
      <ul>
        <li>1 juego de sábanas de 2 plazas</li>
        <li>3 o 4 juegos de sábanas de 1 plaza</li>
        <li>Toalla, toallones y repasadores</li>
      </ul>
      <h3>Calefón:</h3>
      <p>Las instrucciones están en una etiqueta pegada en el calefón. Se enciende con fósforo o Magic click.</p>
      <p><strong>Depósito:</strong> $60.000 efectivo (se entrega al ingresar, se devuelve al retirarse).</p>
    </div>`,
};

const calcularDias = (fechasArray) => {
  if (!Array.isArray(fechasArray) || fechasArray.length < 2) return 99;
  const inicio = new Date(fechasArray[0]);
  const fin = new Date(fechasArray[fechasArray.length - 1]);
  return (fin - inicio) / (1000 * 60 * 60 * 24);
};

const armarHtmlBienvenida = (casa, nombre, fechasArray) => {
  const casaNorm = (casa || "").toLowerCase().trim();
  const plantilla = plantillasCasa[casaNorm];
  let html = plantilla
    ? plantilla(nombre)
    : `<div style="font-family: Arial; padding:30px;"><h1>¡Hola ${nombre}!</h1><p>Recibimos tu solicitud para <strong>${casa}</strong>.</p></div>`;

  if (calcularDias(fechasArray) <= 4) html += bloqueGarrafa;
  return html;
};

// Se mantiene por si en algún lado del código todavía se usa,
// pero en el historial ya no se envía este mail automático fijo:
// ahora se usa armarHtmlMensajePersonalizado con el texto que
// escribe Patricia/Gabriel.
const armarHtmlDespedida = (nombre) => `
  <div style="font-family: Arial; padding:30px;">
    <h1>¡Gracias por tu estadía, ${nombre}!</h1>
    <p>Esperamos que hayas disfrutado tu paso por Las Toninas. 
    Fue un placer recibirte y esperamos verte de nuevo pronto.</p>
    <p>Saludos,<br/>Patricia & Gabriel</p>
  </div>
`;

// ==========================================================
// NUEVO — Mail "libre" desde el Historial.
// El texto (mensaje) lo escribe Patricia/Gabriel en el panel,
// esta función solo le pone el mismo estilo visual de siempre
// (encabezado + firma) alrededor de ese texto.
// El salto de línea que escriban se respeta (se convierte a <br/>).
// ==========================================================
const armarHtmlMensajePersonalizado = (nombre, mensaje) => {
  const mensajeHtml = String(mensaje || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\n/g, "<br/>");

  return `
    <div style="font-family: Arial, sans-serif; max-width:600px; margin:0 auto; border-radius:12px; overflow:hidden; border:1px solid #e2e8f0;">
      <div style="background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%); padding:30px; text-align:center;">
        <h1 style="color:#ffffff; margin:0; font-size:22px;">Reservas Las Toninas</h1>
      </div>
      <div style="padding:30px; background:#ffffff;">
        <p style="color:#0f172a; font-size:15px; margin:0 0 16px;">¡Hola ${nombre}!</p>
        <p style="color:#334155; font-size:15px; line-height:1.7; margin:0;">
          ${mensajeHtml}
        </p>
        <p style="color:#334155; font-size:15px; margin:24px 0 0;">
          Saludos,<br/>Patricia &amp; Gabriel
        </p>
      </div>
    </div>
  `;
};

// ==========================================================
// Mail de "solicitud recibida" (se manda apenas se
// crea la reserva, ANTES de que esté confirmado el pago).
// Formato simple: encabezado azul + resumen básico.
// ==========================================================
const armarHtmlSolicitudRecibida = ({
  nombre,
  casa,
  telefono,
  huespedes,
  fechaEntrada,
  fechaSalida,
}) => `
  <div style="font-family: Arial, sans-serif; max-width:600px; margin:0 auto; border-radius:12px; overflow:hidden; border:1px solid #e2e8f0;">
    <div style="background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%); padding:36px 30px; text-align:center;">
      <h1 style="color:#ffffff; margin:0 0 8px; font-size:26px;">Reservas Las Toninas</h1>
      <p style="color:#dbeafe; margin:0; font-size:15px;">Hemos recibido tu solicitud de reserva</p>
    </div>

    <div style="padding:30px; background:#ffffff;">
      <h2 style="margin:0 0 16px; font-size:20px; color:#0f172a;">¡Hola ${nombre}! 👋</h2>
      <p style="color:#475569; font-size:15px; line-height:1.6; margin:0 0 24px;">
        Gracias por elegir <strong>Reservas Las Toninas</strong>. Recibimos correctamente tu
        solicitud y ya quedó registrada en nuestro sistema.
      </p>

      <h3 style="margin:0 0 12px; font-size:16px; color:#0f172a;">Resumen de tu reserva</h3>
      <table style="width:100%; border-collapse:collapse; font-size:14px; color:#334155;">
        <tr>
          <td style="padding:8px 0; border-bottom:1px solid #f1f5f9;"><strong>Casa</strong></td>
          <td style="padding:8px 0; border-bottom:1px solid #f1f5f9; text-align:right;">${casa}</td>
        </tr>
        <tr>
          <td style="padding:8px 0; border-bottom:1px solid #f1f5f9;"><strong>Nombre</strong></td>
          <td style="padding:8px 0; border-bottom:1px solid #f1f5f9; text-align:right;">${nombre}</td>
        </tr>
        <tr>
          <td style="padding:8px 0; border-bottom:1px solid #f1f5f9;"><strong>Teléfono</strong></td>
          <td style="padding:8px 0; border-bottom:1px solid #f1f5f9; text-align:right;">${telefono || "-"}</td>
        </tr>
        <tr>
          <td style="padding:8px 0; border-bottom:1px solid #f1f5f9;"><strong>Huéspedes</strong></td>
          <td style="padding:8px 0; border-bottom:1px solid #f1f5f9; text-align:right;">${huespedes || "-"}</td>
        </tr>
        <tr>
          <td style="padding:8px 0; border-bottom:1px solid #f1f5f9;"><strong>Entrada</strong></td>
          <td style="padding:8px 0; border-bottom:1px solid #f1f5f9; text-align:right;">${fechaEntrada || "-"}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;"><strong>Salida</strong></td>
          <td style="padding:8px 0; text-align:right;">${fechaSalida || "-"}</td>
        </tr>
      </table>

      <p style="color:#94a3b8; font-size:13px; margin:24px 0 0;">
        En cuanto se confirme el pago te vamos a enviar otro correo con toda la información
        de acceso a la casa (wifi, alarma, indicaciones, etc.).
      </p>
    </div>
  </div>
`;

module.exports = {
  enviarCorreo,
  armarHtmlBienvenida,
  armarHtmlDespedida,
  armarHtmlMensajePersonalizado,
  armarHtmlSolicitudRecibida,
};