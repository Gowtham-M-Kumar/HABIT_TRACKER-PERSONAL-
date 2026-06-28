import { useAuthStore } from '../store/authStore'
import { useHabitStore, type Habit } from '../store/habitStore'
import { useNotificationStore } from '../store/notificationStore'
import { useSyncStore, type SyncConflict } from '../store/syncStore'
import {
  createGoogleTask,
  deleteGoogleTask,
  listGoogleTasks,
  updateGoogleTask,
  type GoogleTaskDto,
} from './googleTasksApi'
import {
  habitSnapshot,
  habitToTaskPayload,
  normalizeHabit,
  remoteSnapshot,
  snapshotsEqual,
  taskToHabit,
  touchHabit,
} from '../utils/habitSync'
import { decodeTaskNotes } from '../../shared/taskMeta'
import { findHabitMatch } from '../utils/googleSyncMatching'

let debounceTimer: ReturnType<typeof setTimeout> | null = null
let syncInFlight = false
let syncQueued = false

function addNotification(title: string, message: string, kind: 'info' | 'success' | 'warning' | 'error' = 'info') {
  useNotificationStore.getState().addNotification({ title, message, kind })
}

function collectImportCandidates(remoteTasks: GoogleTaskDto[], habits: Habit[]): GoogleTaskDto[] {
  const knownGoogleIds = new Set(habits.map((habit) => habit.googleTaskId).filter(Boolean) as string[])
  const knownHabitIds = new Set(habits.map((habit) => habit.id))

  return remoteTasks.filter((task) => {
    if (task.deleted) return false
    const meta = decodeTaskNotes(task.notes)
    if (meta?.habitId && knownHabitIds.has(meta.habitId)) return false
    if (knownGoogleIds.has(task.id)) return false
    return true
  })
}

export function queueSync(_reason?: string, delayMs = 900): void {
  const { isAuthenticated } = useAuthStore.getState()
  const { googleTasksConnected, autoSync } = useSyncStore.getState()
  if (!isAuthenticated || !googleTasksConnected || !autoSync) return

  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    debounceTimer = null
    void runSync()
  }, delayMs)
}

export async function runSync(force = false): Promise<void> {
  const { isAuthenticated } = useAuthStore.getState()
  const { googleTasksConnected, autoSync, pendingConflict } = useSyncStore.getState()
  if (!isAuthenticated || !googleTasksConnected) return
  if (!force && !autoSync) return
  if (pendingConflict) return
  if (syncInFlight) {
    syncQueued = true
    return
  }

  syncInFlight = true
  useSyncStore.getState().setSyncing(true)
  useSyncStore.getState().setSyncError(null)

  try {
    const remoteTasks = await listGoogleTasks()
    const habits = useHabitStore.getState().habits
    const linkedRemote = remoteTasks.filter(
      (task) => !task.deleted && (decodeTaskNotes(task.notes) || habits.some((habit) => habit.googleTaskId === task.id)),
    )
    const importCandidates = collectImportCandidates(remoteTasks, habits)

    await reconcileFromRemote(linkedRemote, importCandidates)

    if (useSyncStore.getState().pendingConflict) return

    await pushLocalChanges(linkedRemote)
    useSyncStore.getState().setLastSyncAt(new Date().toISOString())
  } catch (err) {
    useSyncStore.getState().setSyncError(err instanceof Error ? err.message : 'Sync failed')
  } finally {
    syncInFlight = false
    useSyncStore.getState().setSyncing(false)
    if (syncQueued) {
      syncQueued = false
      queueSync('queued', 300)
    }
  }
}

