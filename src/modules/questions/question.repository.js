
import { pool } from '../../config/db.config.js'


export const consultationQuestion = async () => {
    try{
        const res = await pool.query('SELECT * FROM question;')
        return res.rows
    }catch(error){
        console.error('Error: Could not access the questions: ', error);
        throw error;
    }
}

export const createQuestion = async ({ id_topic, id_level, translations }) => {
    const client = await pool.connect()
    try {
        await client.query('BEGIN')
        const questionResult = await client.query(
            `
            INSERT INTO question (id_topic, id_level)
            VALUES ($1, $2)
            RETURNING *
            `,
            [id_topic, id_level]
        )
        const { id_question } = questionResult.rows[0]

        for (const translation of translations) {
            await client.query(
                `
                INSERT INTO question_translation (id_question, id_language, question_text)
                VALUES ($1, $2, $3)
                `,
                [id_question, translation.id_language, translation.question_text]
            )
        }
        await client.query('COMMIT')
        return { id_question }
    } catch (error) {
        await client.query('ROLLBACK')
        console.error('Error creating questions :', error)
        throw error
    } finally {
        client.release()
    }
}

export const updateQuestion = async (id_question, id_topic, id_level, translations) => {
    const client = await pool.connect()

    try {
        await client.query('BEGIN')
        await client.query(
            `
            UPDATE question
            SET
                id_topic = $1,
                id_level = $2
            WHERE id_question = $3
            RETURNING id_question
            `,
            [id_topic, id_level, id_question]
        )
        await client.query(
            `
            DELETE FROM question_translation
            WHERE id_question = $1
            `,
            [id_question]
        )
        if (Array.isArray(translations) && translations.length > 0) {
            for (const translation of translations) {
                await client.query(
                    `
                    INSERT INTO question_translation (id_question, id_language, question_text)
                    VALUES ($1, $2, $3)
                    `,
                    [id_question, translation.id_language, translation.question_text]
                )
            }
        }
        await client.query('COMMIT')
        return { id_question }
    } catch (error) {
        await client.query('ROLLBACK')
        console.error('Error updating question :', error)
        throw error
    } finally {
        client.release()
    }
}

export const getQuestionByLevel = async (id_level, id_topic, id_language) => {
    try {
        const params = [id_level]
        let query = `
            SELECT
                q.id_question,
                q.id_topic,
                q.id_level,
                qt.id_language,
                qt.question_text
            FROM question q
            LEFT JOIN question_translation qt ON qt.id_question = q.id_question
            WHERE q.id_level = $1
        `
        if (id_topic) {
            params.push(id_topic)
            query += ` AND q.id_topic = $${params.length}`
        }

        if (id_language) {
            params.push(id_language)
            query += ` AND qt.id_language = $${params.length}`
        }

        query += `
            ORDER BY q.id_question, qt.id_language, q.id_topic
        `

        const res = await pool.query(query, params)
        return res.rows
    } catch (error) {
        console.error(`Error: could not access the questions by level`, error)
        throw error
    }
}


export const newInterviewQuestion = async (id_session, id_question, order_num) => {
    const client = await pool.connect()
    try {
        // Asegura un order_num secuencial si no llega desde el frontend
        let effectiveOrder = Number(order_num)
        if (!effectiveOrder) {
            const { rows } = await client.query(
                'SELECT COALESCE(MAX(order_num), 0) + 1 AS next FROM question_instance WHERE id_session = $1',
                [id_session]
            )
            effectiveOrder = rows[0]?.next || 1
        }

        const query = `
        INSERT INTO question_instance (id_session, id_question, order_num)
        VALUES ($1, $2, $3)
        ON CONFLICT (id_session, id_question) DO NOTHING
        RETURNING *;
        `
        const values = [id_session, id_question, effectiveOrder]

        const response = await client.query(query, values)

        // Si ya existía, devolvemos el registro actual para mantener compatibilidad
        if (response.rowCount === 0) {
            const { rows } = await client.query(
                `
                SELECT * FROM question_instance
                WHERE id_session = $1 AND id_question = $2
                `,
                [id_session, id_question]
            )
            return rows[0]
        }

        return response.rows[0]
    } catch (error) {
        console.error(`error: interview not created: ${error}`)
        throw error
    } finally {
        client.release()
    }
}

// Inserta en bloque todas las preguntas elegidas para una sesión de entrevista
export const createQuestionInstances = async (id_session, id_questions = []) => {
    if (!Array.isArray(id_questions) || id_questions.length === 0) {
        return []
    }

    const client = await pool.connect()

    try {
        await client.query('BEGIN')

        const nextOrderRes = await client.query(
            'SELECT COALESCE(MAX(order_num), 0) + 1 AS next_order FROM question_instance WHERE id_session = $1',
            [id_session]
        )

        const startOrder = nextOrderRes.rows[0]?.next_order || 1

        const { rows } = await client.query(
            `
            INSERT INTO question_instance (id_session, id_question, order_num)
            SELECT $1, qid, $3 + ord - 1
            FROM unnest($2::int[]) WITH ORDINALITY AS t(qid, ord)
            ON CONFLICT (id_session, id_question) DO NOTHING
            RETURNING *
            `,
            [id_session, id_questions, startOrder]
        )

        await client.query('COMMIT')
        return rows
    } catch (error) {
        await client.query('ROLLBACK')
        console.error('Error creating question instances :', error)
        throw error
    } finally {
        client.release()
    }
}

