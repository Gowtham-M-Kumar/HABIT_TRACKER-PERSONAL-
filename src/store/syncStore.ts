import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { GoogleTaskDto } from '../services/googleTasksApi'
import type { Habit } from './habitStore'

export interface SyncConflict {
  habitId: string
  habitName: string
  localUpdatedAt: string
  remoteUpdatedAt: string
  localSnapshot: {
    name: string
    completed: boolean
    goal: number
    dueDate: string | null
  }
  remoteSnapshot: {
    name: string
    completed: boolean
    goal: number
    dueDate: string | null
  }
}

export interface PendingImportReview {
  tasks: GoogleTaskDto[]
  source: 'initial' | 'remote'
}

export interface PendingDuplicateResolution {
  task: GoogleTaskDto
  existingHabit: Habit
}

export interface PendingDeletionResolution {
  taskId: string
  habitId: string
  habitName: string
  taskTitle: string
}

export interface PendingNewTaskImport {
  task: GoogleTaskDto
}

interface SyncState {
  googleTasksConnected: boolean
  autoSync: boolean
  importNewTasksAutomatically: boolean
  askBeforeImporting: boolean
  duplicateDetectionEnabled: boolean
  fuzzyMatchingSensitivity: number
  syncCompletedTasks: boolean
  syncDeletedTasks: boolean
  lastSyncAt: string | null
  isSyncing: boolean
  syncError: string | null
  pendingConflict: SyncConflict | null
  pendingImportReview: PendingImportReview | null
  showTaskReviewModal: boolean
  pendingDuplicateResolution: PendingDuplicateResolution | null
  pendingDeletionResolution: PendingDeletionResolution | null
  pendingNewTaskImport: PendingNewTaskImport | null
  pendingImportQueue: GoogleTaskDto[]
  hasShownInitialReview: boolean
  ignoredTaskIds: string[]
  neverAskAgainTaskIds: string[]
  setGoogleTasksConnected: (connected: boolean) => void
  setAutoSync: (enabled: boolean) => void
  setImportNewTasksAutomatically: (enabled: boolean) => void
  setAskBeforeImporting: (enabled: boolean) => void
  setDuplicateDetectionEnabled: (enabled: boolean) => void
  setFuzzyMatchingSensitivity: (value: number) => void
  setSyncCompletedTasks: (enabled: boolean) => void
  setSyncDeletedTasks: (enabled: boolean) => void
  setLastSyncAt: (iso: string | null) => void
  setSyncing: (syncing: boolean) => void
  setSyncError: (error: string | null) => void
  setPendingConflict: (conflict: SyncConflict | null) => void
  setPendingImportReview: (review: PendingImportReview | null) => void
  setShowTaskReviewModal: (show: boolean) => void
  setPendingDuplicateResolution: (value: PendingDuplicateResolution | null) => void
  setPendingDeletionResolution: (value: PendingDeletionResolution | null) => void
  setPendingNewTaskImport: (value: PendingNewTaskImport | null) => void
  setPendingImportQueue: (tasks: GoogleTaskDto[]) => void
  setHasShownInitialReview: (value: boolean) => void
  setIgnoredTaskIds: (ids: string[]) => void
  addIgnoredTaskId: (id: string) => void
  addNeverAskAgainTaskId: (id: string) => void
}

