import { Router } from 'express'
import { createQuestionRequest, getQuestions, getQuestionByLevel } from './question.controller.js'

const routerQuestion = Router()

routerQuestion.post('/', createQuestionRequest)
routerQuestion.get('/', getQuestions)
routerQuestion.get('/level/:id_level', getQuestionByLevel)

export default routerQuestion
