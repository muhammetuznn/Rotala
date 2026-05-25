import type { NextFunction, Request, Response } from 'express'
import { User } from '../models/User.js'
import { HttpError } from '../utils/httpError.js'
import { verifyToken } from '../utils/jwt.js'

export type AuthenticatedRequest = Request & {
  user?: {
    id: string
    email: string
    displayName: string
  }
}

export async function requireAuth(req: AuthenticatedRequest, _res: Response, next: NextFunction) {
  try {
    const header = req.header('authorization')
    const [scheme, token] = header?.split(' ') ?? []

    if (scheme !== 'Bearer' || !token) {
      throw new HttpError(401, 'Oturum gerekli.')
    }

    const payload = verifyToken(token)
    const user = await User.findById(payload.sub).select('email displayName').lean()

    if (!user) {
      throw new HttpError(401, 'Kullanıcı bulunamadı.')
    }

    req.user = {
      id: user._id.toString(),
      email: user.email,
      displayName: user.displayName,
    }

    next()
  } catch (error) {
    next(error instanceof HttpError ? error : new HttpError(401, 'Geçersiz oturum.'))
  }
}
