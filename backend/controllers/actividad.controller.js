const db = require("../database/db");

// Helper reutilizable: se llama desde otros controllers para registrar un evento
const registrarActividad = (icono, icon_class, titulo, casa) => {
  db.run(
    "INSERT INTO actividad (icono, icon_class, titulo, casa) VALUES (?,?,?,?)",
    [icono, icon_class, titulo, casa],
    (err) => {
      if (err) console.error("❌ Error registrando actividad:", err.message);
    }
  );
};

// GET /api/actividad -> últimas 20 actividades, más nueva primero
const listarActividad = (req, res) => {
  db.all("SELECT * FROM actividad ORDER BY created_at DESC LIMIT 20", [], (err, rows) => {
    if (err) return res.status(500).json([]);
    res.json(rows);
  });
};

module.exports = { registrarActividad, listarActividad };