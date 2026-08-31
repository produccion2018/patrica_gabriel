const subirImagen = (req, res) => {
  if (!req.file) return res.status(400).json({ success: false });

  // Con Cloudinary, req.file.path ya es la URL completa y pública de
  // la imagen (no una ruta local tipo /uploads/...), así que se
  // guarda tal cual viene.
  res.json({ success: true, imagen: req.file.path });
};

module.exports = { subirImagen };