export const newQuestionAnswered = async (id_user, id_question_instance, answer, score, feedback, answered_at) => {
    const query = `
    insert into question_answered (id_user, id_question_instance, answer, score, feedback, answered_at)
    values ($1, $2, $3, $4, $5, $6) returning *;
    `
    const values = [id_user, id_question_instance, answer, score, feedback, answered_at]

    try{
        const res = await pool.query(query, values);
        return res.rows[0];
    }catch (error){
        console.error(`Erro: question answered not created: ${error} `)
        throw error;
    }
}



export const getInterviewQuestions = async ({
    id_level = null,
    id_language = null,
    id_user = null,
    technology = '',
    topic = '',
    limit = 5
}) => {
    try {
        const topicIds = await resolveTopicIds(technology)

        // Mantiene fijo el nivel del usuario y solo abre el idioma si hace falta.
        const fallbackChain = [
            [id_level, id_language],
            [id_level, null]
        ]

        let response = { rows: [] }

        for (const [currentLevel, currentLanguage] of fallbackChain) {
            response = await queryInterviewQuestions(
                currentLevel,
                currentLanguage,
                topicIds,
                id_user
            )

            if (response.rows.length) {
                break
            }
        }

        // Si no hay resultados y se estaba filtrando por id_user, intenta sin ese filtro.
        if (!response.rows.length && id_user) {
            for (const [currentLevel, currentLanguage] of fallbackChain) {
                response = await queryInterviewQuestions(
                    currentLevel,
                    currentLanguage,
                    topicIds,
                    null
                )
                if (response.rows.length) {
                    break
                }
            }
        }

        const rankedQuestions = rankInterviewQuestions(
            response.rows,
            buildInterviewKeywords(technology, topic)
        )

        return shuffleQuestions(rankedQuestions).slice(0, Math.max(1, limit))
    } catch (error) {
        console.error('Error: could not access interview questions', error)
        throw error
    }
}

async function queryInterviewQuestions(id_level, id_language, topicIds = [], id_user = null) {
    return pool.query(
        `
        SELECT
            q.id_question,
            q.id_topic,
            q.id_level,
            qt.id_language,
            qt.question_text
        FROM question q
        LEFT JOIN question_translation qt ON qt.id_question = q.id_question
        WHERE ($1::int IS NULL OR q.id_level = $1)
            AND ($2::int IS NULL OR qt.id_language = $2)
            AND (cardinality($3::int[]) = 0 OR q.id_topic = ANY($3::int[]))
            AND (
                $4::text IS NULL
                OR NOT EXISTS (
                    SELECT 1
                    FROM question_instance qi
                    JOIN interview_session s ON s.id_session = qi.id_session
                    WHERE qi.id_question = q.id_question
                        AND s.id_user::text = $4::text
                )
            )
            AND qt.question_text IS NOT NULL
        `,
        [id_level, id_language, topicIds, id_user]
    )
}


// Inserta una sola pregunta en la sesión, conservando compatibilidad con código previo
export const createQuestionInstance = async (id_session, id_question, order_num = null) => {
    return newInterviewQuestion(id_session, id_question, order_num)
}


async function resolveTopicIds(technology) {
    const normalizedTechnology = technology.trim().toLowerCase()

    if (!normalizedTechnology) {
        return []
    }

    const topicMatchers = {
        python: ['python'],
        html: ['html'],
        css: ['css'],
        javascript: ['javascript', 'javascrip', 'js'],
        sql: ['data base', 'database', 'sql']
    }

    const targetMatchers = topicMatchers[normalizedTechnology] || [normalizedTechnology]
    const response = await pool.query('SELECT id_topic, topic FROM topic')

    return response.rows
        .filter(({ topic }) => {
            const normalizedTopic = String(topic).trim().toLowerCase()
            return targetMatchers.some((matcher) => normalizedTopic.includes(matcher))
        })
        .map(({ id_topic }) => id_topic)
}


function buildInterviewKeywords(technology, topic) {
    return `${technology} ${topic}`
        .toLowerCase()
        .split(/[^a-z0-9áéíóúñ+#.]+/i)
        .map((value) => value.trim())
        .filter((value) => value.length > 2)
}

function rankInterviewQuestions(rows, keywords) {
    const uniqueQuestions = dedupeQuestions(rows)

    return uniqueQuestions
        .map((question) => ({
            ...question,
            _score: calculateQuestionScore(question.question_text, keywords)
        }))
        .sort((left, right) => {
            if (right._score !== left._score) {
                return right._score - left._score
            }

            return Math.random() - 0.5
        })
        .map(({ _score, ...question }) => question)
}

function shuffleQuestions(rows) {
    return [...rows].sort(() => Math.random() - 0.5)
}

function dedupeQuestions(rows) {
    const seen = new Set()

    return rows.filter((row) => {
        if (seen.has(row.id_question)) {
            return false
        }

        seen.add(row.id_question)
        return true
    })
}

function calculateQuestionScore(questionText = '', keywords = []) {
    if (!keywords.length) {
        return 0
    }

    const normalizedQuestion = questionText.toLowerCase()

    return keywords.reduce((score, keyword) => {
        if (normalizedQuestion.includes(keyword)) {
            return score + keyword.length
        }

        return score
    }, 0)
}
