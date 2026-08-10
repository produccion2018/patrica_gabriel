const express = require("express");
const router = express.Router();
const { verificarToken } = require("../middleware/auth.middleware");
const {
  listarHistorial,
  eliminarHistorial,
  reporteMensual,
  enviarEmailHistorial,
} = require("../controllers/historial.controller");

// Todo protegido: el historial son datos de huéspedes ya pasados,
// solo debe verlo el admin logueado.
// IMPORTANTE: "/reporte" tiene que ir ANTES de "/:id",
// si no Express interpreta "reporte" como si fuera un id.
router.get("/", verificarToken, listarHistorial);
router.get("/reporte", verificarToken, reporteMensual);
router.delete("/:id", verificarToken, eliminarHistorial);
router.post("/:id/email", verificarToken, enviarEmailHistorial);

module.exports = router;