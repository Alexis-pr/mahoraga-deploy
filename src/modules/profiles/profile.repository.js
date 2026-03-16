import { pool } from "../../config/db.config.js";

export const createProfile = async (id_user, photo_url) => {
    const query = `
    INSERT INTO profile(id_user, photo_url) VALUES ($1, $2) RETURNING *`;
    const values = [id_user, photo_url];

    try {
        const response = await pool.query(query, values);
        return response.rows[0];
    } catch (error) {
        console.error(`error: user not created: ${error}`);
        throw error;
    }
}