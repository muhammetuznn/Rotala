import type { ErrorRequestHandler } from 'express'
import { ZodError } from 'zod'
import { HttpError } from '../utils/httpError.js'

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  void _next

  if (error instanceof ZodError) {
    res.status(400).json({ message: 'Geçersiz veri.', issues: error.issues })
    return
  }

  if (error instanceof HttpError) {
    res.status(error.status).json({ message: error.message })
    return
  }

  if (error?.code === 11000) {
    res.status(409).json({ message: 'Bu kayıt zaten var.' })
    return
  }

  console.error(error)
  res.status(500).json({ message: 'Sunucu hatası.' })
}
