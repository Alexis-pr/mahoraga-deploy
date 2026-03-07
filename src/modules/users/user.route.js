import { Router } from 'express'
import { createUsersReq, getUsersReq, loginUserReq } from './user.controller.js'

const routerUser = Router()

routerUser.post('/', createUsersReq)
routerUser.get('/', getUsersReq)
routerUser.post('/login', loginUserReq)

export default routerUser
