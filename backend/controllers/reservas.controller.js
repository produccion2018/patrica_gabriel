const db = require("../database/db");
const {
  enviarCorreo,
  armarHtmlBienvenida,
  armarHtmlSolicitudRecibida,
} = require("../services/email.service");
const { expirarReservasVencidas } = require("../services/expiracion.service");

// Estados que "ocupan" la casa y bloquean nuevas reservas en esas fechas.
// Si tenés otros nombres de estado (ej: "cancelada", "expirada", "rechazada"),
// esos NO van en esta lista porque no deben bloquear.
const ESTADOS_QUE_BLOQUEAN = ["pendiente", "confirmada"];

const crearReserva = (req, res) => {
  // Aprovechamos este momento (alguien está reservando) para liberar
  // de paso cualquier reserva vieja que ya venció (48hs sin pago).
  expirarReservasVencidas();

  const { casa, nombre, apellido, email, telefono, pais, direccion, huespedes, mascota, cantidadMascotas, comentarios, mensaje, fechas } = req.body;

  const fechasNuevas = Array.isArray(fechas) ? fechas : [];

  if (!casa || fechasNuevas.length === 0) {
    return res.status(400).json({ success: false, error: "Faltan datos: casa o fechas." });
  }

  // Usamos una transacción con BEGIN IMMEDIATE: esto "reserva" el permiso
  // de escritura en la base ANTES de chequear nada. Si llegan dos pedidos
  // casi al mismo tiempo para la misma casa, el segundo queda esperando
  // a que el primero termine su chequeo + guardado por completo, en vez
  // de chequear en paralelo (que era lo que permitía los duplicados).
  db.run("BEGIN IMMEDIATE TRANSACTION", (errBegin) => {
    if (errBegin) {
      console.error("❌ Error iniciando transacción:", errBegin.message);
      return res.status(500).json({
        success: false,
        error: "El servidor está ocupado procesando otra reserva, probá de nuevo en unos segundos.",
      });
    }

    // 1) Traemos todas las reservas de esa misma casa que estén en un estado que bloquea.
    const placeholders = ESTADOS_QUE_BLOQUEAN.map(() => "?").join(",");
    db.all(
      `SELECT id, fechas, estado FROM reservas WHERE casa = ? AND estado IN (${placeholders})`,
      [casa, ...ESTADOS_QUE_BLOQUEAN],
      (errSelect, rows) => {
        if (errSelect) {
          console.error("❌ Error chequeando disponibilidad:", errSelect.message);
          return db.run("ROLLBACK", () =>
            res.status(500).json({ success: false, error: errSelect.message })
          );
        }

        // 2) Revisamos si alguna fecha nueva ya está ocupada en alguna de esas reservas.
        const hayCruce = rows.some((r) => {
          let fechasExistentes = [];
          try {
            fechasExistentes = JSON.parse(r.fechas || "[]");
          } catch {
            fechasExistentes = [];
          }
          return fechasExistentes.some((f) => fechasNuevas.includes(f));
        });

        if (hayCruce) {
          return db.run("ROLLBACK", () =>
            res.status(409).json({
              success: false,
              error: "Esa casa ya tiene una reserva pendiente o confirmada en alguna de esas fechas.",
            })
          );
        }

        // 3) No hay cruce, insertamos la reserva.
        db.run(
          `INSERT INTO reservas (casa, nombre, apellido, email, telefono, pais, direccion, huespedes, mascota, cantidad_mascotas, comentarios, mensaje, fechas) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
          [casa, nombre, apellido, email, telefono, pais, direccion, huespedes, mascota, cantidadMascotas, comentarios, mensaje, JSON.stringify(fechasNuevas)],
          function (errInsert) {
            if (errInsert) {
              console.error("❌ Error:", errInsert.message);
              return db.run("ROLLBACK", () => res.status(500).json({ success: false }));
            }

            const nuevoId = this.lastID;

            // 4) Recién acá liberamos el "candado" de la transacción.
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

              res.json({ success: true, id: nuevoId });
            });
          }
        );
      }
    );
  });
};

const listarReservas = (req, res) => {
  db.all("SELECT * FROM reservas ORDER BY created_at DESC", [], (err, rows) => res.json(rows));
};

const listarDisponibilidad = (req, res) => {
  // Cada vez que alguien mira el calendario, de paso liberamos
  // las reservas vencidas (más de 48hs sin pago).
  expirarReservasVencidas();

  db.all(
    "SELECT casa, fechas, estado FROM reservas ORDER BY created_at DESC",
    [],
    (err, rows) => {
      if (err) return res.status(500).json([]);
      res.json(rows);
    }
  );
};

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
  db.run("DELETE FROM reservas WHERE id = ?", [req.params.id], () => res.json({ success: true }));
};

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

module.exports = {
  crearReserva,
  listarReservas,
  listarDisponibilidad,
  actualizarEstado,
  eliminarReserva,
  archivarReserva,
};