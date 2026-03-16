import { Router } from 'express'
import { createInterviewReq, endInterviewReq } from './interniew.controller.js';


const interviewRouter = Router()

interviewRouter.post('/', createInterviewReq)
interviewRouter.put('/:id_session/end', endInterviewReq)

export default interviewRouter;
