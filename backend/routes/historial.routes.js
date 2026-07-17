const express = require("express");
const router = express.Router();
const {
  listarHistorial,
  eliminarHistorial,
  reporteMensual,
  enviarEmailHistorial,
} = require("../controllers/historial.controller");

// IMPORTANTE: "/reporte" tiene que ir ANTES de "/:id",
// si no Express interpreta "reporte" como si fuera un id.
router.get("/", listarHistorial);
router.get("/reporte", reporteMensual);
router.delete("/:id", eliminarHistorial);
router.post("/:id/email", enviarEmailHistorial);

module.exports = router;