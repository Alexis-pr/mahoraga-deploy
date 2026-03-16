import { createUsers, getUsers, loginUserQuery, processInterviewResult, getUserProgress, getUserTopicProgressData } from './user.service.js'

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

export const processInterviewResultReq = async (req, res) => {
    const { id_user, id_session } = req.body

    const missingFields = []
    if (!id_user) missingFields.push('id_user')
    if (!id_session) missingFields.push('id_session')

    if (missingFields.length > 0) {
        return res.status(400).json({
            error: 'Missing required fields',
            missingFields
        })
    }

    try {
        const result = await processInterviewResult(id_user, id_session)
        res.status(200).json(result)
    } catch (error) {
        console.error('Error processing interview result', error)
        res.status(500).json({ error: error.message })
    }
}

export const getUserProgressReq = async (req, res) => {
    const { id_user } = req.params

    if (!id_user) {
        return res.status(400).json({
            error: 'Missing required parameter: id_user'
        })
    }

    try {
        const progress = await getUserProgress(id_user)
        res.status(200).json(progress)
    } catch (error) {
        console.error('Error getting user progress', error)
        res.status(500).json({ error: error.message })
    }
}

export const getUserTopicProgressDataReq = async (req, res) => {
    const { id_user } = req.params

    if (!id_user) {
        return res.status(400).json({
            error: 'Missing required parameter: id_user'
        })
    }

    try {
        const progressData = await getUserTopicProgressData(id_user)
        res.status(200).json(progressData)
    } catch (error) {
        console.error('Error getting user topic progress data', error)
        res.status(500).json({ error: error.message })
    }
}
