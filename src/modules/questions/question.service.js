import {
  consultationQuestion as consultationQuestionRepo,
  createQuestion as createQuestionRepo,
  getInterviewQuestions as getInterviewQuestionsRepo,
  updateQuestion as updateQuestionRepo,
  getQuestionByLevel as getQuestionByLevelRepo,
  newInterviewQuestion as newInterviewQuestionRepo,
  newQuestionAnswered as newQuestionAnsweredRepo,
  createQuestionInstances as createQuestionInstancesRepo
} from './question.repository.js'

export const consultationQuestion = async () => consultationQuestionRepo()

export const createQuestion = async (payload) => createQuestionRepo(payload)

export const getInterviewQuestions = async (filters) => getInterviewQuestionsRepo(filters)

export const updateQuestion = async (id_question, id_topic, id_level, translations) => {
  return updateQuestionRepo(id_question, id_topic, id_level, translations)}

export const getQuestionByLevel = async (id_level, id_topic, id_language) =>
  getQuestionByLevelRepo(id_level, id_topic, id_language)

export const newInterviewQuestion = async (id_session, id_question, order_num) =>{
  return newInterviewQuestionRepo(id_session, id_question, order_num)
}

export const newQuestionAnswered = async(id_user, id_question_instance, answer, score, feedback, answered_at) => {
  return newQuestionAnsweredRepo(id_user, id_question_instance, answer, score, feedback, answered_at)
}

export const createQuestionInstances = async (id_session, id_questions) => {
  return createQuestionInstancesRepo(id_session, id_questions)
}
