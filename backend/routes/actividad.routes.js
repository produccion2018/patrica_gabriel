const express = require("express");
const router = express.Router();
const { listarActividad } = require("../controllers/actividad.controller");

router.get("/", listarActividad);

module.exports = router;