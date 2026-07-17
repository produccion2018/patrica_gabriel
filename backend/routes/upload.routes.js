const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload.middleware");
const { subirImagen } = require("../controllers/upload.controller");

router.post("/upload", upload.single("imagen"), subirImagen);

module.exports = router;