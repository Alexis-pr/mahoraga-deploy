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

export const getQuestionByLevel = async (id_level) => {
    try {
        const res = await pool.query(
            `
            SELECT
                q.id_question,
                q.id_topic,
                q.id_level,
                qt.id_language,
                qt.question_text
            FROM question q
            LEFT JOIN question_translation qt ON qt.id_question = q.id_question
            WHERE q.id_level = $1
            ORDER BY q.id_question, qt.id_language
            `,
            [id_level]
        )
        return res.rows
    } catch (error) {
        console.error(`Error: could not access the questions by level`, error)
        throw error
    }
}

export const getInterviewQuestions = async ({
    id_level = null,
    id_language = null,
    technology = '',
    topic = '',
    limit = 5
}) => {
    try {
        let response = await queryInterviewQuestions(id_level, id_language)

        if (!response.rows.length && id_language !== null) {
            response = await queryInterviewQuestions(id_level, null)
        }

        const rankedQuestions = rankInterviewQuestions(
            response.rows,
            buildInterviewKeywords(technology, topic)
        )

        return rankedQuestions.slice(0, Math.max(1, limit))
    } catch (error) {
        console.error('Error: could not access interview questions', error)
        throw error
    }
}

async function queryInterviewQuestions(id_level, id_language) {
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
          AND qt.question_text IS NOT NULL
        `,
        [id_level, id_language]
    )
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
