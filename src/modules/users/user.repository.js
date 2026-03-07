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
    (User_name, email, password, user_status, id_language, id_level) VALUES ($1, $2, crypt($3, gen_salt('bf')), $4, $5, $6) RETURNING *`;
    const values = [user_name, email, password, user_status, id_language, id_level];

    try {
        const response = await pool.query(query, values);
        return response.rows[0];
    } catch (error) {
        console.error(`error: user not created: ${error}`);
        throw error;
    }
}


export const loginUserQuery = async (l_login, l_password)=>{
    const query = `
    SELECT id_user, user_name, email, user_status, id_language, id_level
    FROM "user"
    WHERE (email = $1 OR user_name = $1)
      AND password = crypt($2, password)
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
