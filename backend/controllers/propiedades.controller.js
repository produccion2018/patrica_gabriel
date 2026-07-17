const db = require("../database/db");

const listarPropiedades = (req, res) => {
  db.all("SELECT * FROM propiedades ORDER BY id ASC", [], (err, rows) => {
    if (err) return res.status(500).json([]);
    res.json(rows);
  });
};

const actualizarPropiedad = (req, res) => {
  const { id } = req.params;
  const { precio, promocion, imagen } = req.body;
  db.run("UPDATE propiedades SET precio=?, promocion=?, imagen=? WHERE id=?", [precio, promocion, imagen, id], (err) => {
    if (err) return res.status(500).json({ success: false });
    res.json({ success: true });
  });
};

module.exports = { listarPropiedades, actualizarPropiedad };