import { createHmac, timingSafeEqual } from 'node:crypto'
import type { Response, Request } from 'express'
import { getConfig } from './env.js'

export interface GoogleSession {
  refreshToken: string
  email: string
  name: string
  picture?: string
}

const COOKIE_NAME = 'google_session'
const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000 // 30 days

function sign(payload: string, secret: string): string {
  return createHmac('sha256', secret).update(payload).digest('base64url')
}

export function encodeSession(session: GoogleSession): string {
  const { sessionSecret } = getConfig()
  const payload = Buffer.from(JSON.stringify(session)).toString('base64url')
  const signature = sign(payload, sessionSecret)
  return `${payload}.${signature}`
}

export function decodeSession(token: string | undefined): GoogleSession | null {
  if (!token) return null
  const [payload, signature] = token.split('.')
  if (!payload || !signature) return null

  const { sessionSecret } = getConfig()
  const expected = sign(payload, sessionSecret)
  try {
    const a = Buffer.from(signature)
    const b = Buffer.from(expected)
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null
    return JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as GoogleSession
  } catch {
    return null
  }
}

export function setSessionCookie(res: Response, session: GoogleSession): void {
  const { isProd } = getConfig()
  res.cookie(COOKIE_NAME, encodeSession(session), {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    maxAge: MAX_AGE_MS,
    path: '/',
  })
}

export function clearSessionCookie(res: Response): void {
  const { isProd } = getConfig()
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
  })
}

export function readSession(req: Request): GoogleSession | null {
  return decodeSession(req.cookies?.[COOKIE_NAME])
}
