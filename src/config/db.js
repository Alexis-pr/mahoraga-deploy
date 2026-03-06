// Configura una sola conexión reutilizable (pool) para toda la aplicación.
const { Pool } = require("pg");
const dotenv = require("dotenv");
const path = require("path");

// Carga variables desde raíz o desde src/.env para soportar ambos escenarios.
dotenv.config();
dotenv.config({ path: path.resolve(__dirname, "../.env") });

// Si existe URL completa se prioriza; si no, se construye con DB_HOST/DB_PORT/etc.
const hasDatabaseUrl = Boolean(process.env.DATABASE_URL);

const pool = hasDatabaseUrl
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
    })
  : new Pool({
      host: process.env.DB_HOST || "localhost",
      port: Number(process.env.DB_PORT) || 5432,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PWD,
    });

module.exports = pool;
