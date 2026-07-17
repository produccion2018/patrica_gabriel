const db = require("../database/db");

const listarComentarios = (req, res) => {
  db.all("SELECT * FROM comentarios_clientes ORDER BY created_at DESC", [], (err, rows) => {
    if (err) return res.status(500).json([]);
    res.json(rows);
  });
};

const listarComentariosPublicos = (req, res) => {
  db.all("SELECT * FROM comentarios_clientes WHERE visible = 1 ORDER BY created_at DESC", [], (err, rows) => {
    if (err) return res.status(500).json([]);
    res.json(rows);
  });
};

const crearComentario = (req, res) => {
  const { nombre, comentario, estrellas } = req.body;
  db.run("INSERT INTO comentarios_clientes (nombre, comentario, estrellas) VALUES (?,?,?)", [nombre, comentario, estrellas || 5], function (err) {
    if (err) return res.status(500).json({ success: false });
    res.json({ success: true, id: this.lastID });
  });
};

const ocultarComentario = (req, res) => {
  db.run("UPDATE comentarios_clientes SET visible = 0 WHERE id = ?", [req.params.id], (err) => {
    if (err) return res.status(500).json({ success: false });
    res.json({ success: true });
  });
};

const mostrarComentario = (req, res) => {
  db.run("UPDATE comentarios_clientes SET visible = 1 WHERE id = ?", [req.params.id], (err) => {
    if (err) return res.status(500).json({ success: false });
    res.json({ success: true });
  });
};

const eliminarComentario = (req, res) => {
  db.run("DELETE FROM comentarios_clientes WHERE id = ?", [req.params.id], (err) => {
    if (err) return res.status(500).json({ success: false });
    res.json({ success: true });
  });
};

module.exports = { listarComentarios, listarComentariosPublicos, crearComentario, ocultarComentario, mostrarComentario, eliminarComentario };