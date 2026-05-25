import bcrypt from 'bcryptjs'
import { Router } from 'express'
import { z } from 'zod'
import { requireAuth, type AuthenticatedRequest } from '../middleware/auth.js'
import { User } from '../models/User.js'
import { HttpError } from '../utils/httpError.js'
import { signToken } from '../utils/jwt.js'

const router = Router()

const credentialsSchema = z.object({
  email: z.email().trim().toLowerCase(),
  password: z.string().min(6),
  displayName: z.string().trim().min(2).max(80).optional(),
})

function toAuthResponse(user: { _id: unknown; email: string; displayName: string }) {
  const id = String(user._id)
  return {
    token: signToken({ sub: id, email: user.email }),
    user: { id, email: user.email, displayName: user.displayName },
  }
}

router.post('/register', async (req, res, next) => {
  try {
    const input = credentialsSchema.parse(req.body)
    const existing = await User.findOne({ email: input.email }).lean()

    if (existing) {
      throw new HttpError(409, 'Bu e-posta ile kayıt var.')
    }

    const passwordHash = await bcrypt.hash(input.password, 12)
    const displayName = input.displayName || input.email.split('@')[0]
    const user = await User.create({ email: input.email, passwordHash, displayName })

    res.status(201).json(toAuthResponse(user))
  } catch (error) {
    next(error)
  }
})

router.post('/login', async (req, res, next) => {
  try {
    const input = credentialsSchema.pick({ email: true, password: true }).parse(req.body)
    const user = await User.findOne({ email: input.email })

    if (!user || !(await bcrypt.compare(input.password, user.passwordHash))) {
      throw new HttpError(401, 'E-posta veya şifre hatalı.')
    }

    res.json(toAuthResponse(user))
  } catch (error) {
    next(error)
  }
})

router.get('/me', requireAuth, (req: AuthenticatedRequest, res) => {
  res.json({ user: req.user })
})

export default router
