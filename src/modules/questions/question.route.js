import { Router } from 'express'
import {
  createQuestionRequest,
  getInterviewQuestions,
  getQuestions,
  getQuestionByLevel,
  updateQuestionRequest,
  newInterviewQuestionReq,
  newQuestionAnsweredReq
} from './question.controller.js'

const routerQuestion = Router()

routerQuestion.post('/', createQuestionRequest)
routerQuestion.get('/', getQuestions)
routerQuestion.get('/interview', getInterviewQuestions)
routerQuestion.get('/level/:id_level', getQuestionByLevel)
routerQuestion.put('/:id_question', updateQuestionRequest)
routerQuestion.post('/instance', newInterviewQuestionReq)
routerQuestion.post('/answered', newQuestionAnsweredReq)

export default routerQuestion
