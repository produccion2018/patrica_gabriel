require("dotenv").config();

const https = require("https");

// Cambiamos de Gmail/SMTP a Resend: Render (plan gratis) bloquea las
// conexiones salientes por los puertos que usa el envío tradicional de
// mail (SMTP), por eso nunca llegaba a conectar. Resend manda el mail
// por HTTPS (el mismo tipo de conexión que usa cualquier página web),
// que sí está permitida.
//
// OJO: hasta que no se verifique un dominio propio en Resend (se hace
// cuando el sitio ya esté en su hosting definitivo), esta cuenta gratis
// SOLO puede mandar mails a la casilla con la que se registró la cuenta
// de Resend. Para mandarle a cualquier cliente hace falta ese paso.
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const REMITENTE = "Reservas Las Toninas <onboarding@resend.dev>";

const enviarCorreo = (destinatario, asunto, html) => {
  return new Promise((resolve) => {
    const payload = JSON.stringify({
      from: REMITENTE,
      to: [destinatario],
      subject: asunto,
      html,
    });

    const options = {
      hostname: "api.resend.com",
      path: "/emails",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Length": Buffer.byteLength(payload),
      },
    };

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log("📧 EMAIL ENVIADO OK (Resend):", data);
        } else {
          console.error("❌ ERROR EMAIL (Resend):", res.statusCode, data);
        }
        resolve();
      });
    });

    req.on("error", (error) => {
      console.error("❌ ERROR EMAIL (conexión):", error.message);
      resolve();
    });

    req.write(payload);
    req.end();
  });
};

// ==========================================================
// DISEÑO BASE COMPARTIDO
// Todas las plantillas usan este mismo "marco": encabezado con
// degradé + ícono de sol/playa a modo de logo, tarjeta blanca
// con el contenido adentro, y firma al final. Así, aunque cada
// casa tenga contenido distinto, todos los mails se ven parte
// de la misma familia visual (no un mail más, uno de "Las Toninas").
// ==========================================================
const envolverEmail = (tituloHeader, subtituloHeader, contenidoHtml) => `
  <div style="font-family: Arial, sans-serif; max-width:600px; margin:0 auto; border-radius:14px; overflow:hidden; border:1px solid #e2e8f0;">
    <div style="background: linear-gradient(135deg, #0ea5e9 0%, #1e3a8a 100%); padding:34px 30px; text-align:center;">
      <div style="font-size:34px; line-height:1; margin-bottom:6px;">☀️🌊</div>
      <h1 style="color:#ffffff; margin:0 0 6px; font-size:24px; letter-spacing:0.5px;">LAS TONINAS</h1>
      <p style="color:#dbeafe; margin:0; font-size:14px;">${tituloHeader}</p>
      ${subtituloHeader ? `<p style="color:#bfdbfe; margin:6px 0 0; font-size:13px;">${subtituloHeader}</p>` : ""}
    </div>
    <div style="padding:30px; background:#ffffff;">
      ${contenidoHtml}
    </div>
    <div style="padding:18px 30px; background:#f8fafc; border-top:1px solid #f1f5f9; text-align:center;">
      <p style="color:#94a3b8; font-size:12px; margin:0;">Reservas Las Toninas · Patricia &amp; Gabriel</p>
    </div>
  </div>
`;

const seccion = (titulo, contenidoHtml) => `
  <div style="margin-bottom:24px;">
    <h3 style="margin:0 0 10px; font-size:15px; color:#0f172a; border-bottom:2px solid #e0f2fe; padding-bottom:6px;">${titulo}</h3>
    ${contenidoHtml}
  </div>
`;

const listaConIconos = (items) => `
  <ul style="margin:0; padding:0; list-style:none; color:#334155; font-size:14px; line-height:1.9;">
    ${items.map((i) => `<li>⭐ ${i}</li>`).join("")}
  </ul>
`;

