import { Router } from 'express'
import { voiceFeedbackReq } from './voice.controller.js'

const voiceRouter = Router()

voiceRouter.post('/feedback', voiceFeedbackReq)

export default voiceRouter
