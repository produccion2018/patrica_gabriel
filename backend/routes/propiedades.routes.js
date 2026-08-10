const express = require("express");
const router = express.Router();
const { verificarToken } = require("../middleware/auth.middleware");
const { listarPropiedades, actualizarPropiedad } = require("../controllers/propiedades.controller");

// Público: la página pública necesita ver las propiedades.
router.get("/propiedades", listarPropiedades);

// Protegido: solo el admin puede cambiar precio/imagen.
router.put("/propiedades/:id", verificarToken, actualizarPropiedad);

module.exports = router;