const cajaDestacada = (colorFondo, colorBorde, contenidoHtml) => `
  <div style="background:${colorFondo}; border:1px solid ${colorBorde}; border-radius:10px; padding:16px 18px; margin-top:6px;">
    ${contenidoHtml}
  </div>
`;

const bloqueDatosImportantes = ({ direccion, wifi, contrasena, alarma }) =>
  seccion(
    "📍 Datos importantes",
    cajaDestacada(
      "#f0f9ff",
      "#bae6fd",
      `
        <p style="margin:0 0 6px; color:#0f172a; font-size:14px;"><strong>Dirección:</strong> ${direccion}</p>
        <p style="margin:0 0 6px; color:#0f172a; font-size:14px;"><strong>Wifi:</strong> ${wifi} &nbsp;|&nbsp; <strong>Contraseña:</strong> ${contrasena}</p>
        <p style="margin:0; color:#0f172a; font-size:14px;"><strong>Alarma:</strong> ${alarma}</p>
      `,
    ),
  );

const bloqueQueTraer = () =>
  seccion(
    "🧳 Recordá traer",
    `
      ${listaConIconos([
        "1 juego de sábanas de 2 plazas",
        "3 o 4 juegos de sábanas de 1 plaza",
        "Toallas, toallones y repasadores",
      ])}
      <p style="margin:10px 0 0; color:#475569; font-size:13px; font-style:italic;">
        ✳️ En la casa dejamos cubrecamas y frazadas para todas las camas.
      </p>
    `,
  );

const bloqueDeposito = () =>
  seccion(
    "💰 Depósito",
    cajaDestacada(
      "#fffbeb",
      "#fde68a",
      `
        <p style="margin:0 0 10px; color:#7c2d12; font-size:14px;"><strong>$ 100.000 en efectivo</strong></p>
        <p style="margin:0 0 10px; color:#78716c; font-size:13px; line-height:1.6;">
          Se entrega al ingresar a la casa y se devuelve el día que se retiran.
        </p>
        <p style="margin:0 0 10px; color:#78716c; font-size:13px; line-height:1.6;">
          No se reintegra en estos casos: rotura de vasos, tazas, platos, etc. que no sean
          reemplazados por uno similar; o si el microondas, la cocina, el horno, la plancha,
          el sartén o el baño quedan sin la higiene adecuada.
        </p>
        <p style="margin:0; color:#78716c; font-size:13px; line-height:1.6;">
          Les pedimos que revisen y verifiquen el estado de las cosas e instalaciones al
          ingresar, ya que deben entregarse en las mismas condiciones al retirarse. Así
          evitamos inconvenientes y reclamos después. ¡Muchas gracias!
        </p>
      `,
    ),
  );

const bloqueGarrafaFamiliar = () =>
  seccion(
    "🔥 Gas (garrafa)",
    cajaDestacada(
      "#fef2f2",
      "#fecaca",
      `
        <p style="margin:0 0 10px; color:#7f1d1d; font-size:13px; line-height:1.6;">
          La casa funciona con gas a garrafa.
        </p>
        <p style="margin:0 0 10px; color:#7f1d1d; font-size:13px; line-height:1.6;">
          <strong>Estadías cortas (hasta 4 días):</strong> el consumo está incluido en el
          alquiler. Como no podemos saber cuándo se termina la garrafa, si se acaba deben
          llamar a YPF Gas (dura más) para que la vengan a conectar a domicilio — se
          reintegra el valor.
        </p>
        <p style="margin:0 0 10px; color:#7f1d1d; font-size:13px; line-height:1.6;">
          <strong>Alquileres por semana o quincena:</strong> solo se cubre la primera
          garrafa (dura entre 10 y 15 días aprox. según el uso). No dejar el
          termotanque/calefón prendido todo el día.
        </p>
        <p style="margin:0 0 10px; color:#7f1d1d; font-size:13px; line-height:1.6;">
          La garrafa queda conectada y cerrada afuera. Al llegar, deben abrirla.
        </p>
        <p style="margin:0; color:#7f1d1d; font-size:13px; line-height:1.6;">
          <strong>YPF Gas Toninas/Sta Teresita:</strong><br/>
          Casa: +54 9 2246 44-5830<br/>
          Celular: +54 9 800 222-4113<br/><br/>
          <strong>Gas Gladys Toninas:</strong><br/>
          Casa: +54 9 2257 54-5805
        </p>
      `,
    ),
  );

