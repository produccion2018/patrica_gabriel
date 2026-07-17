const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./database/reservas.db", (err) => {
  if (err) {
    console.error("Error al conectar la base de datos:", err.message);
  } else {
    console.log("Base de datos SQLite conectada");
  }
});

module.exports = db;