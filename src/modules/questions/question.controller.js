import {
  consultationQuestion,
  createQuestion,
  getQuestionByLevel as getQuestionByLevelService
} from './question.service.js'

export const getQuestions = async (req, res) => {
    try {
        const data = await consultationQuestion()
        res.json(data)

    } catch (error) {
        res.status(500).json({ error: 'Error getting questions' })
    }
}

export const createQuestionRequest = async (req, res) => {
    const { id_topic, id_level, translations } = req.body

    if (!id_topic || !id_level || !Array.isArray(translations) || translations.length === 0) {
        return res.status(400).json({
            error: 'Debes enviar id_topic, id_level, level_assign y translations (array no vacio).'
        })
    }
        const hasInvalidTranslation = translations.some(
        (item) => !item.id_language || !item.question_text
    )
    if (hasInvalidTranslation) {
        return res.status(400).json({
            error: 'Cada traduccion debe incluir id_language y question_text.'
        })
    }
    try {
        const newQuestion = await createQuestion({
            id_topic,
            id_level,
            translations
        })
        res.status(201).json({
            message: 'The question was created correctly.',
            ...newQuestion
        })
    } catch (error) {
        console.error('Error al crear la pregunta:', error)
        res.status(500).json({ error: error.message });
    }
};

export const getQuestionByLevel = async (req, res) => {
    const { id_level } = req.params

    if (!id_level) {
        return res.status(400).json({ error: 'Debes indicar id_level en la ruta.' })
    }

    try {
        const data = await getQuestionByLevelService(id_level)
        res.json(data)
    } catch (error) {
        console.error('Error al obtener preguntas por nivel:', error)
        res.status(500).json({
            error: 'Error al obtener las preguntas por nivel.'
        })
    }
}
