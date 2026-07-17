const express = require("express");
const router = express.Router();
const { listarPropiedades, actualizarPropiedad } = require("../controllers/propiedades.controller");

router.get("/propiedades", listarPropiedades);
router.put("/propiedades/:id", actualizarPropiedad);

module.exports = router;