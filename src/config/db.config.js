import pkg from 'pg'


const { Pool } = pkg

export const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PWD,
    port: process.env.DB_PORT || 5432,  // fallback por si no está definida
    ssl: false
})
