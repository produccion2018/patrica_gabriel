const express = require("express");
const router = express.Router();
const { crearReserva, listarReservas, actualizarEstado, eliminarReserva, archivarReserva } = require("../controllers/reservas.controller");

router.get("/", listarReservas);
router.post("/", crearReserva);
router.put("/:id/estado", actualizarEstado);
router.delete("/:id", eliminarReserva);
router.post("/:id/archivar", archivarReserva);

module.exports = router;