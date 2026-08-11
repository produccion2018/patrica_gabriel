const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../database/db");
const { JWT_SECRET } = require("../middleware/auth.middleware");

// Misma regla que en el frontend (ChangePassword.jsx), pero acá se
// exige de verdad: si alguien llama a esta ruta directo (sin pasar
// por el formulario), igual se la rechaza si es débil.
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

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

      if (!coincide) {
        return res.json({ success: false, message: "Usuario o contraseña incorrectos" });
      }

      // Login correcto: se emite un token que expira a las 8hs, para
      // que la sesión no quede abierta para siempre en el navegador.
      const token = jwt.sign({ usuario }, JWT_SECRET, { expiresIn: "8h" });

      res.json({ success: true, token });
    } catch (errBcrypt) {
      console.error("❌ Error verificando password:", errBcrypt.message);
      res.status(500).json({ success: false, message: "Error del servidor" });
    }
  });
};

// Cambiar contraseña del admin (ya autenticado en el panel — la ruta
// que llama a esto ahora exige token, ver admin.routes.js).
// Siempre guarda la nueva contraseña hasheada con bcrypt.
const cambiarPassword = (req, res) => {
  const { passwordActual, passwordNueva } = req.body;

  if (!passwordActual || !passwordNueva) {
    return res.json({ success: false, message: "Faltan datos" });
  }

  if (!PASSWORD_REGEX.test(passwordNueva)) {
    return res.json({
      success: false,
      message:
        "La nueva contraseña debe tener al menos 8 caracteres, con una mayúscula, una minúscula y un número.",
    });
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