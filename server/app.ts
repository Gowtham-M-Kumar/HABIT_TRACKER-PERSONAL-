import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { getConfig } from './env.js'
import { exchangeCodeForSession, getAuthUrl, googleFetch } from './googleClient.js'
import { clearSessionCookie, readSession, setSessionCookie, type GoogleSession } from './session.js'

interface GoogleTask {
  id: string
  title?: string
  notes?: string
  status?: 'needsAction' | 'completed'
  due?: string
  updated?: string
  deleted?: boolean
  hidden?: boolean
}

interface TaskListResponse {
  items?: GoogleTask[]
  nextPageToken?: string
}

type AuthedRequest = express.Request & { googleSession: GoogleSession }

function getGoogleSession(req: express.Request): GoogleSession {
  return (req as AuthedRequest).googleSession
}

export function createApp() {
  const app = express()
  const { frontendUrl, allowedOrigins, isProd } = getConfig()

  app.disable('x-powered-by')
  app.set('trust proxy', 1)
  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin) {
          callback(null, true)
          return
        }

        const isAllowed = allowedOrigins.includes(origin) || (!isProd && origin.startsWith('http://localhost'))
        if (isAllowed) {
          callback(null, true)
          return
        }

        callback(new Error(`Origin not allowed: ${origin}`))
      },
      credentials: true,
    }),
  )
  app.use(cookieParser())
  app.use(express.json())
  app.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff')
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
    next()
  })

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true })
  })

  app.get('/api/auth/google', (_req, res) => {
    try {
      res.redirect(getAuthUrl())
    } catch (err) {
      res.status(503).json({ error: err instanceof Error ? err.message : 'OAuth not configured' })
    }
  })

  app.get('/api/auth/callback', async (req, res) => {
    try {
      const code = req.query.code as string | undefined
      if (!code) throw new Error('Missing authorization code.')
      const session = await exchangeCodeForSession(code)
      setSessionCookie(res, session)
      res.redirect(`${frontendUrl}?google_auth=success`)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Authentication failed'
      res.redirect(`${frontendUrl}?google_auth=error&message=${encodeURIComponent(message)}`)
    }
  })

  app.get('/api/auth/me', (req, res) => {
    const session = readSession(req)
    if (!session) {
      res.status(401).json({ authenticated: false })
      return
    }
    res.json({
      authenticated: true,
      user: {
        email: session.email,
        name: session.name,
        picture: session.picture,
      },
    })
  })

  app.post('/api/auth/logout', (_req, res) => {
    clearSessionCookie(res)
    res.json({ ok: true })
  })

  app.use('/api/tasks', (req, res, next) => {
    const session = readSession(req)
    if (!session) {
      res.status(401).json({ error: 'Not authenticated' })
      return
    }
    ;(req as AuthedRequest).googleSession = session
    next()
  })

  app.get('/api/tasks/list', async (req, res) => {
    try {
      const session = getGoogleSession(req)
      const allTasks: GoogleTask[] = []
      let pageToken: string | undefined

      do {
        const query = new URLSearchParams({
          showCompleted: 'true',
          showHidden: 'true',
          maxResults: '100',
        })
        if (pageToken) query.set('pageToken', pageToken)
        const data = await googleFetch<TaskListResponse>(
          session,
          `/lists/@default/tasks?${query.toString()}`,
        )
        if (data.items) allTasks.push(...data.items)
        pageToken = data.nextPageToken
      } while (pageToken)

      res.json({ tasks: allTasks })
    } catch (err) {
      res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to list tasks' })
    }
  })

  app.post('/api/tasks', async (req, res) => {
    try {
      const session = getGoogleSession(req)
      const task = await googleFetch<GoogleTask>(session, '/lists/@default/tasks', {
        method: 'POST',
        body: JSON.stringify(req.body),
      })
      res.json({ task })
    } catch (err) {
      res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to create task' })
    }
  })

  app.patch('/api/tasks/:taskId', async (req, res) => {
    try {
      const session = getGoogleSession(req)
      const task = await googleFetch<GoogleTask>(
        session,
        `/lists/@default/tasks/${encodeURIComponent(req.params.taskId)}`,
        {
          method: 'PATCH',
          body: JSON.stringify(req.body),
        },
      )
      res.json({ task })
    } catch (err) {
      res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to update task' })
    }
  })

  app.delete('/api/tasks/:taskId', async (req, res) => {
    try {
      const session = getGoogleSession(req)
      await googleFetch<void>(
        session,
        `/lists/@default/tasks/${encodeURIComponent(req.params.taskId)}`,
        { method: 'DELETE' },
      )
      res.json({ ok: true })
    } catch (err) {
      res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to delete task' })
    }
  })

  return app
}
