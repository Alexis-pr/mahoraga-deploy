import { createUsers, getUsers, loginUserQuery } from './user.service.js'

export const getUsersReq = async (req, res) => {
    try{
        const data = await getUsers()
        res.status(200).json(data)
    }catch(error){
        res.status(500).json({
            error: 'Error, the server could not retrieve the users'
        })
    }
}

export const createUsersReq = async (req, res) => {
    const { user_name, email, password, user_status, id_language, id_level } = req.body

    const missingFields = []
    if (user_name === undefined || user_name === null || String(user_name).trim() === '') missingFields.push('user_name')
    if (password === undefined || password === null || String(password).trim() === '') missingFields.push('password')

    if (missingFields.length > 0) {
        return res.status(400).json({
            error: 'Error submitting user, you must complete all fields',
            missingFields
        })
    }
        try{
            const newUser = await createUsers(
                user_name,
                email,
                password,
                user_status,
                id_language,
                id_level
            )
            res.status(201).json({
                message: 'The user was created successfully.',
                ...newUser
            })
        }catch (error){
            console.error('Error creating user', error)
            res.status(500).json({error: error.message})
        }
    
}

export const loginUserReq = async (req, res) => {
    const login = req.body?.login?.trim()
    const password = req.body?.password

    const missingFields = []
    if (login === undefined || login === null || String(login).trim() === '') missingFields.push('login')
    if (password === undefined || password === null || String(password).trim() === '') missingFields.push('password')

    if (missingFields.length > 0) {
        return res.status(400).json({
            error: 'Login validation requires both login and password',
            missingFields
        })
    }

    try{
        const user = await loginUserQuery(login, password)
        res.status(200).json({ isValid: Boolean(user), user })
    }catch(error){
        console.error('Error validating login', error)
        res.status(500).json({
            error: 'Error, data cannot be accessed'
        })
    }
}
