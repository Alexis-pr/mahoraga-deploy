// Este controlador transforma, valida y persiste un usuario nuevo en PostgreSQL.
const pool = require("../config/db");

// DTO de entrada: filtra campos permitidos y normaliza formato antes de ir a DB.
function buildUserCreateDTO(payload) {
  return {
    user_name: payload?.user_name?.trim(),
    email: payload?.email?.trim()?.toLowerCase(),
    password: payload?.password,
    id_status: payload?.id_status ?? true,
    id_level: payload?.id_level ?? "Junior",
    id_language: payload?.id_language ?? "espanish",
  };
}

// Caso de uso "crear usuario": request -> DTO -> validación -> INSERT -> response.
async function createUser(req, res) {
  const userDTO = buildUserCreateDTO(req.body);

  // Validación mínima de negocio para evitar inserts incompletos.
  if (!userDTO.user_name || !userDTO.email || !userDTO.password) {
    return res.status(400).json({
      ok: false,
      message: "user_name, email y password son obligatorios",
    });
  }

  try {
    // Consulta parametrizada: evita SQL injection usando placeholders $1..$6.
    const query = `
      INSERT INTO users (user_name, email, password, id_status, id_level, id_language)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, user_name, email, id_status, id_level, id_language
    `;

    // El orden del arreglo debe coincidir exactamente con los placeholders.
    const values = [
      userDTO.user_name,
      userDTO.email,
      userDTO.password,
      userDTO.id_status,
      userDTO.id_level,
      userDTO.id_language,
    ];

    // Ejecuta el INSERT y devuelve solo campos seguros para el cliente.
    const result = await pool.query(query, values);

    return res.status(201).json({
      ok: true,
      message: "Usuario creado",
      data: result.rows[0],
    });
  } catch (error) {
    // Respuesta controlada para no romper el contrato del endpoint.
    return res.status(500).json({
      ok: false,
      message: "No se pudo crear el usuario",
      error: error.message,
    });
  }
}

module.exports = { createUser };
