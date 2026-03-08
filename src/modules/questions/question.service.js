import {
  consultationQuestion as consultationQuestionRepo,
  createQuestion as createQuestionRepo,
  getInterviewQuestions as getInterviewQuestionsRepo,
  updateQuestion as updateQuestionRepo,
  getQuestionByLevel as getQuestionByLevelRepo
} from './question.repository.js'

export const consultationQuestion = async () => consultationQuestionRepo()

export const createQuestion = async (payload) => createQuestionRepo(payload)

export const getInterviewQuestions = async (filters) => getInterviewQuestionsRepo(filters)

export const updateQuestion = async (id_question, id_topic, id_level, translations) => {
  return updateQuestionRepo(id_question, id_topic, id_level, translations)}

export const getQuestionByLevel = async (id_level) => getQuestionByLevelRepo(id_level)
