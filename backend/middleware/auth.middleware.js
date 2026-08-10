const jwt = require("jsonwebtoken");

// En producción, JWT_SECRET tiene que venir de una variable de entorno
// real (.env) — nunca hardcodeada. El valor de acá abajo es solo un
// respaldo para que no explote si todavía no configuraste el .env,
// pero hay que cambiarlo antes de subir a producción.
const JWT_SECRET = process.env.JWT_SECRET || "cambiar-este-secreto-en-produccion";

// Protege una ruta: exige un token válido en el header
// Authorization: Bearer <token>. Si no viene o es inválido/expiró,
// corta la petición acá mismo con 401, antes de llegar al controller.
function verificarToken(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ success: false, message: "No autorizado" });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.usuario = payload; // disponible en el controller si hace falta
    next();
  } catch (error) {
    return res
      .status(401)
      .json({ success: false, message: "Sesión inválida o expirada" });
  }
}

module.exports = { verificarToken, JWT_SECRET };