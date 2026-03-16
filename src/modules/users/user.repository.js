import { pool } from '../../config/db.config.js'


export const getUsers = async () =>{
    const query = `
    select * from "user"`
    try {
        const response = await pool.query(query);
        return response.rows
    }catch(error){
        console.log(`Error, data could not be found`)
        throw error
    }
}


export const createUsers = async (user_name, email, password, user_status, id_language, id_level) => {
    const query = `
    INSERT INTO "user"
    (User_name, email, password, user_status, id_language, id_level)
    VALUES ($1, $2, crypt($3, gen_salt('bf')), $4, $5, $6)
    RETURNING *`;
    const values = [user_name, email, password, user_status, id_language, id_level];

    const insertProgressQuery = `
    INSERT INTO user_topic_progress (
        id_user,
        id_topic,
        id_asinated_level,
        is_unlocked,
        is_completed,
        score_best,
        attempt_count
    )
    SELECT
        $1,
        t.id_topic,
        l.id_asinated_level,
        CASE WHEN l.id_asinated_level = 1 THEN true ELSE false END,
        false,
        0,
        0
    FROM topic t
    CROSS JOIN asinated_level l`;

    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const response = await client.query(query, values);
        const newUser = response.rows[0];
        await client.query(insertProgressQuery, [newUser.id_user]);
        await client.query('COMMIT');
        return newUser;
    } catch (error) {
        await client.query('ROLLBACK');
        console.error(`error: user not created: ${error}`);
        throw error;
    } finally {
        client.release();
    }
}


export const loginUserQuery = async (l_login, l_password)=>{
    const query = `
    SELECT id_user, user_name, email, user_status, id_language, id_level
    FROM "user"
    WHERE (LOWER(email) = LOWER($1) OR LOWER(user_name) = LOWER($1))
      AND (
        (password LIKE '$2%' AND password = crypt($2, password))
        OR (password NOT LIKE '$2%' AND password = $2)
      )
    LIMIT 1
    `
    const values = [l_login, l_password]

    try {
        const response = await pool.query(query, values)
        return response.rows[0] ?? null
    }catch (error){
        console.error(`error, data cannot be accessed`);
        throw error;
    }
}

// Obtiene el score promedio de una sesión de entrevista
export const getInterviewAverageScore = async (id_session) => {
    const query = `
    SELECT 
        AVG(qa.score::numeric) as avg_score,
        qi.id_question,
        q.id_topic,
        q.id_level
    FROM question_answered qa
    JOIN question_instance qi ON qi.id_question_instance = qa.id_question_instance
    JOIN question q ON q.id_question = qi.id_question
    WHERE qa.id_question_instance IN (
        SELECT id_question_instance 
        FROM question_instance 
        WHERE id_session = $1
    )
    GROUP BY qi.id_question, q.id_topic, q.id_level
    `;
    try {
        const response = await pool.query(query, [id_session]);
        return response.rows;
    } catch (error) {
        console.error(`Error getting interview score: ${error}`);
        throw error;
    }
}

// Desbloquea el siguiente nivel en user_topic_progress
export const unlockNextLevel = async (id_user, id_topic, current_level, score) => {
    const next_level = current_level + 1;
    
    // Verificar que next_level no exceda el máximo (25)
    if (next_level > 25) {
        console.log(`Max level reached (25) for user ${id_user}`);
        return { unlocked: false, reason: 'max_level_reached' };
    }

    // Primero, marcar el nivel actual como completado
    const completeCurrentLevelQuery = `
    UPDATE user_topic_progress
    SET is_completed = true, score_best = $4
    WHERE id_user = $1 AND id_topic = $2 AND id_asinated_level = $3
    `;

    const unlockQuery = `
    UPDATE user_topic_progress
    SET is_unlocked = true
    WHERE id_user = $1 
      AND id_topic = $2 
      AND id_asinated_level = $3
    RETURNING *
    `;
    
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        
        // Marcar nivel actual como completado
        await client.query(completeCurrentLevelQuery, [id_user, id_topic, current_level, score]);
        
        // Desbloquear siguiente nivel
        const response = await client.query(unlockQuery, [id_user, id_topic, next_level]);
        
        await client.query('COMMIT');
        
        if (response.rows.length > 0) {
            console.log(`Unlocked level ${next_level} for user ${id_user}, topic ${id_topic}`);
            return { unlocked: true, level: next_level, completed: current_level };
        }
        return { unlocked: false, reason: 'level_not_found' };
    } catch (error) {
        await client.query('ROLLBACK');
        console.error(`Error unlocking level: ${error}`);
        throw error;
    } finally {
        client.release();
    }
}

