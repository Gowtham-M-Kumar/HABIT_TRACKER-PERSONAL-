import '../server/loadEnv.js'
import serverless from 'serverless-http'
import { createApp } from '../server/app.js'

export default serverless(createApp())