export const useSyncStore = create<SyncState>()(
  persist(
    (set) => ({
      googleTasksConnected: false,
      autoSync: true,
      importNewTasksAutomatically: false,
      askBeforeImporting: true,
      duplicateDetectionEnabled: true,
      fuzzyMatchingSensitivity: 0.65,
      syncCompletedTasks: true,
      syncDeletedTasks: true,
      lastSyncAt: null,
      isSyncing: false,
      syncError: null,
      pendingConflict: null,
      pendingImportReview: null,
      showTaskReviewModal: false,
      pendingDuplicateResolution: null,
      pendingDeletionResolution: null,
      pendingNewTaskImport: null,
      pendingImportQueue: [],
      hasShownInitialReview: false,
      ignoredTaskIds: [],
      neverAskAgainTaskIds: [],

      setGoogleTasksConnected: (googleTasksConnected) => set({ googleTasksConnected }),
      setAutoSync: (autoSync) => set({ autoSync }),
      setImportNewTasksAutomatically: (importNewTasksAutomatically) => set({ importNewTasksAutomatically }),
      setAskBeforeImporting: (askBeforeImporting) => set({ askBeforeImporting }),
      setDuplicateDetectionEnabled: (duplicateDetectionEnabled) => set({ duplicateDetectionEnabled }),
      setFuzzyMatchingSensitivity: (fuzzyMatchingSensitivity) => set({ fuzzyMatchingSensitivity }),
      setSyncCompletedTasks: (syncCompletedTasks) => set({ syncCompletedTasks }),
      setSyncDeletedTasks: (syncDeletedTasks) => set({ syncDeletedTasks }),
      setLastSyncAt: (lastSyncAt) => set({ lastSyncAt }),
      setSyncing: (isSyncing) => set({ isSyncing }),
      setSyncError: (syncError) => set({ syncError }),
      setPendingConflict: (pendingConflict) => set({ pendingConflict }),
      setPendingImportReview: (pendingImportReview) => set({ pendingImportReview }),
      setShowTaskReviewModal: (showTaskReviewModal) => set({ showTaskReviewModal }),
      setPendingDuplicateResolution: (pendingDuplicateResolution) => set({ pendingDuplicateResolution }),
      setPendingDeletionResolution: (pendingDeletionResolution) => set({ pendingDeletionResolution }),
      setPendingNewTaskImport: (pendingNewTaskImport) => set({ pendingNewTaskImport }),
      setPendingImportQueue: (pendingImportQueue) => set({ pendingImportQueue }),
      setHasShownInitialReview: (hasShownInitialReview) => set({ hasShownInitialReview }),
      setIgnoredTaskIds: (ignoredTaskIds) => set({ ignoredTaskIds }),
      addIgnoredTaskId: (id) => set((state) => ({ ignoredTaskIds: state.ignoredTaskIds.includes(id) ? state.ignoredTaskIds : [...state.ignoredTaskIds, id] })),
      addNeverAskAgainTaskId: (id) => set((state) => ({ neverAskAgainTaskIds: state.neverAskAgainTaskIds.includes(id) ? state.neverAskAgainTaskIds : [...state.neverAskAgainTaskIds, id] })),
    }),
    {
      name: 'habit-tracker-sync',
      partialize: (state) => ({
        googleTasksConnected: state.googleTasksConnected,
        autoSync: state.autoSync,
        importNewTasksAutomatically: state.importNewTasksAutomatically,
        askBeforeImporting: state.askBeforeImporting,
        duplicateDetectionEnabled: state.duplicateDetectionEnabled,
        fuzzyMatchingSensitivity: state.fuzzyMatchingSensitivity,
        syncCompletedTasks: state.syncCompletedTasks,
        syncDeletedTasks: state.syncDeletedTasks,
        lastSyncAt: state.lastSyncAt,
        hasShownInitialReview: state.hasShownInitialReview,
        ignoredTaskIds: state.ignoredTaskIds,
        neverAskAgainTaskIds: state.neverAskAgainTaskIds,
      }),
    },
  ),
)

export function disconnectGoogleTasks(): void {
  useSyncStore.getState().setGoogleTasksConnected(false)
  useSyncStore.getState().setSyncError(null)
  useSyncStore.getState().setPendingImportReview(null)
  useSyncStore.getState().setShowTaskReviewModal(false)
  useSyncStore.getState().setPendingDuplicateResolution(null)
  useSyncStore.getState().setPendingDeletionResolution(null)
  useSyncStore.getState().setPendingNewTaskImport(null)
  useSyncStore.getState().setPendingImportQueue([])
}
