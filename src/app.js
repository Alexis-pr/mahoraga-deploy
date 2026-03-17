import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import cors from 'cors'
import routerQuestion from './modules/questions/question.route.js'
import routerUser from './modules/users/user.route.js'
import profileRouter from './modules/profiles/profile.route.js'
import interviewRouter from './modules/interview/interview.route.js'
import voiceRouter from './modules/voice/voice.route.js'

const app = express()
app.use(cors())
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))
// Debug middleware to log all incoming requests
app.use((req, res, next) => {
  if (req.originalUrl.includes('/voice/feedback')) {
    console.log('[DEBUG] Voice feedback request received');
    console.log('[DEBUG] Headers:', JSON.stringify(req.headers, null, 2));
    console.log('[DEBUG] Body before express.json():', req.body);
  }
  next();
})

app.use(express.static(path.join(__dirname, '..')))
app.use('/api/questions', routerQuestion)
app.use('/api/users', routerUser)
app.use('/api/profile', profileRouter)
app.use('/api/interview', interviewRouter)
app.use('/api/voice', voiceRouter)

app.get('/', (_req, res) => {
    res.sendFile(path.join(__dirname, '..', 'index.html'))
})

export default app
