import dotenv from 'dotenv'
import { z } from 'zod'

dotenv.config()

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(4000),
  MONGODB_URI: z.string().min(1).optional(),
  JWT_SECRET: z.string().min(16, 'JWT_SECRET en az 16 karakter olmalı.'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
})

const parsed = envSchema.parse(process.env)

if (parsed.NODE_ENV === 'production' && !parsed.MONGODB_URI) {
  throw new Error('MONGODB_URI production ortamında zorunludur.')
}

export const env = {
  ...parsed,
  MONGODB_URI: parsed.MONGODB_URI ?? 'mongodb://127.0.0.1:27017/rotala',
}