// Sube el nivel del usuario en la tabla user
export const upgradeUserLevel = async (id_user, current_user_level) => {
    const new_level = current_user_level + 1;
    
    // Verificar que no exceda el máximo (25)
    if (new_level > 25) {
        console.log(`Max user level reached (25) for user ${id_user}`);
        return { upgraded: false, reason: 'max_level_reached' };
    }

    const query = `
    UPDATE "user"
    SET id_level = $1
    WHERE id_user = $2
    RETURNING *
    `;
    
    try {
        const response = await pool.query(query, [new_level, id_user]);
        if (response.rows.length > 0) {
            console.log(`Upgraded user ${id_user} to level ${new_level}`);
            return { upgraded: true, new_level };
        }
        return { upgraded: false, reason: 'user_not_found' };
    } catch (error) {
        console.error(`Error upgrading user level: ${error}`);
        throw error;
    }
}

// Procesa el resultado de una entrevista y actualiza el progreso
export const processInterviewResult = async (id_user, id_session) => {
    try {
        // 1. Obtener el score promedio de la entrevista
        const scores = await getInterviewAverageScore(id_session);
        
        if (!scores || scores.length === 0) {
            return { error: 'No scores found' };
        }

        // Calcular el promedio general
        const avgScore = scores.reduce((sum, s) => sum + parseFloat(s.avg_score || 0), 0) / scores.length;
        console.log(`Interview ${id_session} average score: ${avgScore}`);

        // Obtener el topic y nivel de las preguntas
        const topicId = scores[0]?.id_topic;
        const levelId = scores[0]?.id_level;

        // 2. Si score >= 70%, desbloquear siguiente nivel
        let unlockResult = null;
        if (avgScore >= 70 && topicId && levelId) {
            unlockResult = await unlockNextLevel(id_user, topicId, parseInt(levelId), Math.round(avgScore));
        }

        // 3. Si score >= 90%, subir nivel del usuario
        let upgradeResult = null;
        if (avgScore >= 90) {
            // Obtener el nivel actual del usuario
            const userQuery = await pool.query('SELECT id_level FROM "user" WHERE id_user = $1', [id_user]);
            const currentUserLevel = userQuery.rows[0]?.id_level || 1;
            upgradeResult = await upgradeUserLevel(id_user, currentUserLevel);
        }

        return {
            success: true,
            avgScore: Math.round(avgScore),
            unlockResult,
            upgradeResult
        };
    } catch (error) {
        console.error(`Error processing interview result: ${error}`);
        return { error: error.message };
    }
}

// Obtiene el progreso del usuario (niveles desbloqueados)
export const getUserProgress = async (id_user) => {
    const query = `
    SELECT 
        id_topic,
        id_asinated_level,
        is_unlocked,
        is_completed,
        score_best
    FROM user_topic_progress
    WHERE id_user = $1
    ORDER BY id_topic, id_asinated_level
    `;
    
    try {
        const response = await pool.query(query, [id_user]);
        return response.rows;
    } catch (error) {
        console.error(`Error getting user progress: ${error}`);
        throw error;
    }
}

// Obtiene todos los datos crudos de user_topic_progress para un usuario
export const getUserTopicProgressData = async (id_user) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Seed progress rows if they do not exist for this user
        const seedQuery = `
        INSERT INTO user_topic_progress (
            id_user,
            id_topic,
            id_asinated_level,
            is_unlocked,
            is_completed,
            score_best,
            attempt_count
        )
        SELECT
            $1,
            t.id_topic,
            l.id_asinated_level,
            CASE WHEN l.id_asinated_level = 1 THEN true ELSE false END,
            false,
            0,
            0
        FROM topic t
        CROSS JOIN asinated_level l
        ON CONFLICT (id_user, id_topic, id_asinated_level) DO NOTHING;
        `;
        await client.query(seedQuery, [id_user]);

        const selectQuery = `
        SELECT 
            id_progress,
            id_user,
            id_topic,
            id_asinated_level,
            is_unlocked,
            is_completed,
            score_best,
            attempt_count,
            last_attempt
        FROM user_topic_progress
        WHERE id_user = $1
        ORDER BY id_topic, id_asinated_level
        `;

        const response = await client.query(selectQuery, [id_user]);

        await client.query('COMMIT');

        console.log(`[DB] user_topic_progress data for user ${id_user}:`, response.rows);
        return response.rows;
    } catch (error) {
        await client.query('ROLLBACK');
        console.error(`Error getting user topic progress data: ${error}`);
        throw error;
    } finally {
        client.release();
    }
}
