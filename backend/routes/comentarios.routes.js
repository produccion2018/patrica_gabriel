const express = require("express");
const router = express.Router();
const { verificarToken } = require("../middleware/auth.middleware");
const {
  listarComentarios,
  listarComentariosPublicos,
  crearComentario,
  ocultarComentario,
  mostrarComentario,
  eliminarComentario,
} = require("../controllers/comentarios.controller");

// Protegido: el admin ve TODOS los comentarios (incluso los ocultos).
router.get("/comentarios", verificarToken, listarComentarios);

// Público: la web solo muestra los visibles.
router.get("/comentarios-publicos", listarComentariosPublicos);

// Público: cualquier huésped puede dejar su opinión.
router.post("/comentarios", crearComentario);

// Protegidas: moderación, solo el admin.
router.put("/comentarios/:id/ocultar", verificarToken, ocultarComentario);
router.put("/comentarios/:id/mostrar", verificarToken, mostrarComentario);
router.delete("/comentarios/:id", verificarToken, eliminarComentario);

module.exports = router;