// ==========================================================
// CASA FRENTE AL MAR
// ==========================================================
const plantillaFrenteAlMar = (nombre) => {
  const contenido = `
    <p style="color:#0f172a; font-size:15px; margin:0 0 20px;">¡Hola ${nombre}! Te damos la bienvenida a <strong>Casa Frente al Mar</strong> 🌊</p>

    ${seccion(
      "🏠 Sobre la casa",
      listaConIconos([
        "Capacidad: 6 personas",
        "3 ambientes, 2 dormitorios, 1 baño",
        "1 cochera",
        "Cocina comedor con microondas",
        "TV por cable",
        "Internet / wifi",
        "Patio y parrilla atrás, jardín adelante",
        "Apta para mascotas",
      ]),
    )}

    ${bloqueDatosImportantes({
      direccion: "Costanera 2169 e/46 y 48",
      wifi: "Gabi",
      contrasena: "otto2023",
      alarma: "4648",
    })}

    ${seccion(
      "📺 Guía de TV",
      `<p style="margin:0; color:#334155; font-size:14px; line-height:1.7;">
        Es un Smart TV: podés ver YouTube, Netflix, etc. (si tenés cuenta). También cuenta con servicio de video cable.
      </p>`,
    )}

    ${seccion(
      "🚿 Cómo encender el termotanque",
      `<ol style="margin:0; padding-left:20px; color:#334155; font-size:14px; line-height:1.9;">
        <li>Sacar la tapa.</li>
        <li>Girar la perilla hasta donde está la llamita.</li>
        <li>Introducir el Magic click abajo y hacia la izquierda.</li>
        <li>Bajar el botón de arriba y se enciende el piloto.</li>
        <li>Girar la perilla al máximo y dejar 20 minutos para tener agua caliente.</li>
      </ol>`,
    )}

    ${seccion(
      "🔥 Gas",
      `<p style="margin:0; color:#334155; font-size:14px; line-height:1.7;">
        La casa tiene <strong>gas natural</strong>, así que no hay que ocuparse de garrafas.
      </p>`,
    )}

    ${bloqueQueTraer()}
    ${bloqueDeposito()}
  `;

  return envolverEmail("¡Tu estadía ya está confirmada!", "Casa Frente al Mar", contenido);
};

