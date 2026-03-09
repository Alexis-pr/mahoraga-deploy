import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import cors from 'cors'
import routerQuestion from './modules/questions/question.route.js'
import routerUser from './modules/users/user.route.js'
import profileRouter from './modules/profiles/profile.route.js'

const app = express()
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

app.use(express.json())
app.use(cors())
app.use(express.static(path.join(__dirname, '..')))
app.use('/questions', routerQuestion)
app.use('/users', routerUser)
app.use('/api/questions', routerQuestion)
app.use('/api/users', routerUser)
app.use('/profile', profileRouter)

app.get('/', (_req, res) => {
    res.sendFile(path.join(__dirname, '..', 'index.html'))
})

export default app
