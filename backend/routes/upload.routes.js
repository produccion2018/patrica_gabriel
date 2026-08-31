const express = require("express");
const router = express.Router();
const { verificarToken } = require("../middleware/auth.middleware");
const upload = require("../middleware/upload.middleware");
const { subirImagen } = require("../controllers/upload.controller");

router.post("/upload", verificarToken, (req, res, next) => {
  upload.single("imagen")(req, res, (err) => {
    if (err) {
      console.error("Error al subir imagen - mensaje:", err.message);
      console.error("Error al subir imagen - nombre:", err.name);
      console.error("Error al subir imagen - completo:", err);
      return res.status(400).json({
        success: false,
        error: err.message || err.toString() || "Error al subir la imagen",
      });
    }
    next();
  });
}, subirImagen);

module.exports = router;