// ==========================================================
// CASA CON PILETA
// ==========================================================
const plantillaConPileta = (nombre) => {
  const contenido = `
    <p style="color:#0f172a; font-size:15px; margin:0 0 20px;">¡Hola ${nombre}! Te damos la bienvenida a <strong>Casa con Pileta</strong> 🏊 (a 4 cuadras del mar)</p>

    ${seccion(
      "🏠 Sobre la casa",
      listaConIconos([
        "Capacidad: 5/6 personas",
        "3 ambientes, 2 dormitorios, 2 baños",
        "1 cochera",
        "Cocina comedor con microondas",
        "Internet / wifi",
        "Patio y parrilla atrás, jardín adelante",
        "Apta para mascotas",
        "Galería cubierta",
        "Lavadero",
      ]),
    )}

    ${bloqueDatosImportantes({
      direccion: "Calle 46 N° 445 e/7 y 9",
      wifi: "Mega_red_21",
      contrasena: "87008567",
      alarma: "4646",
    })}

    ${seccion(
      "📺 Guía de TV",
      `<p style="margin:0; color:#334155; font-size:14px; line-height:1.7;">
        La TV no es Smart, pero tiene un dispositivo Roku para ver YouTube, Netflix, etc. (si tenés cuenta).
        Seleccioná la entrada HDMI 1 en la TV y usá el control chico del Roku para elegir lo que quieras ver.
        Por el momento no dispone de servicio de video cable.
      </p>`,
    )}

    ${seccion(
      "🚿 Encendido del calefón",
      `<p style="margin:0 0 10px; color:#334155; font-size:14px; line-height:1.7;">
        Para tener agua caliente en el baño interno y la cocina, hay que prender el calefón del lavadero.
      </p>
      <p style="margin:0 0 10px; color:#334155; font-size:14px; line-height:1.7;">
        Primero girar y apretar la perilla al símbolo de la llamita (piloto) y apretar el botón (tipo chispero).
        Si no prende, volver a pulsarlo. Una vez prendido el piloto, seguir girando la perilla hasta la tercera marca:
        entre la segunda y la tercera marca el agua sale perfecta para ducharse. Más que eso, el agua sale muy caliente.
      </p>
      <p style="margin:0; color:#334155; font-size:14px; line-height:1.7;">
        El baño exterior tiene ducha con agua fría.
      </p>`,
    )}

    ${bloqueQueTraer()}
    ${bloqueDeposito()}
  `;

  return envolverEmail("¡Tu estadía ya está confirmada!", "Casa con Pileta", contenido);
};

// ==========================================================
// CASA FAMILIAR (con gran parque)
// ==========================================================
const plantillaFamiliar = (nombre) => {
  const contenido = `
    <p style="color:#0f172a; font-size:15px; margin:0 0 20px;">¡Hola ${nombre}! Te damos la bienvenida a la <strong>Casa Familiar</strong> 🏡 (con gran parque, a 7 cuadras del mar)</p>

    ${seccion(
      "🏠 Sobre la casa",
      listaConIconos([
        "Capacidad: 5/6 personas",
        "3 ambientes, 2 dormitorios, 1 baño",
        "1 cochera",
        "Cocina comedor con microondas",
        "Internet / wifi",
        "Parrilla atrás",
        "Jardín arbolado adelante y atrás",
        "Apta para mascotas",
        "Galería cubierta",
      ]),
    )}

    ${bloqueDatosImportantes({
      direccion: "Calle 13 N° 1836 e/40 y 42",
      wifi: "Megared 1836",
      contrasena: "KUIKMA990",
      alarma: "4042",
    })}

    ${seccion(
      "📺 Guía de TV",
      `<p style="margin:0; color:#334155; font-size:14px; line-height:1.7;">
        Es un Smart TV: podés ver YouTube, Netflix, etc. (si tenés cuenta). Por el momento no dispone de servicio de video cable.
      </p>`,
    )}

    ${seccion(
      "🚿 Encendido del calefón",
      `<p style="margin:0; color:#334155; font-size:14px; line-height:1.7;">
        Las instrucciones están en una etiqueta pegada en el calefón. Se enciende con fósforo o Magic click.
      </p>`,
    )}

    ${bloqueGarrafaFamiliar()}
    ${bloqueQueTraer()}
    ${bloqueDeposito()}
  `;

  return envolverEmail("¡Tu estadía ya está confirmada!", "Casa Familiar", contenido);
};

