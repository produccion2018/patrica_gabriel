const express = require("express");
const router = express.Router();
const {
  listarComentarios,
  listarComentariosPublicos,
  crearComentario,
  ocultarComentario,
  mostrarComentario,
  eliminarComentario,
} = require("../controllers/comentarios.controller");

router.get("/comentarios", listarComentarios);
router.get("/comentarios-publicos", listarComentariosPublicos);
router.post("/comentarios", crearComentario);
router.put("/comentarios/:id/ocultar", ocultarComentario);
router.put("/comentarios/:id/mostrar", mostrarComentario);
router.delete("/comentarios/:id", eliminarComentario);

module.exports = router;