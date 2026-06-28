function normalizeOrigin(value: string | undefined): string {
  if (!value) return ''
  return value.trim().replace(/\/$/, '')
}

function parseAllowedOrigins(value: string | undefined): string[] {
  if (!value) return []
  return value
    .split(',')
    .map((entry) => normalizeOrigin(entry))
    .filter(Boolean)
}

export function getConfig() {
  const isProd = process.env.NODE_ENV === 'production'
  const frontendUrl = normalizeOrigin(process.env.FRONTEND_URL) || 'http://localhost:5173'
  const redirectUri = normalizeOrigin(process.env.GOOGLE_REDIRECT_URI) || `${frontendUrl}/api/auth/callback`

  return {
    frontendUrl,
    redirectUri,
    clientId: process.env.GOOGLE_CLIENT_ID?.trim() ?? '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET?.trim() ?? '',
    sessionSecret: process.env.SESSION_SECRET?.trim() ?? (isProd ? '' : 'dev-only-change-me-in-production'),
    isProd,
    allowedOrigins: parseAllowedOrigins(process.env.ALLOWED_ORIGINS).concat(frontendUrl),
  }
}

export function assertGoogleConfigured(): void {
  const { clientId, clientSecret, sessionSecret, isProd } = getConfig()
  if (!clientId || !clientSecret) {
    throw new Error('Google OAuth is not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.')
  }

  if (isProd && !sessionSecret) {
    throw new Error('SESSION_SECRET is required in production.')
  }
}
