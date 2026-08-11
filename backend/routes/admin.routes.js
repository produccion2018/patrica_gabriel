const express = require("express");
const router = express.Router();
const rateLimit = require("express-rate-limit");
const { verificarToken } = require("../middleware/auth.middleware");
const { login, cambiarPassword } = require("../controllers/admin.controller");

// Máximo 5 intentos de login cada 5 minutos por IP. Frena ataques de
// fuerza bruta (probar contraseñas una y otra vez sin parar).
const limitadorLogin = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: "Demasiados intentos. Probá de nuevo en 5 minutos.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post("/login", limitadorLogin, login);
router.put("/password", verificarToken, cambiarPassword);

module.exports = router;