async function reconcileFromRemote(remoteTasks: GoogleTaskDto[], importCandidates: GoogleTaskDto[]): Promise<void> {
  const habits = useHabitStore.getState().habits
  const byGoogleId = new Map(remoteTasks.map((task) => [task.id, task]))
  const updates: Habit[] = []
  let conflict: SyncConflict | null = null

  const syncPrefs = useSyncStore.getState()
  const { pendingDuplicateResolution, pendingDeletionResolution, pendingNewTaskImport, pendingImportReview, showTaskReviewModal, ignoredTaskIds, neverAskAgainTaskIds } = syncPrefs

  for (const habit of habits) {
    if (!habit.syncEnabled || !habit.googleTaskId) continue
    const remote = byGoogleId.get(habit.googleTaskId)
    if (!remote || remote.deleted) {
      if (syncPrefs.syncDeletedTasks && !pendingDeletionResolution && !pendingImportReview && !showTaskReviewModal && !pendingNewTaskImport && !pendingDuplicateResolution) {
        useSyncStore.getState().setPendingDeletionResolution({
          taskId: habit.googleTaskId,
          habitId: habit.id,
          habitName: habit.name,
          taskTitle: habit.name,
        })
      }
      continue
    }

    const localTime = new Date(habit.updatedAt).getTime()
    const meta = decodeTaskNotes(remote.notes)
    const remoteTime = new Date(meta?.updatedAt ?? remote.updated ?? 0).getTime()
    const localSnap = habitSnapshot(habit)
    const remoteSnap = remoteSnapshot(remote)

    if (snapshotsEqual(localSnap, remoteSnap)) continue

    if (localTime > remoteTime) continue
    if (remoteTime > localTime) {
      const merged = taskToHabit(remote, habit)
      if (merged) updates.push(merged)
      continue
    }

    conflict = {
      habitId: habit.id,
      habitName: habit.name,
      localUpdatedAt: habit.updatedAt,
      remoteUpdatedAt: meta?.updatedAt ?? remote.updated ?? habit.updatedAt,
      localSnapshot: localSnap,
      remoteSnapshot: remoteSnap,
    }
    break
  }

  if (conflict) {
    useSyncStore.getState().setPendingConflict(conflict)
    return
  }

  if (updates.length) {
    useHabitStore.getState().mergeHabitsFromSync(updates)
    for (const habit of updates) {
      if (habit.syncEnabled) {
        useHabitStore.getState().setTodayCompletion(habit.id, habit.completed)
      }
    }
  }

  if (importCandidates.length && !pendingImportReview && !showTaskReviewModal && !pendingNewTaskImport && !pendingDuplicateResolution && !pendingDeletionResolution) {
    const reviewCandidates = importCandidates.filter((task) => !ignoredTaskIds.includes(task.id) && !neverAskAgainTaskIds.includes(task.id))

    if (syncPrefs.askBeforeImporting && !syncPrefs.importNewTasksAutomatically && !syncPrefs.hasShownInitialReview) {
      useSyncStore.getState().setPendingImportReview({ tasks: reviewCandidates, source: 'initial' })
      useSyncStore.getState().setHasShownInitialReview(true)
      return
    }

    if (syncPrefs.askBeforeImporting && !syncPrefs.importNewTasksAutomatically && reviewCandidates.length) {
      useSyncStore.getState().setPendingNewTaskImport({ task: reviewCandidates[0] })
      return
    }

    if (syncPrefs.importNewTasksAutomatically) {
      void importSelectedGoogleTasks(reviewCandidates)
    }
  }
}

async function pushLocalChanges(remoteTasks: GoogleTaskDto[]): Promise<void> {
  const habits = useHabitStore.getState().habits.filter((habit) => habit.syncEnabled)
  const byGoogleId = new Map(remoteTasks.map((task) => [task.id, task]))
  const syncPrefs = useSyncStore.getState()

  for (const habit of habits) {
    const localTime = new Date(habit.updatedAt).getTime()

    if (habit.googleTaskId) {
      const remote = byGoogleId.get(habit.googleTaskId)
      if (remote?.deleted) {
        useHabitStore.getState().patchHabitSilent(habit.id, { googleTaskId: null })
        continue
      }

      const remoteTime = remote
        ? new Date(decodeTaskNotes(remote.notes)?.updatedAt ?? remote.updated ?? 0).getTime()
        : 0

      if (remote && localTime <= remoteTime && !snapshotsEqual(habitSnapshot(habit), remoteSnapshot(remote))) {
        continue
      }

      const payload = habitToTaskPayload(habit)
      if (!syncPrefs.syncCompletedTasks && habit.completed) {
        payload.status = 'needsAction'
      }

      await updateGoogleTask(habit.googleTaskId, payload)
      continue
    }

    const payload = habitToTaskPayload(habit)
    if (!syncPrefs.syncCompletedTasks && habit.completed) {
      payload.status = 'needsAction'
    }

    const created = await createGoogleTask(payload)
    useHabitStore.getState().patchHabitSilent(habit.id, { googleTaskId: created.id })
  }
}

