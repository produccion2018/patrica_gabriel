const db = require("../database/db");

const HORAS_EXPIRACION = 48;
const INTERVALO_CHEQUEO_MS = 15 * 60 * 1000; // revisa cada 15 minutos

// Busca reservas 'pendiente' con más de 48hs desde que se crearon,
// las archiva en historial_reservas como 'expirada' y las borra de reservas
// (con eso la casa queda libre otra vez para esas fechas).
function expirarReservasVencidas() {
  db.all(
    `SELECT * FROM reservas WHERE estado = 'pendiente' AND created_at <= datetime('now', '-${HORAS_EXPIRACION} hours')`,
    [],
    (err, rows) => {
      if (err) {
        console.error("❌ Error buscando reservas vencidas:", err.message);
        return;
      }

      if (rows.length === 0) return;

      rows.forEach((resv) => {
        db.run(
          `INSERT INTO historial_reservas (id_original, casa, nombre, apellido, email, telefono, pais, direccion, huespedes, mascota, cantidad_mascotas, comentarios, mensaje, fechas, estado) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
          [
            resv.id,
            resv.casa,
            resv.nombre,
            resv.apellido,
            resv.email,
            resv.telefono,
            resv.pais,
            resv.direccion,
            resv.huespedes,
            resv.mascota,
            resv.cantidad_mascotas,
            resv.comentarios,
            resv.mensaje,
            resv.fechas,
            "expirada",
          ],
          function (errInsert) {
            if (errInsert) {
              console.error(`❌ Error archivando reserva vencida id=${resv.id}:`, errInsert.message);
              return;
            }

            db.run("DELETE FROM reservas WHERE id = ?", [resv.id], (errDelete) => {
              if (errDelete) {
                console.error(`❌ Error borrando reserva vencida id=${resv.id}:`, errDelete.message);
                return;
              }
              console.log(
                `⏰ Reserva id=${resv.id} (${resv.casa}) expiró tras ${HORAS_EXPIRACION}hs sin pago. Se liberó la casa y se archivó.`
              );
            });
          }
        );
      });
    }
  );
}

function iniciarCronExpiracion() {
  console.log(`⏰ Cron de expiración de reservas iniciado (chequea cada 15 min, límite ${HORAS_EXPIRACION}hs).`);
  // Corre una vez apenas arranca el server...
  expirarReservasVencidas();
  // ...y después se repite solo.
  setInterval(expirarReservasVencidas, INTERVALO_CHEQUEO_MS);
}

module.exports = { iniciarCronExpiracion, expirarReservasVencidas };