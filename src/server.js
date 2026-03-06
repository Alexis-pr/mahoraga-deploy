// Servidor Express base con middleware global y montaje de rutas API.
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const apiRoutes = require("./routes");

dotenv.config();

const app = express();
// Este parseo prioriza APP_PORT para que frontend y backend usen el mismo puerto local.
const port = Number(process.env.APP_PORT || process.env.PORT) || 3000;

app.use(cors());
app.use(express.json());

app.use("/api", apiRoutes);

app.get("/", (_req, res) => {
  res.status(200).json({
    message: "Backend listo. Crea tus endpoints en /src/routes",
  });
});

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
