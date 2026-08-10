const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname)),
});

// Solo se permite subir imágenes — antes no había ningún filtro,
// así que se podía subir cualquier tipo de archivo al servidor.
const TIPOS_PERMITIDOS = ["image/jpeg", "image/png", "image/webp", "image/gif"];

function filtroArchivo(req, file, cb) {
  if (TIPOS_PERMITIDOS.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Solo se permiten imágenes (jpg, png, webp, gif)"));
  }
}

const upload = multer({
  storage,
  fileFilter: filtroArchivo,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB máximo por archivo
  },
});

module.exports = upload;