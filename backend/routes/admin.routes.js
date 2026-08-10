const express = require("express");
const router = express.Router();
const { verificarToken } = require("../middleware/auth.middleware");
const { login, cambiarPassword } = require("../controllers/admin.controller");

router.post("/login", login);
router.put("/password", verificarToken, cambiarPassword);

module.exports = router;