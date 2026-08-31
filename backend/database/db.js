const { createClient } = require("@libsql/client");

// Nos conectamos a Turso (base de datos en la nube, gratis, permanente)
// en vez de al archivo local reservas.db. Así los datos sobreviven a los
// reinicios/redeploys de Render, sin necesitar el disco pago.
const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// Wrapper: imita la forma en la que ya usábamos sqlite3 (db.run, db.all,
// db.get con callbacks), para NO tener que reescribir todos los
// controllers que ya existen. Por dentro, cada llamado usa Turso.
const db = {
  run(sql, params, callback) {
    if (typeof params === "function") {
      callback = params;
      params = [];
    }
    params = params || [];

    client
      .execute({ sql, args: params })
      .then((result) => {
        const contexto = {
          lastID:
            result.lastInsertRowid !== undefined && result.lastInsertRowid !== null
              ? Number(result.lastInsertRowid)
              : undefined,
          changes: result.rowsAffected,
        };
        if (callback) callback.call(contexto, null);
      })
      .catch((err) => {
        if (callback) callback.call({}, err);
      });
  },

  all(sql, params, callback) {
    if (typeof params === "function") {
      callback = params;
      params = [];
    }
    params = params || [];

    client
      .execute({ sql, args: params })
      .then((result) => {
        const filas = result.rows.map((fila) => ({ ...fila }));
        if (callback) callback(null, filas);
      })
      .catch((err) => {
        if (callback) callback(err, null);
      });
  },

  get(sql, params, callback) {
    if (typeof params === "function") {
      callback = params;
      params = [];
    }
    params = params || [];

    client
      .execute({ sql, args: params })
      .then((result) => {
        const fila = result.rows.length > 0 ? { ...result.rows[0] } : undefined;
        if (callback) callback(null, fila);
      })
      .catch((err) => {
        if (callback) callback(err, null);
      });
  },

  // Con Turso no hace falta "busyTimeout" (eso era específico de SQLite
  // local). Se deja vacío para no romper el código que todavía lo llama.
  configure() {},
};

// Exportamos también el cliente "de verdad" de Turso, por si algún
// controller necesita hacer una TRANSACCIÓN real de varios pasos
// (ver crearReserva en reservas.controller.js) — eso no se puede simular
// bien con el wrapper de arriba, porque cada llamado ahí es independiente.
db._clienteTurso = client;

module.exports = db;