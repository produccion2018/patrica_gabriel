const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

// Mismo filtro de antes — solo imágenes.
const TIPOS_PERMITIDOS = ["image/jpeg", "image/png", "image/webp", "image/gif"];

function filtroArchivo(req, file, cb) {
  if (TIPOS_PERMITIDOS.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Solo se permiten imágenes (jpg, png, webp, gif)"));
  }
}

// En vez de guardar en el disco local (que se borraba al dormirse
// el servicio en Render), ahora las imágenes se suben directo a
// Cloudinary y quedan ahí para siempre, con una URL fija.
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "las-toninas",
    allowed_formats: ["jpg", "jpeg", "png", "webp", "gif"],
  },
});

const upload = multer({
  storage,
  fileFilter: filtroArchivo,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB máximo por archivo
  },
});

module.exports = upload;