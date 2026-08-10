const express = require("express");
const router = express.Router();
const { verificarToken } = require("../middleware/auth.middleware");
const {
  crearReserva,
  listarReservas,
  listarDisponibilidad,
  actualizarEstado,
  eliminarReserva,
  archivarReserva,
} = require("../controllers/reservas.controller");

// Público: el calendario del formulario de reserva necesita saber
// qué días están ocupados, sin loguearse. Solo trae casa/fechas/estado.
router.get("/disponibilidad", listarDisponibilidad);

// Protegido: listado completo, con datos personales de los huéspedes.
router.get("/", verificarToken, listarReservas);

// Público: cualquiera tiene que poder crear una reserva desde el formulario.
router.post("/", crearReserva);

// Protegidas: acciones de administración.
router.put("/:id/estado", verificarToken, actualizarEstado);
router.delete("/:id", verificarToken, eliminarReserva);
router.post("/:id/archivar", verificarToken, archivarReserva);

module.exports = router;