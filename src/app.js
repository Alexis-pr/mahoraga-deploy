import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import cors from 'cors'
import questionRoutes from './modules/questions/question.route.js'
import userRoutes from './modules/users/user.route.js'

const app = express()
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

app.use(express.json())
app.use(cors())
app.use(express.static(path.join(__dirname, '..')))
app.use('/questions', questionRoutes)
app.use('/users', userRoutes)
app.use('/api/questions', questionRoutes)
app.use('/api/users', userRoutes)

app.get('/', (_req, res) => {
    res.sendFile(path.join(__dirname, '..', 'index.html'))
})

export default app
