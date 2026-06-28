import { config } from 'dotenv'
import { existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const rootEnvPath = resolve(__dirname, '../.env')
const serverEnvPath = resolve(__dirname, '.env')

if (existsSync(rootEnvPath)) {
  config({ path: rootEnvPath })
  console.log(`Loaded env from ${rootEnvPath}`)
} else if (existsSync(serverEnvPath)) {
  config({ path: serverEnvPath })
  console.log(`Loaded env from ${serverEnvPath}`)
} else {
  config()
  console.warn('No .env file found — using process environment only')
}

export function logEnvValidation(): boolean {
  const required = [
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'SESSION_SECRET',
  ] as const

  let allOk = true

  for (const name of required) {
    const value = process.env[name]
    if (value?.trim()) {
      console.log(`✓ ${name} loaded`)
    } else {
      console.error(`✗ ${name} missing`)
      allOk = false
    }
  }

  const redirectUri =
    process.env.GOOGLE_REDIRECT_URI ??
    `${(process.env.FRONTEND_URL ?? 'http://localhost:5173').replace(/\/$/, '')}/api/auth/callback`
  console.log(`  GOOGLE_REDIRECT_URI → ${redirectUri}`)

  if (!allOk) {
    console.error('\nAdd missing variables to .env in the project root (see .env.example)')
  }

  return allOk
}
