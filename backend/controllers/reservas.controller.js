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

  const fechasNuevas = Array.isArray(fechas) ? fechas : [];

  if (fechasNuevas.length === 0) {
    return res.status(400).json({ success: false, message: "Faltan las fechas de la reserva." });
  }

  db.run("BEGIN IMMEDIATE TRANSACTION", (errBegin) => {
    if (errBegin) {
      console.error("❌ Error iniciando transacción:", errBegin.message);
      return res.status(500).json({ success: false });
    }

    db.run(
      `INSERT INTO reservas (casa, nombre, apellido, email, telefono, pais, direccion, huespedes, mascota, cantidad_mascotas, comentarios, mensaje, fechas) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [casa, nombre, apellido, email, telefono, pais, direccion, huespedes, mascota, cantidadMascotas, comentarios, mensaje, JSON.stringify(fechasNuevas)],
      function (errInsert) {
        if (errInsert) {
          console.error("❌ Error insertando reserva:", errInsert.message);
          return db.run("ROLLBACK", () =>
            res.status(500).json({ success: false }),
          );
        }

        const reservaId = this.lastID;

        // Acá está el candado real: intentamos ocupar cada día. Si
        // alguno ya está tomado (UNIQUE constraint), la base tira
        // error automáticamente y cancelamos todo con ROLLBACK — la
        // reserva recién insertada tampoco queda guardada.
        let huboError = false;
        let pendientes = fechasNuevas.length;

        fechasNuevas.forEach((fecha) => {
          if (huboError) return;
          db.run(
            "INSERT INTO dias_ocupados (casa, fecha, reserva_id) VALUES (?,?,?)",
            [casa, fecha, reservaId],
            (errDia) => {
              if (huboError) return;

              if (errDia) {
                huboError = true;
                return db.run("ROLLBACK", () => {
                  res.status(409).json({
                    success: false,
                    message: "Uno o más días seleccionados ya no están disponibles para esta propiedad. Por favor, elegí otras fechas.",
                  });
                });
              }

              pendientes -= 1;
              if (pendientes === 0) {
                db.run("COMMIT", async (errCommit) => {
                  if (errCommit) {
                    console.error("❌ Error confirmando transacción:", errCommit.message);
                    return res.status(500).json({ success: false });
                  }

                  if (email) {
                    const html = armarHtmlSolicitudRecibida({
                      nombre: `${nombre} ${apellido}`,
                      casa,
                      telefono,
                      huespedes,
                      fechaEntrada: fechasNuevas[0] || "-",
                      fechaSalida: fechasNuevas[fechasNuevas.length - 1] || "-",
                    });
                    try {
                      await enviarCorreo(email, `Recibimos tu solicitud de reserva | ${casa}`, html);
                    } catch (errMail) {
                      console.error("❌ Error enviando mail de solicitud recibida:", errMail.message);
                    }
                  }

                  res.json({ success: true, id: reservaId });
                });
              }
            },
          );
        });
      },
    );
  });
};

// Listado COMPLETO — con datos personales de cada huésped (nombre,
// email, teléfono, dirección). Solo para el panel admin, protegido
// con token (ver reservas.routes.js).
const listarReservas = (req, res) => {
  db.all("SELECT * FROM reservas ORDER BY created_at DESC", [], (err, rows) => res.json(rows));
};

// Endpoint PÚBLICO, sin token — usado por el calendario del formulario
// de reserva (BookingCalendar.jsx) para saber qué días ya están
// ocupados. A propósito devuelve solo casa + fechas + estado, NUNCA
// nombre/email/teléfono/dirección de los huéspedes — eso solo lo ve
// el admin logueado a través de /api/reservas.
const listarDisponibilidad = (req, res) => {
  db.all(
    "SELECT casa, fechas, estado FROM reservas ORDER BY created_at DESC",
    [],
    (err, rows) => {
      if (err) return res.status(500).json([]);
      res.json(rows);
    }
  );
};

// ⚠️ IMPORTANTE: asumo que el string que usa tu AdminCalendar.jsx para
// marcar una reserva como confirmada es exactamente "confirmada" (minúscula).
// Si en tu frontend usás otro texto (ej "Confirmada", "aprobada", etc.),
// avisame y ajusto la comparación de abajo (ESTADO_CONFIRMADA).
const ESTADO_CONFIRMADA = "confirmada";

const actualizarEstado = (req, res) => {
  const { estado } = req.body;
  const { id } = req.params;

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
  const { id } = req.params;
  // Liberamos primero los días ocupados por esta reserva, y recién
  // después borramos la reserva en sí — así no quedan días "fantasma"
  // bloqueados para siempre.
  db.run("DELETE FROM dias_ocupados WHERE reserva_id = ?", [id], (errDias) => {
    if (errDias) {
      console.error("❌ Error liberando días ocupados:", errDias.message);
      return res.status(500).json({ success: false });
    }
    db.run("DELETE FROM reservas WHERE id = ?", [id], () => res.json({ success: true }));
  });
};

// Archiva una reserva: la copia a historial_reservas y recién si eso
// sale bien, la borra de "reservas". Si el INSERT falla, NO se toca
// el original, para no perder la reserva. También libera sus días
// ocupados, porque una reserva archivada (finalizada) ya no debe
// bloquear el calendario.
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

        db.run("DELETE FROM dias_ocupados WHERE reserva_id = ?", [resv.id], (errDias) => {
          if (errDias) {
            console.error("❌ Error liberando días ocupados al archivar:", errDias.message);
          }

          db.run("DELETE FROM reservas WHERE id = ?", [req.params.id], (errDelete) => {
            if (errDelete) {
              console.error("❌ Error borrando reserva original tras archivar:", errDelete.message);
              return res.status(500).json({ success: false, error: errDelete.message });
            }
            res.json({ success: true });
          });
        });
      }
    );
  });
};

module.exports = {
  crearReserva,
  listarReservas,
  listarDisponibilidad,
  actualizarEstado,
  eliminarReserva,
  archivarReserva,
};