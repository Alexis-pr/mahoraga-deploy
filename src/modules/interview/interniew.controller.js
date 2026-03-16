import { createInterview, endInterview } from './interview.services.js'

export const createInterviewReq = async (req, res) => {
    const {id_user, id_topic, technology, id_level, date_ini} = req.body
    const missingFields = []

    if (!id_user) missingFields.push('id_user')
    if (!id_topic && !technology) missingFields.push('id_topic or technology')
    if (!id_level) missingFields.push('id_level')
    if (!date_ini) missingFields.push('date_ini')

    if (missingFields.length > 0) {
        return res.status(400).json({
            error: 'Error submitting user, debes completar todos los campos.',
            missingFields
        })
    }

    try {
        const newInterview = await createInterview({
            id_user,
            id_topic,
            technology,
            id_level,
            date_ini
        })
        res.status(201).json({
            message: 'La session se crea correctamente.',
            interview: newInterview
        })
    } catch (error) {
        console.error('Error creating session', error)
        res.status(500).json({ error: error.message })
    }
}



export const endInterviewReq = async (req, res) => {
    const { id_session } = req.params
    const { date_fin } = req.body
    const missingFields = []

    if (!id_session) missingFields.push('id_session')
    if (!date_fin) missingFields.push('date_fin')

    if (missingFields.length > 0) {
        return res.status(400).json({
            error: 'Error submitting session, debes completar todos los campos.',
            missingFields
        })
    }
    try {
        const updatedInterview = await endInterview(id_session, date_fin)
        res.status(200).json({
            message: 'La session se actualiza correctamente.',
            interview: updatedInterview
        })
    } catch (error) {
        console.error('Error ending session', error)
        res.status(500).json({ error: error.message })
    }
}
