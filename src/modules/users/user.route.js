import { Router } from 'express'
import { createUsersReq, getUsersReq, loginUserReq, processInterviewResultReq, getUserProgressReq, getUserTopicProgressDataReq } from './user.controller.js'

const routerUser = Router()

routerUser.post('/', createUsersReq)
routerUser.get('/', getUsersReq)
routerUser.post('/login', loginUserReq)
routerUser.post('/process-interview', processInterviewResultReq)
routerUser.get('/progress/:id_user', getUserProgressReq)
routerUser.get('/topic-progress/:id_user', getUserTopicProgressDataReq)

export default routerUser
