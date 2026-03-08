import { createProfile } from './profile.services.js'

export const createProfileReq = async (req, res) => {
    const { id_user, photo_url } = req.body
    const missingFields = []

    if (!id_user) missingFields.push('id_user')
    if (!photo_url) missingFields.push('photo_url')

    if (missingFields.length > 0) {
        return res.status(400).json({
            error: 'Error submitting user, debes completar todos los campos.',
            missingFields
        })
    }

    try {
        const newProfile = await createProfile(id_user, photo_url)
        res.status(201).json({
            message: 'El perfil fue creado correctamente.',
            profile: newProfile
        })
    } catch (error) {
        console.error('Error creating profile', error)
        res.status(500).json({ error: error.message })
    }
}
