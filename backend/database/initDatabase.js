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

// Tabla "candado": una fila por cada día que una casa tiene ocupado
// (por una reserva pendiente o confirmada). La restricción UNIQUE de
// abajo es la que realmente impide que dos reservas se pisen — es la
// base de datos misma la que rechaza el segundo INSERT si ese día
// para esa casa ya existe, sin importar qué tan rápido o al mismo
// tiempo lleguen los pedidos al servidor. reserva_id sirve para poder
// borrar estas filas cuando la reserva se cancela/archiva/elimina.
db.run(`CREATE TABLE IF NOT EXISTS dias_ocupados (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    casa TEXT NOT NULL,
    fecha TEXT NOT NULL,
    reserva_id INTEGER NOT NULL,
    UNIQUE(casa, fecha)
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
  "INSERT OR IGNORE INTO propiedades (id, nombre, precio, promocion, imagen) VALUES (4, 'Departamento en Jujuy', '', '', '')"
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