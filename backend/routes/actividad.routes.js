const express = require("express");
const router = express.Router();
const { verificarToken } = require("../middleware/auth.middleware");
const { listarActividad } = require("../controllers/actividad.controller");

router.get("/", verificarToken, listarActividad);

module.exports = router;