export async function pushHabitNow(habit: Habit): Promise<void> {
  const { isAuthenticated } = useAuthStore.getState()
  const { googleTasksConnected, syncCompletedTasks } = useSyncStore.getState()
  if (!isAuthenticated || !googleTasksConnected || !habit.syncEnabled) return

  const payload = habitToTaskPayload(habit)
  if (!syncCompletedTasks && habit.completed) {
    payload.status = 'needsAction'
  }

  if (habit.googleTaskId) {
    await updateGoogleTask(habit.googleTaskId, payload)
  } else {
    const created = await createGoogleTask(payload)
    useHabitStore.getState().patchHabitSilent(habit.id, { googleTaskId: created.id })
  }
}

export async function deleteRemoteHabit(habit: Habit): Promise<void> {
  if (!habit.googleTaskId) return
  try {
    await deleteGoogleTask(habit.googleTaskId)
  } catch {
    // task may already be deleted remotely
  }
}

export function resolveConflict(choice: 'local' | 'remote'): void {
  const conflict = useSyncStore.getState().pendingConflict
  if (!conflict) return

  const habit = useHabitStore.getState().habits.find((entry) => entry.id === conflict.habitId)
  if (!habit) {
    useSyncStore.getState().setPendingConflict(null)
    return
  }

  if (choice === 'local') {
    useHabitStore.getState().patchHabitSilent(habit.id, touchHabit(habit, habitSnapshot(habit)))
    void pushHabitNow(useHabitStore.getState().habits.find((entry) => entry.id === habit.id)!)
  } else {
    useHabitStore.getState().patchHabitSilent(
      habit.id,
      touchHabit(habit, {
        name: conflict.remoteSnapshot.name,
        completed: conflict.remoteSnapshot.completed,
        goal: conflict.remoteSnapshot.goal,
        dueDate: conflict.remoteSnapshot.dueDate,
      }),
    )
  }

  useSyncStore.getState().setPendingConflict(null)
  queueSync('conflict-resolved', 400)
}

export async function importSelectedGoogleTasks(selectedTasks: GoogleTaskDto[]): Promise<void> {
  const queue = selectedTasks.filter((task) => !task.deleted)
  if (!queue.length) {
    useSyncStore.getState().setPendingImportReview(null)
    useSyncStore.getState().setShowTaskReviewModal(false)
    return
  }

  const state = useSyncStore.getState()
  const task = queue[0]
  const currentHabits = useHabitStore.getState().habits
  const duplicate = state.duplicateDetectionEnabled
    ? findHabitMatch(task.title ?? '', currentHabits, state.fuzzyMatchingSensitivity)
    : null

  if (duplicate) {
    state.setPendingDuplicateResolution({ task, existingHabit: duplicate })
    state.setPendingImportQueue(queue.slice(1))
    return
  }

  const imported = taskToHabit(task)
  if (!imported) {
    if (queue.length > 1) {
      await importSelectedGoogleTasks(queue.slice(1))
    }
    return
  }

  const habitToImport = normalizeHabit({
    id: `google-import-${task.id}`,
    name: imported.name,
    color: imported.color,
    goal: imported.goal,
    iconEmoji: imported.iconEmoji,
    createdAt: imported.createdAt,
    updatedAt: imported.updatedAt,
    completed: imported.completed,
    dueDate: imported.dueDate,
    googleTaskId: task.id,
    syncEnabled: true,
  })

  useHabitStore.getState().mergeHabitsFromSync([habitToImport])
  useHabitStore.getState().setTodayCompletion(habitToImport.id, habitToImport.completed)
  addNotification('Imported from Google Tasks', `“${habitToImport.name}” is now a habit.`, 'success')

  if (queue.length > 1) {
    await importSelectedGoogleTasks(queue.slice(1))
  } else {
    useSyncStore.getState().setPendingImportReview(null)
    useSyncStore.getState().setShowTaskReviewModal(false)
    useSyncStore.getState().setPendingImportQueue([])
  }
}

