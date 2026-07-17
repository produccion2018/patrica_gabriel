const subirImagen = (req, res) => {
  if (!req.file) return res.status(400).json({ success: false });
  res.json({ success: true, imagen: `/uploads/${req.file.filename}` });
};

module.exports = { subirImagen };