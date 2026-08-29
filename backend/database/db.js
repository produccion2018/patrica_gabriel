const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./database/reservas.db", (err) => {
  if (err) {
    console.error("Error al conectar la base de datos:", err.message);
  } else {
    console.log("Base de datos SQLite conectada");
  }
});

// Si dos pedidos chocan (ej: dos reservas para la misma casa casi al mismo
// tiempo), en vez de fallar al toque con "database is locked", la base
// espera hasta 5 segundos a que se libere el turno anterior.
db.configure("busyTimeout", 5000);

module.exports = db;