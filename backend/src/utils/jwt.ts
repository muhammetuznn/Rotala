import jwt from 'jsonwebtoken'
import type { StringValue } from 'ms'
import { env } from '../config/env.js'

export type JwtPayload = {
  sub: string
  email: string
}

export function signToken(payload: JwtPayload) {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN as StringValue })
}

export function verifyToken(token: string) {
  return jwt.verify(token, env.JWT_SECRET) as JwtPayload
}
