export interface GoogleTaskDto {
  id: string
  title?: string
  notes?: string
  status?: 'needsAction' | 'completed'
  due?: string
  updated?: string
  deleted?: boolean
}

async function parseJson<T>(res: Response): Promise<T> {
  const data = (await res.json()) as T & { error?: string }
  if (!res.ok) throw new Error(data.error ?? `Request failed (${res.status})`)
  return data
}

export async function listGoogleTasks(): Promise<GoogleTaskDto[]> {
  const res = await fetch('/api/tasks/list', { credentials: 'include' })
  const data = await parseJson<{ tasks: GoogleTaskDto[] }>(res)
  return data.tasks ?? []
}

export async function createGoogleTask(body: Record<string, unknown>): Promise<GoogleTaskDto> {
  const res = await fetch('/api/tasks', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = await parseJson<{ task: GoogleTaskDto }>(res)
  return data.task
}

export async function updateGoogleTask(
  taskId: string,
  body: Record<string, unknown>,
): Promise<GoogleTaskDto> {
  const res = await fetch(`/api/tasks/${encodeURIComponent(taskId)}`, {
    method: 'PATCH',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = await parseJson<{ task: GoogleTaskDto }>(res)
  return data.task
}

export async function deleteGoogleTask(taskId: string): Promise<void> {
  const res = await fetch(`/api/tasks/${encodeURIComponent(taskId)}`, {
    method: 'DELETE',
    credentials: 'include',
  })
  await parseJson<{ ok: boolean }>(res)
}
