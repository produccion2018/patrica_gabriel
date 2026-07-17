const express = require("express");
const router = express.Router();
const { login, cambiarPassword } = require("../controllers/admin.controller");

router.post("/login", login);
router.put("/password", cambiarPassword);

module.exports = router;