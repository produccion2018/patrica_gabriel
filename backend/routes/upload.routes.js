const express = require("express");
const router = express.Router();
const { verificarToken } = require("../middleware/auth.middleware");
const upload = require("../middleware/upload.middleware");
const { subirImagen } = require("../controllers/upload.controller");

router.post("/upload", verificarToken, upload.single("imagen"), subirImagen);

module.exports = router;