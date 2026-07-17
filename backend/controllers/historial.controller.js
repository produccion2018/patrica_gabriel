const db = require("../database/db");
const PDFDocument = require("pdfkit");
const { enviarCorreo, armarHtmlMensajePersonalizado } = require("../services/email.service");

const listarHistorial = (req, res) => {
  db.all(
    "SELECT * FROM historial_reservas ORDER BY fecha_archivado DESC",
    [],
    (err, rows) => res.json(rows)
  );
};

const eliminarHistorial = (req, res) => {
  const id = req.params.id;
  db.run(
    "DELETE FROM historial_reservas WHERE id = ?",
    [id],
    function (err) {
      if (err) {
        console.error("❌ Error eliminando historial:", err.message);
        return res.status(500).json({ success: false, error: err.message });
      }
      console.log(`🗑️ Historial id=${id} → filas borradas: ${this.changes}`);
      if (this.changes === 0) {
        return res
          .status(404)
          .json({ success: false, error: "No se encontró ese registro (id no coincide)" });
      }
      res.json({ success: true });
    }
  );
};

// Envía un mail con el texto que Patricia/Gabriel escriben en el panel
// (promociones, agradecimiento, lo que necesiten) a un cliente que ya
// está en el historial. El texto llega por req.body.mensaje.
const enviarEmailHistorial = (req, res) => {
  const mensaje = (req.body.mensaje || "").trim();

  if (!mensaje) {
    return res.status(400).json({ success: false, error: "Escribí el mensaje antes de enviarlo" });
  }

  db.get(
    "SELECT * FROM historial_reservas WHERE id = ?",
    [req.params.id],
    async (err, r) => {
      if (err || !r) {
        return res.status(404).json({ success: false, error: "Registro no encontrado" });
      }
      if (!r.email) {
        return res.status(400).json({ success: false, error: "Este cliente no tiene email cargado" });
      }
      try {
        await enviarCorreo(
          r.email,
          "Las Toninas",
          armarHtmlMensajePersonalizado(r.nombre, mensaje)
        );
        res.json({ success: true });
      } catch (error) {
        console.error("❌ Error enviando email desde historial:", error);
        res.status(500).json({ success: false, error: "No se pudo enviar el correo" });
      }
    }
  );
};

const NOMBRES_MES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

// GET /api/historial/reporte?mes=7&anio=2026
// Genera un PDF con la cantidad de días alquilados y reservas por casa
// dentro del mes/año solicitado, y lo descarga directo al navegador.
const reporteMensual = (req, res) => {
  const ahora = new Date();
  const mes = parseInt(req.query.mes, 10) || ahora.getMonth() + 1; // 1-12
  const anio = parseInt(req.query.anio, 10) || ahora.getFullYear();
  const mesStr = String(mes).padStart(2, "0");
  const prefijo = `${anio}-${mesStr}`; // ej "2026-07"

  db.all("SELECT * FROM historial_reservas", [], (err, rows) => {
    if (err) return res.status(500).json({ success: false });

    // Acumulador por casa: { "Casa Frente al Mar": { dias: 0, reservas: 0 } }
    const porCasa = {};

    (rows || []).forEach((r) => {
      let fechas = [];
      try {
        fechas = JSON.parse(r.fechas || "[]");
      } catch {
        fechas = [];
      }
      if (!Array.isArray(fechas)) fechas = [];

      const diasDelMes = fechas.filter((f) => String(f).startsWith(prefijo));
      if (diasDelMes.length === 0) return;

      const casa = r.casa || "Sin especificar";
      if (!porCasa[casa]) porCasa[casa] = { dias: 0, reservas: 0 };
      porCasa[casa].dias += diasDelMes.length;
      porCasa[casa].reservas += 1;
    });

    const casas = Object.keys(porCasa).sort();

    // ---- Generación del PDF ----
    const doc = new PDFDocument({ margin: 50 });
    const nombreArchivo = `reporte-${anio}-${mesStr}.pdf`;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${nombreArchivo}"`
    );
    doc.pipe(res);

    doc
      .fontSize(20)
      .fillColor("#0f172a")
      .text("Reporte Mensual de Ocupación", { align: "center" });
    doc
      .fontSize(13)
      .fillColor("#64748b")
      .text(`${NOMBRES_MES[mes - 1]} ${anio} — Las Toninas`, { align: "center" });
    doc.moveDown(2);

    if (casas.length === 0) {
      doc
        .fontSize(12)
        .fillColor("#334155")
        .text("No hay reservas finalizadas registradas para este mes.");
    } else {
      const colCasaX = 50;
      const colReservasX = 320;
      const colDiasX = 440;
      let y = doc.y;

      doc.fontSize(11).fillColor("#ffffff");
      doc.rect(50, y, 495, 24).fill("#0f172a");
      doc.fillColor("#ffffff").text("Casa", colCasaX + 8, y + 6);
      doc.text("Reservas", colReservasX, y + 6);
      doc.text("Días alquilados", colDiasX, y + 6);
      y += 24;

      let totalReservas = 0;
      let totalDias = 0;

      casas.forEach((casa, i) => {
        const { dias, reservas } = porCasa[casa];
        totalReservas += reservas;
        totalDias += dias;

        const bg = i % 2 === 0 ? "#f8fafc" : "#ffffff";
        doc.rect(50, y, 495, 22).fill(bg);
        doc.fillColor("#0f172a").fontSize(10.5);
        doc.text(casa, colCasaX + 8, y + 5, { width: 260 });
        doc.text(String(reservas), colReservasX, y + 5);
        doc.text(String(dias), colDiasX, y + 5);
        y += 22;
      });

      y += 6;
      doc.fontSize(11).fillColor("#0f172a");
      doc.text(`Total reservas finalizadas: ${totalReservas}`, colCasaX, y);
      y += 18;
      doc.text(`Total de días alquilados: ${totalDias}`, colCasaX, y);
    }

    doc.moveDown(3);
    doc
      .fontSize(9)
      .fillColor("#94a3b8")
      .text(`Generado el ${new Date().toLocaleDateString("es-AR")}`, {
        align: "right",
      });

    doc.end();
  });
};

module.exports = {
  listarHistorial,
  eliminarHistorial,
  enviarEmailHistorial,
  reporteMensual,
};