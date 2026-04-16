import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import connectDB from './config/db.js'
import authRoutes from './routes/authRoutes.js'
import songRoutes from './routes/songRoutes.js'
import playlistRoutes from './routes/playlistRoutes.js'
import artistRoutes from './routes/artistRoutes.js'
import historyRoutes from './routes/historyRoutes.js'
import recommendRoutes from './routes/recommendRoutes.js'

const app = express()
const PORT = Number(process.env.PORT) || 5000

import cors from 'cors'

const allowedOrigins = [
  'http://localhost:5173',
  process.env.CLIENT_URL, // ✅ production frontend
]

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (mobile apps, curl, etc.)
      if (!origin) return callback(null, true)

      if (allowedOrigins.includes(origin)) {
        return callback(null, true)
      } else {
        return callback(new Error('Not allowed by CORS'))
      }
    },
    credentials: true,
  })
)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'reverberate-api' })
})

app.use('/api/auth',            authRoutes)
app.use('/api/songs',           songRoutes)
app.use('/api/playlists',       playlistRoutes)
app.use('/api/artists',         artistRoutes)
app.use('/api/history',         historyRoutes)
app.use('/api/recommendations', recommendRoutes) // ← fixed: was /api/recommend

// Global error handler
app.use((err, _req, res, _next) => {
  console.error('[server] Unhandled error:', err)
  res.status(500).json({ 
    message: err.message || 'Internal server error' 
  })
})

async function start() {
  await connectDB()
  app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`)
  })
}

start().catch((err) => {
  console.error('[server] Failed to start:', err)
  process.exit(1)
})