const bcrypt = require("bcryptjs");
const db = require("./db");

// Ejecuta una consulta y ESPERA a que termine antes de devolver el control.
// Es clave que sea así ahora: la base vive en Turso (en internet), así que
// cada consulta viaja por la red y tarda un poquito. Si no esperáramos a
// que cada una termine antes de lanzar la siguiente, podrían llegar
// desordenadas (por ejemplo, intentar usar una tabla que todavía no
// terminó de crearse).
const ejecutar = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });

const consultar = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });

const inicializarBaseDeDatos = async () => {
  await ejecutar(
    "CREATE TABLE IF NOT EXISTS usuarios (id INTEGER PRIMARY KEY AUTOINCREMENT, usuario TEXT UNIQUE, password TEXT)"
  );

  await ejecutar("INSERT OR IGNORE INTO usuarios (usuario,password) VALUES (?,?)", [
    "admin",
    bcrypt.hashSync("123456", 10),
  ]);

  await ejecutar(`CREATE TABLE IF NOT EXISTS reservas (
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

  // Compatibilidad con bases viejas sin la columna "mensaje".
  // OJO: esto va DESPUÉS de crear la tabla (antes estaba al revés, y por
  // eso fallaba en una base nueva: intentaba revisar una tabla que
  // todavía no existía).
  try {
    const columnas = await consultar("PRAGMA table_info(reservas)");
    const yaExiste = columnas.some((col) => col.name === "mensaje");
    if (!yaExiste) {
      await ejecutar("ALTER TABLE reservas ADD COLUMN mensaje TEXT");
      console.log("✅ Columna 'mensaje' agregada a reservas");
    }
  } catch (err) {
    console.log("Error revisando columnas:", err.message);
  }

  await ejecutar(`CREATE TABLE IF NOT EXISTS historial_reservas (
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

  await ejecutar(
    "CREATE TABLE IF NOT EXISTS propiedades (id INTEGER PRIMARY KEY AUTOINCREMENT, nombre TEXT, precio TEXT, promocion TEXT, imagen TEXT)"
  );

  await ejecutar(
    "INSERT OR IGNORE INTO propiedades (id, nombre, precio, promocion, imagen) VALUES (4, 'Departamento en Jujuy', '', '', '')"
  );

  await ejecutar(
    "CREATE TABLE IF NOT EXISTS comentarios_clientes (id INTEGER PRIMARY KEY AUTOINCREMENT, nombre TEXT NOT NULL, comentario TEXT NOT NULL, estrellas INTEGER DEFAULT 5, visible INTEGER DEFAULT 1, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)"
  );

  await ejecutar(`CREATE TABLE IF NOT EXISTS actividad (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      icono TEXT,
      icon_class TEXT,
      titulo TEXT,
      casa TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  console.log("✅ Base de datos inicializada (tablas verificadas/creadas)");
};

module.exports = inicializarBaseDeDatos;