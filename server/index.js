

import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import contactRouter from './routes/contact.js'

// --- App setup
const app = express()

// If your frontend runs on a different origin in dev, adjust this list
const allowedOrigins = [
  'http://localhost:5173', // Vite dev server
  process.env.FRONTEND_ORIGIN || ''
].filter(Boolean)

app.use(cors({
  origin: (origin, cb) => {
    // Allow same-origin or no-origin (curl, Postman)
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true)
    return cb(null, true) // loosen CORS for now; tighten later if needed
  },
  methods: ['POST', 'GET', 'OPTIONS'],
}))

app.use(express.json())

// --- Health check
app.get('/api/health', (_req, res) => {
  res.json({ ok: true, env: process.env.NODE_ENV || 'development' })
})

// --- Routes
app.use('/api/contact', contactRouter)

// --- 404 handler (API only)
app.use('/api', (_req, res) => {
  res.status(404).json({ ok: false, error: 'Not Found' })
})

// --- Error handler
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error('[API ERROR]', err)
  res.status(500).json({ ok: false, error: 'Internal Server Error' })
})

// --- Start server
const PORT = Number(process.env.PORT) || 3001
app.listen(PORT, () => {
  console.log(`[API] listening on http://localhost:${PORT}`)
})