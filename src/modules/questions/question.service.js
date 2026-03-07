import {
  consultationQuestion as consultationQuestionRepo,
  createQuestion as createQuestionRepo,
  updateQuestion as updateQuestionRepo
} from './question.repository.js'

export const consultationQuestion = async () => consultationQuestionRepo()

export const createQuestion = async (payload) => createQuestionRepo(payload)

export const updateQuestion = async (id_question, id_topic, id_level, level_assign, translations) => {
  return updateQuestionRepo(id_question, id_topic, id_level, level_assign, translations)
}
