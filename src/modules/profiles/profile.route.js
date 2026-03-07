import { Router } from 'express'
import { createProfileReq } from './profile.controller.js'

const profileRouter = Router()

profileRouter.post('/', createProfileReq)

export default profileRouter;
