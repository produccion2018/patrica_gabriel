console.log("🖐️ 1 - INICIO APP");

const express = require("express");
const cors = require("cors");

require("./database/initDatabase");

const reservasRoutes = require("./routes/reservas.routes");
const historialRoutes = require("./routes/historial.routes");
const comentariosRoutes = require("./routes/comentarios.routes");
const propiedadesRoutes = require("./routes/propiedades.routes");
const adminRoutes = require("./routes/admin.routes");
const uploadRoutes = require("./routes/upload.routes");
const actividadRoutes = require("./routes/actividad.routes");

const app = express();
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

app.use("/api/reservas", reservasRoutes);
app.use("/api/historial", historialRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api", comentariosRoutes);
app.use("/api", propiedadesRoutes);
app.use("/api", uploadRoutes);
app.use("/api/actividad", actividadRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🖐️ Servidor iniciado en puerto ${PORT}`);
});