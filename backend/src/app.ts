import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import { env } from './config/env.js'
import { errorHandler } from './middleware/errorHandler.js'
import authRouter from './routes/auth.js'
import citiesRouter from './routes/cities.js'
import meRouter from './routes/me.js'
import placesRouter from './routes/places.js'

export function createApp() {
  const app = express()
  const corsOrigins = env.CORS_ORIGIN.split(',').map((origin) => origin.trim())

  app.use(helmet())
  app.use(cors({ origin: corsOrigins, credentials: true }))
  app.use(express.json({ limit: '1mb' }))

  app.get('/api/health', (_req, res) => res.json({ ok: true }))
  app.use('/api/auth', authRouter)
  app.use('/api/cities', citiesRouter)
  app.use('/api/places', placesRouter)
  app.use('/api/me', meRouter)
  app.use(errorHandler)

  return app
}
