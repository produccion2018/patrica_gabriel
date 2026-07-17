const db = require("../database/db");
const {
  enviarCorreo,
  armarHtmlBienvenida,
  armarHtmlSolicitudRecibida,
} = require("../services/email.service");

// Al crear la reserva todavía NO se confirmó nada (queda "pendiente"),
// así que se manda el mail de "recibimos tu solicitud, en breve nos
// comunicamos con vos" — NO el mail de bienvenida con wifi/alarma.
const crearReserva = (req, res) => {
  const { casa, nombre, apellido, email, telefono, pais, direccion, huespedes, mascota, cantidadMascotas, comentarios, mensaje, fechas } = req.body;

  db.run(
    `INSERT INTO reservas (casa, nombre, apellido, email, telefono, pais, direccion, huespedes, mascota, cantidad_mascotas, comentarios, mensaje, fechas) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [casa, nombre, apellido, email, telefono, pais, direccion, huespedes, mascota, cantidadMascotas, comentarios, mensaje, JSON.stringify(fechas || [])],
    async function (err) {
      if (err) {
        console.error("❌ Error:", err);
        return res.status(500).json({ success: false });
      }

      const fechasArray = Array.isArray(fechas) ? fechas : [];

      if (email) {
        const html = armarHtmlSolicitudRecibida({
          nombre: `${nombre} ${apellido}`,
          casa,
          telefono,
          huespedes,
          fechaEntrada: fechasArray[0] || "-",
          fechaSalida: fechasArray[fechasArray.length - 1] || "-",
        });
        try {
          await enviarCorreo(email, `Recibimos tu solicitud de reserva | ${casa}`, html);
        } catch (errMail) {
          console.error("❌ Error enviando mail de solicitud recibida:", errMail.message);
        }
      }

      res.json({ success: true, id: this.lastID });
    }
  );
};

const listarReservas = (req, res) => {
  db.all("SELECT * FROM reservas ORDER BY created_at DESC", [], (err, rows) => res.json(rows));
};

// ⚠️ IMPORTANTE: asumo que el string que usa tu AdminCalendar.jsx para
// marcar una reserva como confirmada es exactamente "confirmada" (minúscula).
// Si en tu frontend usás otro texto (ej "Confirmada", "aprobada", etc.),
// avisame y ajusto la comparación de abajo (ESTADO_CONFIRMADA).
const ESTADO_CONFIRMADA = "confirmada";

const actualizarEstado = (req, res) => {
  const { estado } = req.body;
  const { id } = req.params;

  // Primero busco la reserva completa (para tener nombre/casa/fechas/email
  // a mano si hay que mandar el mail de bienvenida) y de paso guardo cuál
  // era el estado anterior, para no reenviar el mail si ya estaba confirmada.
  db.get("SELECT * FROM reservas WHERE id = ?", [id], (err, resv) => {
    if (err) {
      console.error("❌ Error buscando reserva:", err.message);
      return res.status(500).json({ success: false, error: err.message });
    }
    if (!resv) {
      return res.status(404).json({ success: false, error: "Reserva no encontrada" });
    }

    const estadoAnterior = resv.estado;

    db.run("UPDATE reservas SET estado = ? WHERE id = ?", [estado, id], async (errUpdate) => {
      if (errUpdate) {
        console.error("❌ Error actualizando estado:", errUpdate.message);
        return res.status(500).json({ success: false, error: errUpdate.message });
      }

      // Solo mando el mail de bienvenida si JUSTO AHORA pasó a confirmada
      // (si ya estaba confirmada antes, no lo vuelvo a mandar).
      const pasaAConfirmadaAhora =
        estado === ESTADO_CONFIRMADA && estadoAnterior !== ESTADO_CONFIRMADA;

      if (pasaAConfirmadaAhora && resv.email) {
        let fechasArray = [];
        try {
          fechasArray = JSON.parse(resv.fechas || "[]");
        } catch {
          fechasArray = [];
        }
        try {
          const html = armarHtmlBienvenida(resv.casa, resv.nombre, fechasArray);
          await enviarCorreo(resv.email, `¡Reserva confirmada! | ${resv.casa}`, html);
          console.log(`📧 Mail de bienvenida enviado a ${resv.email} (reserva id=${id} confirmada)`);
        } catch (errMail) {
          console.error("❌ Error enviando mail de bienvenida:", errMail.message);
        }
      }

      res.json({ success: true });
    });
  });
};

const eliminarReserva = (req, res) => {
  db.run("DELETE FROM reservas WHERE id = ?", [req.params.id], () => res.json({ success: true }));
};

// Archiva una reserva: la copia a historial_reservas y recién si eso
// sale bien, la borra de "reservas". Si el INSERT falla, NO se toca
// el original, para no perder la reserva.
const archivarReserva = (req, res) => {
  db.get("SELECT * FROM reservas WHERE id = ?", [req.params.id], (err, resv) => {
    if (err) {
      console.error("❌ Error buscando reserva a archivar:", err.message);
      return res.status(500).json({ success: false, error: err.message });
    }
    if (!resv) return res.status(404).json({ success: false, error: "Reserva no encontrada" });

    db.run(
      `INSERT INTO historial_reservas (id_original, casa, nombre, apellido, email, telefono, pais, direccion, huespedes, mascota, cantidad_mascotas, comentarios, mensaje, fechas, estado) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [resv.id, resv.casa, resv.nombre, resv.apellido, resv.email, resv.telefono, resv.pais, resv.direccion, resv.huespedes, resv.mascota, resv.cantidad_mascotas, resv.comentarios, resv.mensaje, resv.fechas, resv.estado],
      async function (errInsert) {
        if (errInsert) {
          console.error("❌ Error archivando reserva (no se borró el original):", errInsert.message);
          return res.status(500).json({ success: false, error: errInsert.message });
        }

        console.log(`📦 Reserva id=${resv.id} archivada en historial_reservas → id nuevo=${this.lastID}`);

        // Nota: acá ya NO se manda mail de despedida automático.
        // Ese envío ahora es manual, desde el botón "Enviar mensaje"
        // en AdminHistorial (Patricia/Gabriel escriben el texto).

        db.run("DELETE FROM reservas WHERE id = ?", [req.params.id], (errDelete) => {
          if (errDelete) {
            console.error("❌ Error borrando reserva original tras archivar:", errDelete.message);
            return res.status(500).json({ success: false, error: errDelete.message });
          }
          res.json({ success: true });
        });
      }
    );
  });
};

module.exports = { crearReserva, listarReservas, actualizarEstado, eliminarReserva, archivarReserva };