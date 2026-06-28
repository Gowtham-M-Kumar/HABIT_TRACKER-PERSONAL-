import './loadEnv.js'
import { createApp } from './app.js'
import { getConfig } from './env.js'
import { logEnvValidation } from './loadEnv.js'

const app = createApp()
const port = Number(process.env.PORT ?? 3001)

logEnvValidation()

app.listen(port, () => {
  const { frontendUrl, redirectUri } = getConfig()
  console.log(`API server running on http://localhost:${port}`)
  console.log(`Frontend URL: ${frontendUrl}`)
  console.log(`OAuth redirect: ${redirectUri}`)
})
