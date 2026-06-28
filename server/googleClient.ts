import { OAuth2Client } from 'google-auth-library'
import { assertGoogleConfigured, getConfig } from './env.js'
import type { GoogleSession } from './session.js'

export function createOAuthClient() {
  assertGoogleConfigured()
  const { clientId, clientSecret, redirectUri } = getConfig()
  return new OAuth2Client(clientId, clientSecret, redirectUri)
}

export const GOOGLE_SCOPES = [
  'openid',
  'email',
  'profile',
  'https://www.googleapis.com/auth/tasks',
]

export function getAuthUrl(): string {
  const client = createOAuthClient()
  return client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: GOOGLE_SCOPES,
    include_granted_scopes: true,
  })
}

export async function exchangeCodeForSession(code: string): Promise<GoogleSession> {
  const client = createOAuthClient()
  const { tokens } = await client.getToken(code)
  if (!tokens.refresh_token) {
    throw new Error('Google did not return a refresh token. Try signing out of Google and signing in again.')
  }

  client.setCredentials(tokens)
  const ticket = await client.verifyIdToken({
    idToken: tokens.id_token!,
    audience: getConfig().clientId,
  })
  const payload = ticket.getPayload()
  if (!payload?.email) throw new Error('Unable to read Google profile email.')

  return {
    refreshToken: tokens.refresh_token,
    email: payload.email,
    name: payload.name ?? payload.email,
    picture: payload.picture,
  }
}

export async function getAccessToken(session: GoogleSession): Promise<string> {
  const client = createOAuthClient()
  client.setCredentials({ refresh_token: session.refreshToken })
  const { token } = await client.getAccessToken()
  if (!token) throw new Error('Unable to refresh Google access token.')
  return token
}

export async function googleFetch<T>(
  session: GoogleSession,
  path: string,
  init?: RequestInit,
): Promise<T> {
  const token = await getAccessToken(session)
  const res = await fetch(`https://tasks.googleapis.com/tasks/v1${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Google Tasks API ${res.status}: ${body}`)
  }

  if (res.status === 204) return undefined as T
  return (await res.json()) as T
}
