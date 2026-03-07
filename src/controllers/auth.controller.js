// Este controlador autentica login usando datos enviados desde el formulario del frontend.
const pool = require("../config/db");

// Este DTO toma el body JSON del frontend y lo normaliza para autenticar.
function buildLoginDTO(payload = {}) {
  return {
    identifier: payload.identifier?.trim(),
    password: payload.password,
  };
}

// Este mapper devuelve solo datos seguros de sesión y nunca el password.
function toSessionUserDTO(row) {
  return {
    id_user: row.id_user,
    user_name: row.user_name,
    email: row.email,
    user_status: row.user_status,
    id_level: row.id_level,
    id_language: row.id_language,
  };
}

// Este endpoint valida credenciales y responde el usuario autenticado.
async function loginUser(req, res) {
  const loginDTO = buildLoginDTO(req.body);

  // Esta validación confirma que llegaron los 2 campos del formulario.
  if (!loginDTO.identifier || !loginDTO.password) {
    return res.status(400).json({
      ok: false,
      message: "identifier y password son obligatorios",
    });
  }

  try {
    // Esta consulta busca por email o username en la tabla real public."user".
    const query = `
      SELECT id_user, user_name, email, password, user_status, id_level, id_language
      FROM "user"
      WHERE LOWER(email) = LOWER($1) OR LOWER(user_name) = LOWER($1)
      LIMIT 1
    `;
    const result = await pool.query(query, [loginDTO.identifier]);
    const dbUser = result.rows[0];

    // Esta respuesta evita filtrar si el usuario existe o no.
    if (!dbUser) {
      return res.status(401).json({
        ok: false,
        message: "Credenciales invalidas",
      });
    }

    // Esta comparación usa texto plano porque registro también guarda texto plano.
    if (dbUser.password !== loginDTO.password) {
      return res.status(401).json({
        ok: false,
        message: "Credenciales invalidas",
      });
    }

    // Esta regla corta acceso si el estado no es activo.
    if (dbUser.user_status !== "active") {
      return res.status(403).json({
        ok: false,
        message: "Usuario inactivo o bloqueado",
      });
    }

    return res.status(200).json({
      ok: true,
      message: "Login exitoso",
      data: toSessionUserDTO(dbUser),
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: "No se pudo iniciar sesion",
      error: error.message,
    });
  }
}

module.exports = { loginUser };
