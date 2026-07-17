// Este archivo NO abre su propia conexión a la base — reutiliza la
// única conexión que ya crea db.js. Antes, initDatabase.js y db.js
// abrían cada uno su propia conexión al mismo archivo .db, lo cual
// era redundante (y podía duplicar el log "Base de datos SQLite
// conectada" en consola).
const bcrypt = require("bcryptjs");
const db = require("./db");

db.all("PRAGMA table_info(reservas)", [], (err, columns) => {
  if (err) {
    console.log("Error revisando columnas:", err.message);
    return;
  }
  const yaExiste = columns.some((col) => col.name === "mensaje");
  if (!yaExiste) {
    db.run("ALTER TABLE reservas ADD COLUMN mensaje TEXT", (err2) => {
      if (!err2) console.log("✅ Columna 'mensaje' agregada a reservas");
    });
  }
});

db.run(
  "CREATE TABLE IF NOT EXISTS usuarios (id INTEGER PRIMARY KEY AUTOINCREMENT, usuario TEXT UNIQUE, password TEXT)"
);

// Instalación nueva desde cero: el admin se crea directo con la
// contraseña ya hasheada en bcrypt (no en texto plano). Si la fila
// "admin" ya existe de antes (instalación vieja, con "123456" en
// texto plano), este INSERT OR IGNORE no la toca — esa cuenta vieja
// se migra sola a bcrypt la primera vez que hagan login correctamente
// (ver admin.controller.js).
db.run("INSERT OR IGNORE INTO usuarios (usuario,password) VALUES (?,?)", [
  "admin",
  bcrypt.hashSync("123456", 10),
]);

db.run(`CREATE TABLE IF NOT EXISTS reservas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    casa TEXT,
    nombre TEXT,
    apellido TEXT,
    email TEXT,
    telefono TEXT,
    pais TEXT,
    direccion TEXT,
    huespedes INTEGER,
    mascota TEXT,
    cantidad_mascotas INTEGER,
    comentarios TEXT,
    mensaje TEXT,
    fechas TEXT,
    estado TEXT DEFAULT 'pendiente',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`);

db.run(`CREATE TABLE IF NOT EXISTS historial_reservas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    id_original INTEGER,
    casa TEXT,
    nombre TEXT,
    apellido TEXT,
    email TEXT,
    telefono TEXT,
    pais TEXT,
    direccion TEXT,
    huespedes INTEGER,
    mascota TEXT,
    cantidad_mascotas INTEGER,
    comentarios TEXT,
    mensaje TEXT,
    fechas TEXT,
    estado TEXT,
    fecha_archivado DATETIME DEFAULT CURRENT_TIMESTAMP
)`);

db.run(
  "CREATE TABLE IF NOT EXISTS propiedades (id INTEGER PRIMARY KEY AUTOINCREMENT, nombre TEXT, precio TEXT, promocion TEXT, imagen TEXT)"
);
db.run(
  "CREATE TABLE IF NOT EXISTS comentarios_clientes (id INTEGER PRIMARY KEY AUTOINCREMENT, nombre TEXT NOT NULL, comentario TEXT NOT NULL, estrellas INTEGER DEFAULT 5, visible INTEGER DEFAULT 1, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)"
);

db.run(`CREATE TABLE IF NOT EXISTS actividad (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    icono TEXT,
    icon_class TEXT,
    titulo TEXT,
    casa TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`);

module.exports = db;