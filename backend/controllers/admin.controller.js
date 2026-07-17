const bcrypt = require("bcryptjs");
const db = require("../database/db");

// Login del panel admin.
// Soporta migración automática: si la contraseña en la base todavía
// está en texto plano (instalaciones viejas, ej "123456"), la valida
// comparando directo UNA vez, y si es correcta la re-guarda ya
// hasheada con bcrypt. De ahí en más, esa cuenta queda 100% en bcrypt.
const login = (req, res) => {
  const { usuario, password } = req.body;

  if (!usuario || !password) {
    return res.json({ success: false, message: "Faltan usuario o contraseña" });
  }

  db.get("SELECT * FROM usuarios WHERE usuario = ?", [usuario], async (err, row) => {
    if (err) {
      console.error("❌ Error en login:", err.message);
      return res.status(500).json({ success: false, message: "Error del servidor" });
    }

    if (!row) {
      return res.json({ success: false, message: "Usuario o contraseña incorrectos" });
    }

    const esHashBcrypt = typeof row.password === "string" && row.password.startsWith("$2");

    try {
      let coincide = false;

      if (esHashBcrypt) {
        coincide = await bcrypt.compare(password, row.password);
      } else {
        // Contraseña vieja en texto plano: comparación directa, y si
        // coincide, se re-hashea para dejar la cuenta migrada.
        coincide = password === row.password;
        if (coincide) {
          const nuevoHash = await bcrypt.hash(password, 10);
          db.run("UPDATE usuarios SET password = ? WHERE usuario = ?", [nuevoHash, usuario], (errUpd) => {
            if (errUpd) console.error("❌ Error migrando password a bcrypt:", errUpd.message);
            else console.log(`🔐 Password de "${usuario}" migrada a bcrypt`);
          });
        }
      }

      res.json({ success: coincide });
    } catch (errBcrypt) {
      console.error("❌ Error verificando password:", errBcrypt.message);
      res.status(500).json({ success: false, message: "Error del servidor" });
    }
  });
};

// Cambiar contraseña del admin (ya autenticado en el panel).
// Siempre guarda la nueva contraseña hasheada con bcrypt.
const cambiarPassword = (req, res) => {
  const { passwordActual, passwordNueva } = req.body;

  if (!passwordActual || !passwordNueva) {
    return res.json({ success: false, message: "Faltan datos" });
  }

  db.get("SELECT * FROM usuarios WHERE usuario = ?", ["admin"], async (err, usuario) => {
    if (err) {
      console.error("❌ Error buscando usuario:", err.message);
      return res.status(500).json({ success: false, message: "Error del servidor" });
    }

    if (!usuario) {
      return res.json({ success: false, message: "Usuario no encontrado" });
    }

    const esHashBcrypt = typeof usuario.password === "string" && usuario.password.startsWith("$2");

    try {
      const coincide = esHashBcrypt
        ? await bcrypt.compare(passwordActual, usuario.password)
        : passwordActual === usuario.password;

      if (!coincide) {
        return res.json({ success: false, message: "La contraseña actual no es correcta" });
      }

      const nuevoHash = await bcrypt.hash(passwordNueva, 10);
      db.run("UPDATE usuarios SET password = ? WHERE usuario = ?", [nuevoHash, "admin"], (errUpdate) => {
        if (errUpdate) {
          console.error("❌ Error actualizando password:", errUpdate.message);
          return res.status(500).json({ success: false, message: "No se pudo actualizar la contraseña" });
        }
        res.json({ success: true });
      });
    } catch (errBcrypt) {
      console.error("❌ Error verificando password actual:", errBcrypt.message);
      res.status(500).json({ success: false, message: "Error del servidor" });
    }
  });
};

module.exports = { login, cambiarPassword };