export async function resolvePendingDuplicate(choice: 'link' | 'new' | 'skip'): Promise<void> {
  const pending = useSyncStore.getState().pendingDuplicateResolution
  const queue = useSyncStore.getState().pendingImportQueue
  if (!pending) return

  const state = useSyncStore.getState()
  const { task, existingHabit } = pending

  if (choice === 'link') {
    useHabitStore.getState().patchHabitSilent(existingHabit.id, {
      googleTaskId: task.id,
      syncEnabled: true,
    })
    addNotification('Linked to existing habit', `“${existingHabit.name}” now syncs with Google Tasks.`, 'success')
  } else if (choice === 'new') {
    const imported = taskToHabit(task)
    if (imported) {
      const newHabit = normalizeHabit({
        id: `google-import-${task.id}-${Date.now()}`,
        name: imported.name,
        color: imported.color,
        goal: imported.goal,
        iconEmoji: imported.iconEmoji,
        createdAt: imported.createdAt,
        updatedAt: imported.updatedAt,
        completed: imported.completed,
        dueDate: imported.dueDate,
        googleTaskId: task.id,
        syncEnabled: true,
      })
      useHabitStore.getState().mergeHabitsFromSync([newHabit])
      useHabitStore.getState().setTodayCompletion(newHabit.id, newHabit.completed)
      addNotification('Imported as a new habit', `“${newHabit.name}” was added.`, 'success')
    }
  } else {
    state.addIgnoredTaskId(task.id)
    addNotification('Skipped import', `“${task.title ?? 'Untitled Task'}” was not imported.`, 'warning')
  }

  state.setPendingDuplicateResolution(null)
  if (queue.length) {
    await importSelectedGoogleTasks(queue)
  } else {
    state.setPendingImportReview(null)
    state.setShowTaskReviewModal(false)
    state.setPendingImportQueue([])
  }
}

export async function resolvePendingDeletion(choice: 'delete' | 'keep' | 'disconnect'): Promise<void> {
  const pending = useSyncStore.getState().pendingDeletionResolution
  if (!pending) return

  if (choice === 'delete') {
    useHabitStore.getState().deleteHabit(pending.habitId)
    addNotification('Habit removed', `The linked habit “${pending.habitName}” was deleted locally.`, 'warning')
  } else if (choice === 'disconnect') {
    useHabitStore.getState().patchHabitSilent(pending.habitId, { googleTaskId: null, syncEnabled: false })
    addNotification('Sync disconnected', `“${pending.habitName}” is no longer linked to Google Tasks.`, 'info')
  } else {
    addNotification('Deletion kept local', `“${pending.habitName}” was kept as a local habit.`, 'info')
  }

  useSyncStore.getState().setPendingDeletionResolution(null)
}

export async function resolvePendingNewTask(choice: 'import' | 'ignore' | 'never'): Promise<void> {
  const pending = useSyncStore.getState().pendingNewTaskImport
  if (!pending) return

  const task = pending.task
  if (choice === 'import') {
    await importSelectedGoogleTasks([task])
  } else if (choice === 'never') {
    useSyncStore.getState().addNeverAskAgainTaskId(task.id)
    addNotification('Future imports muted', `This task will be ignored on future checks.`, 'info')
  } else {
    useSyncStore.getState().addIgnoredTaskId(task.id)
    addNotification('Task ignored', `“${task.title ?? 'Untitled Task'}” was ignored.`, 'warning')
  }

  useSyncStore.getState().setPendingNewTaskImport(null)
}

export async function connectGoogleTasks(): Promise<void> {
  useSyncStore.getState().setGoogleTasksConnected(true)
  await runSync(true)
}
