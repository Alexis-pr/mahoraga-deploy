// Este controlador conecta el DTO del frontend con la tabla public."user".
const pool = require("../config/db");

// Este mapa traduce niveles por nombre a IDs de la tabla level.
const LEVEL_BY_NAME = {
  intern: 1,
  junior: 2,
  middle: 3,
  semisenior: 4,
  senior: 5,
  techleader: 6,
  architect: 7,
};

// Este mapa traduce idiomas por nombre a IDs de la tabla language.
const LANGUAGE_BY_NAME = {
  espanish: 1,
  espanol: 1,
  "español": 1,
  spanish: 1,
  english: 2,
};

// Esta función normaliza user_status al enum real de la BD.
function normalizeStatus(rawStatus) {
  if (typeof rawStatus === "boolean") return rawStatus ? "active" : "inactive";
  if (typeof rawStatus !== "string") return "active";
  const status = rawStatus.trim().toLowerCase();
  return ["active", "inactive", "banned"].includes(status) ? status : null;
}

// Esta función normaliza id_level desde número o texto.
function normalizeLevel(rawLevel) {
  if (rawLevel == null) return 2;
  if (Number.isInteger(rawLevel)) return rawLevel;
  const parsed = Number.parseInt(rawLevel, 10);
  if (Number.isInteger(parsed)) return parsed;
  if (typeof rawLevel !== "string") return null;
  return LEVEL_BY_NAME[rawLevel.trim().toLowerCase()] ?? null;
}

// Esta función normaliza id_language desde número o texto.
function normalizeLanguage(rawLanguage) {
  if (rawLanguage == null) return 1;
  if (Number.isInteger(rawLanguage)) return rawLanguage;
  const parsed = Number.parseInt(rawLanguage, 10);
  if (Number.isInteger(parsed)) return parsed;
  if (typeof rawLanguage !== "string") return null;
  return LANGUAGE_BY_NAME[rawLanguage.trim().toLowerCase()] ?? null;
}

// Este DTO convierte el body al esquema real esperado por la BD.
function buildUserCreateDTO(payload = {}) {
  return {
    user_name: payload.user_name?.trim(),
    email: payload.email?.trim()?.toLowerCase(),
    password: payload.password,
    user_status: normalizeStatus(payload.user_status ?? payload.id_status),
    id_level: normalizeLevel(payload.id_level),
    id_language: normalizeLanguage(payload.id_language),
  };
}

// Este mapper evita exponer el password al responder el registro.
function toPublicUser(row) {
  return {
    id_user: row.id_user,
    user_name: row.user_name,
    email: row.email,
    user_status: row.user_status,
    id_level: row.id_level,
    id_language: row.id_language,
  };
}

// Este endpoint lista usuarios para el flujo de login del frontend actual.
async function getUsers(_req, res) {
  try {
    const query = `
      SELECT id_user, user_name, email, password, user_status, id_level, id_language
      FROM "user"
      ORDER BY created_at DESC
    `;
    const result = await pool.query(query);
    return res.status(200).json(result.rows);
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: "No se pudieron listar los usuarios",
      error: error.message,
    });
  }
}

// Este endpoint crea un usuario: request -> DTO -> validación -> INSERT.
async function createUser(req, res) {
  const userDTO = buildUserCreateDTO(req.body);

  // Esta validación corta requests incompletos antes de tocar la base de datos.
  if (!userDTO.user_name || !userDTO.email || !userDTO.password) {
    return res.status(400).json({
      ok: false,
      message: "user_name, email y password son obligatorios",
    });
  }

  // Esta validación evita enviar enums y llaves foráneas inválidas.
  if (!userDTO.user_status || !userDTO.id_level || !userDTO.id_language) {
    return res.status(400).json({
      ok: false,
      message: "user_status, id_level o id_language tienen un valor inválido",
    });
  }

  try {
    const query = `
      INSERT INTO "user" (user_name, email, password, user_status, id_language, id_level)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id_user, user_name, email, user_status, id_level, id_language
    `;
    const values = [
      userDTO.user_name,
      userDTO.email,
      userDTO.password,
      userDTO.user_status,
      userDTO.id_language,
      userDTO.id_level,
    ];
    const result = await pool.query(query, values);

    return res.status(201).json({
      ok: true,
      message: "Usuario creado",
      data: toPublicUser(result.rows[0]),
    });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({
        ok: false,
        message: "El email ya existe",
      });
    }

    if (error.code === "23503") {
      return res.status(400).json({
        ok: false,
        message: "id_level o id_language no existen en tablas de referencia",
      });
    }

    return res.status(500).json({
      ok: false,
      message: "No se pudo crear el usuario",
      error: error.message,
    });
  }
}

module.exports = { createUser, getUsers };
