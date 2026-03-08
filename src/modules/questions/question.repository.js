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
            VALUES ($1, $2, $3)
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
                id_level = $2,
            WHERE id_question = $4
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
