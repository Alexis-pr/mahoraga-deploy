import { consultationQuestion, createQuestion } from './question.service.js'

export const getQuestions = async (req, res) => {
    try {
        const data = await consultationQuestion()
        res.json(data)

    } catch (error) {
        res.status(500).json({ error: 'Error al obtener preguntas' })
    }
}


export const createQuestionRequest = async (req, res) => {
    const { id_topic, id_level, level_assign, translations } = req.body

    if (!id_topic || !id_level || !level_assign || !Array.isArray(translations) || translations.length === 0) {
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
            level_assign,
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
