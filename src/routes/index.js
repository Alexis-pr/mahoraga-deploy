// Rutas iniciales de la API (incluye endpoint de salud para prueba rápida).
const express = require("express");
const userRoutes = require("./userRoutes");
const authRoutes = require("./authRoutes");

const router = express.Router();

router.get("/health", (_req, res) => {
  res.status(200).json({ ok: true, message: "API running" });
});

router.use("/users", userRoutes);
router.use("/auth", authRoutes);

module.exports = router;
