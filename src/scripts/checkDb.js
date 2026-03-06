// Script de verificación de conexión a PostgreSQL usando la configuración central.
const pool = require("../config/db");

async function checkDbConnection() {
  try {
    const result = await pool.query("SELECT NOW() AS now");
    console.log("Postgres conectado:", result.rows[0].now);
  } catch (error) {
    console.error("Error conectando a Postgres:", error.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

checkDbConnection();
