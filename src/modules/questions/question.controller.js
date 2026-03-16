import {
    consultationQuestion,
    createQuestion,
    getInterviewQuestions as getInterviewQuestionsService,
    getQuestionByLevel as getQuestionByLevelService,
    updateQuestion as updateQuestionService,
    newQuestionAnswered,
    createQuestionInstances
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

export const updateQuestionRequest = async (req, res) => {
    const { id_question } = req.params
    const { id_topic, id_level, translations } = req.body

    if (!id_question) {
        return res.status(400).json({ error: 'Debes indicar id_question en la ruta.' })
    }

    if (!id_topic || !id_level || !Array.isArray(translations) || translations.length === 0) {
        return res.status(400).json({
            error: 'Debes enviar id_topic, id_level y translations (array no vacio).'
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
        const updatedQuestion = await updateQuestionService(
            id_question,
            id_topic,
            id_level,
            translations
        )
        res.status(200).json({
            message: 'The question was updated correctly.',
            ...updatedQuestion
        })
    } catch (error) {
        console.error('Error al actualizar la pregunta:', error)
        res.status(500).json({ error: error.message })
    }
}

export const getQuestionByLevel = async (req, res) => {
    const { id_level } = req.params
    const { topic: id_topic, id_language } = req.query

    if (!id_level) {
        return res.status(400).json({ error: 'Debes indicar id_level en la ruta.' })
    }

    try {
        const data = await getQuestionByLevelService(id_level, id_topic, id_language)
        res.json(data)
    } catch (error) {
        console.error('Error al obtener preguntas por nivel:', error)
        res.status(500).json({
            error: 'Error al obtener las preguntas por nivel.'
        })
    }
}

export const getInterviewQuestions = async (req, res) => {
    const {
        level,
        language,
        id_user,
        technology = '',
        topic = '',
        limit = '5'
    } = req.query

    try {
        const data = await getInterviewQuestionsService({
            id_level: level ? Number(level) : null,
            id_language: language ? Number(language) : null,
            id_user: id_user ? String(id_user) : null,
            technology,
            topic,
            limit: Number(limit) || 5
        })

        res.json(data)
    } catch (error) {
        console.error('Error al obtener preguntas para interview:', error)
        res.status(500).json({
            error: 'Error al obtener preguntas de interview.'
        })
    }
}

export const newInterviewQuestionReq = async (req, res) => {
    const { id_session, id_questions } = req.body
    const missingFields = []

    console.log('newInterviewQuestionReq body', req.body);

    if (!id_session) missingFields.push('id_session')
    if (!Array.isArray(id_questions) || !id_questions.length) missingFields.push('id_questions')

    if (missingFields.length > 0) {
        return res.status(400).json({
            error: 'Error submitting question instance, debes completar todos los campos.',
            missingFields
        })
    }

    try {
        const numericIds = id_questions
            .map((value) => Number(value))
            .filter((value) => Number.isInteger(value) && value > 0)

        if (!numericIds.length) {
            return res.status(400).json({
                error: 'No se enviaron preguntas válidas para crear las instancias.'
            })
        }

        const stored = await createQuestionInstances(id_session, numericIds)

        res.status(201).json({
            message: 'La question instance se crea correctamente.',
            created: stored
        })
    } catch (error) {
        console.error('Error creating question instance', error)
        res.status(500).json({ error: error.message })
    }
}

export const newQuestionAnsweredReq = async (req, res) =>{
    console.log('[answered] incoming body', req.body)

    const {
        id_user,
        id_question_instance,
        answer,
        score,
        feedback = 'Sin feedback',
        answered_at
    } = req.body
    const missingFields = [];

    if (!id_user) missingFields.push('id_user')
    if (!id_question_instance) missingFields.push('id_question_instance')
    if (!answer) missingFields.push('answer')
    if (score === undefined || score === null) missingFields.push('score')
    if (!answered_at) missingFields.push('answered_at')

    if (missingFields.length > 0) {
        return res.status(400).json({
            error: 'Error submitting question answered, debes completar todos los campos.',
            missingFields
        })
    }
    try{
        const safeFeedback = (feedback ?? '').toString().trim() || 'Sin feedback'
        const newAnswered = await newQuestionAnswered(
            id_user,
            id_question_instance,
            answer,
            score,
            safeFeedback,
            answered_at
        )
        res.status(201).json({
            message: `the new answered question was created `,
            questionanswered: newAnswered
        })
    }catch(error ) {
        console.error(`Error , creating de new answered question`, error)
        res.status(500).json({error: error.message})
    }
}
