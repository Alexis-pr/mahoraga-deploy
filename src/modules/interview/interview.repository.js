import { pool } from "../../config/db.config.js";

let sessionStatusCache = null;

export const createInterview = async ({
    id_user,
    id_topic = null,
    technology = "",
    id_level,
    session_status,
    date_ini,
}) => {
    // Primero intentamos resolver por tecnología (más fiable); si no, usamos id_topic recibido.
    const resolvedTopicId = (await resolveTopicIdByTechnology(technology)) || id_topic;

    if (!resolvedTopicId) {
        throw new Error(`No se pudo resolver el topic para technology "${technology}".`);
    }

    const columns = ["id_user", "id_topic", "id_level", "date_ini"];
    const values = [id_user, resolvedTopicId, id_level, date_ini];

    if (session_status != null && String(session_status).trim().length > 0) {
        const resolvedStatus = await resolveSessionStatus(session_status);
        columns.push("session_status");
        values.push(resolvedStatus);
    }

    const placeholders = columns.map((_, index) => `$${index + 1}`);

    const query = `
    INSERT INTO interview_session(${columns.join(", ")})
    VALUES (${placeholders.join(", ")})
    RETURNING *`;

    try {
        const response = await pool.query(query, values);
        return response.rows[0];
    } catch (error) {
        console.error(`error: interview not created: ${error}`);
        throw error;
    }
}

export const endInterview = async (id_session, date_fin) => {
    const query = `
    UPDATE interview_session
    SET date_fin = $2
    WHERE id_session = $1
    RETURNING *;
    `
    const values = [id_session, date_fin]

    try {
        const res = await pool.query(query, values);
        return res.rows[0];
    }catch (error) {
        console.error(`Error, date not update: ${error}` );
        throw error;
    }
}

async function resolveTopicIdByTechnology(technology) {
    const normalizedTechnology = String(technology || "").trim().toLowerCase()

    if (!normalizedTechnology) {
        return null
    }

    const topicMatchers = {
        python: ['python'],
        html: ['html'],
        css: ['css'],
        javascript: ['javascript', 'javascrip', 'js'],
        sql: ['data base', 'database', 'sql']
    }

    const matchers = topicMatchers[normalizedTechnology] || [normalizedTechnology]
    const response = await pool.query('SELECT id_topic, topic FROM topic')

    for (const row of response.rows) {
        const normalizedTopic = String(row.topic || "").trim().toLowerCase()
        if (matchers.some((matcher) => normalizedTopic.includes(matcher))) {
            return row.id_topic
        }
    }

    return null
}

async function resolveSessionStatus(requestedStatus) {
    const available = await getSessionStatusValues()
    if (!available.length) {
        throw new Error("No hay estados de sesión configurados.")
    }

    const normalizedRequested = String(requestedStatus || "").trim()
    const match =
        normalizedRequested &&
        available.find(
            (value) => value.toLowerCase() === normalizedRequested.toLowerCase(),
        )

    if (match) {
        return match
    }

    const fallback = available[0]
    console.warn(
        `session_status "${requestedStatus}" no válido, se usará "${fallback}" en su lugar.`,
    )
    return fallback
}

async function getSessionStatusValues() {
    if (sessionStatusCache) {
        return sessionStatusCache
    }

    const { rows } = await pool.query(
        "SELECT unnest(enum_range(NULL::session_status_enum)) AS status",
    )
    sessionStatusCache = rows.map((row) => row.status)
    return sessionStatusCache
}