// ==========================================================
// DEPARTAMENTO EN JUJUY (Perico)
// ==========================================================
const plantillaJujuy = (nombre) => {
  const contenido = `
    <p style="color:#0f172a; font-size:15px; margin:0 0 20px;">¡Hola ${nombre}! Te damos la bienvenida al <strong>Departamento en Jujuy</strong> 🏔️ (Perico, a 14 minutos del aeropuerto)</p>

    ${seccion(
      "🏠 Sobre el departamento",
      listaConIconos([
        "4 ambientes, 3 dormitorios, 1 baño",
        "Alquila por habitación doble y simple",
        "Acceso por escalera",
        "Cocheras: 2 autos",
        "Cocina comedor con microondas",
        "Internet / wifi",
        "Parrilla en terraza semicubierta",
        "Apta para mascotas",
      ]),
    )}

    ${seccion(
      "📍 Datos importantes",
      cajaDestacada(
        "#f0f9ff",
        "#bae6fd",
        `
          <p style="margin:0 0 6px; color:#0f172a; font-size:14px;"><strong>Dirección:</strong> Av. Canada N° 160 e/ Santiago del Estero y Buenos Aires. Barrio San Miguel. Perico</p>
          <p style="margin:0 0 6px; color:#0f172a; font-size:14px;"><strong>Wifi:</strong> Castro-2026 &nbsp;|&nbsp; <strong>Contraseña:</strong> Aventuras18+</p>
          <p style="margin:0; color:#0f172a; font-size:14px;"><strong>Teléfono fijo:</strong> 388 491-8965 (Miguel Castro)</p>
        `,
      ),
    )}

    ${seccion(
      "🌟 Comodidades y equipamiento",
      listaConIconos([
        "Vajilla completa",
        "Heladera",
        "Microondas",
        "Ropa de cama: sábanas y mantas",
        "Toallas",
        "Elementos de aseo y papel higiénico",
      ]),
    )}

    ${seccion(
      "👨‍👩‍👧‍👦 Condiciones especiales",
      listaConIconos([
        "Apto para familias con niños",
        "Juegos de mesa para compartir y divertirse",
      ]),
    )}

    ${seccion(
      "🔐 Privacidad y seguridad",
      listaConIconos([
        "Cerraduras en las puertas de los dormitorios",
        "Cámaras de seguridad en el exterior de la propiedad",
      ]),
    )}
  `;
  return envolverEmail("¡Tu estadía ya está confirmada!", "Departamento en Jujuy", contenido);
};

const plantillasCasa = {
  "casa frente al mar": plantillaFrenteAlMar,
  "casa con pileta": plantillaConPileta,
  "casa familiar": plantillaFamiliar,
  "departamento en jujuy": plantillaJujuy,
};

const armarHtmlBienvenida = (casa, nombre, _fechasArray) => {
  const casaNorm = (casa || "").toLowerCase().trim();
  const plantilla = plantillasCasa[casaNorm];
  if (plantilla) return plantilla(nombre);

  // Fallback por si el nombre de la casa no matchea ninguna plantilla conocida.
  return envolverEmail(
    "¡Tu estadía ya está confirmada!",
    casa,
    `<p style="color:#0f172a; font-size:15px;">¡Hola ${nombre}! Recibimos tu solicitud para <strong>${casa}</strong>. En breve te contactamos con los datos de acceso.</p>`,
  );
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
// Mail "libre" desde el Historial.
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
// Mail de "solicitud recibida" (se manda automático apenas
// se crea la reserva, ANTES de que esté confirmado el pago).
// Redactado para avisar de las 48hs de forma clara pero cordial,
// sin sonar a amenaza.
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

      <div style="background:#fffbeb; border:1px solid #fde68a; border-radius:10px; padding:16px 18px; margin-top:24px;">
        <p style="margin:0 0 8px; color:#7c2d12; font-size:14px;"><strong>⏳ Próximo paso: la seña</strong></p>
        <p style="color:#78716c; font-size:13px; line-height:1.6; margin:0;">
          Para dejar la fecha confirmada, tenés <strong>48 horas</strong> para coordinar el pago de la seña
          con nosotros. Podés escribirnos por WhatsApp cuando quieras para coordinarlo, o directamente
          te vamos a estar contactando también por teléfono para agilizar y no hacerte esperar. Si pasado
          ese tiempo no llegamos a confirmar el pago, la fecha vuelve a quedar disponible para otras
          personas interesadas — así que si ya tenés decidido venir, te recomendamos escribirnos o
          atender el teléfono cuanto antes para no perder el lugar. ¡Cualquier duda, estamos para ayudarte!
        </p>
      </div>

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