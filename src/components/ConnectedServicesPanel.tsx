import React from 'react'
import { Check, RefreshCw, Unplug } from 'lucide-react'
import { useAuthStore, startGoogleLogin } from '../store/authStore'
import { useSyncStore, disconnectGoogleTasks } from '../store/syncStore'
import {
  connectGoogleTasks,
  runSync,
} from '../services/syncEngine'

export const ConnectedServicesPanel: React.FC = () => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const {
    googleTasksConnected,
    autoSync,
    importNewTasksAutomatically,
    askBeforeImporting,
    duplicateDetectionEnabled,
    fuzzyMatchingSensitivity,
    syncCompletedTasks,
    syncDeletedTasks,
    lastSyncAt,
    isSyncing,
    syncError,
    setAutoSync,
    setImportNewTasksAutomatically,
    setAskBeforeImporting,
    setDuplicateDetectionEnabled,
    setFuzzyMatchingSensitivity,
    setSyncCompletedTasks,
    setSyncDeletedTasks,
  } = useSyncStore()

  const lastSyncLabel = lastSyncAt
    ? new Date(lastSyncAt).toLocaleString()
    : 'Never'

  const handleConnect = async () => {
    if (!isAuthenticated) {
      startGoogleLogin()
      return
    }
    await connectGoogleTasks()
  }

  return (
    <div className="bg-white dark:bg-zinc-950 border border-app-border dark:border-zinc-800 rounded-xl p-4 card-shadow">
      <span className="text-[9px] font-bold uppercase tracking-widest text-ink3 dark:text-zinc-500 block mb-3">
        🔗 Connected Services
      </span>

      <div className="border border-app-border/70 dark:border-zinc-800 rounded-lg p-3 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-[11px] font-bold text-ink dark:text-zinc-200">Google Tasks</p>
            <p className="text-[9px] text-ink3 dark:text-zinc-500 mt-0.5">
              Two-way sync for habits linked to Google Tasks
            </p>
          </div>
          {googleTasksConnected && isAuthenticated ? (
            <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-green-dark dark:text-green-brand bg-green-light/50 dark:bg-green-brand/10 px-2 py-1 rounded-full">
              <Check className="w-3 h-3" /> Connected
            </span>
          ) : (
            <span className="text-[9px] font-bold uppercase tracking-wider text-ink3 dark:text-zinc-500">
              Not Connected
            </span>
          )}
        </div>

        {syncError && (
          <p className="text-[10px] text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border border-red-200/50 dark:border-red-900/40 rounded-lg px-2.5 py-2">
            {syncError}
          </p>
        )}

        <div className="grid grid-cols-2 gap-2 text-[9px]">
          <div className="bg-slate-50 dark:bg-zinc-900 rounded-lg px-2.5 py-2 border border-app-border/50 dark:border-zinc-800">
            <span className="font-bold uppercase tracking-wider text-ink3 block mb-0.5">Last Sync</span>
            <span className="text-ink2 dark:text-zinc-400">{lastSyncLabel}</span>
          </div>
          <div className="bg-slate-50 dark:bg-zinc-900 rounded-lg px-2.5 py-2 border border-app-border/50 dark:border-zinc-800 flex items-center justify-between">
            <span className="font-bold uppercase tracking-wider text-ink3">Auto Sync</span>
            <button
              type="button"
              role="switch"
              aria-checked={autoSync}
              onClick={() => setAutoSync(!autoSync)}
              className={`relative w-9 h-5 rounded-full transition-colors cursor-pointer ${
                autoSync ? 'bg-pink-brand' : 'bg-slate-300 dark:bg-zinc-700'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                  autoSync ? 'translate-x-4' : ''
                }`}
              />
            </button>
          </div>
        </div>

        <div className="space-y-2 rounded-lg border border-app-border/50 bg-slate-50 p-2.5 dark:border-zinc-800 dark:bg-zinc-900 text-[9px]">
          <ToggleRow label="Ask Before Importing" enabled={askBeforeImporting} onToggle={() => setAskBeforeImporting(!askBeforeImporting)} />
          <ToggleRow label="Import New Tasks Automatically" enabled={importNewTasksAutomatically} onToggle={() => setImportNewTasksAutomatically(!importNewTasksAutomatically)} />
          <ToggleRow label="Duplicate Detection" enabled={duplicateDetectionEnabled} onToggle={() => setDuplicateDetectionEnabled(!duplicateDetectionEnabled)} />
          <ToggleRow label="Sync Completed Tasks" enabled={syncCompletedTasks} onToggle={() => setSyncCompletedTasks(!syncCompletedTasks)} />
          <ToggleRow label="Sync Deleted Tasks" enabled={syncDeletedTasks} onToggle={() => setSyncDeletedTasks(!syncDeletedTasks)} />
          <div className="flex items-center justify-between gap-2">
            <span className="font-bold uppercase tracking-wider text-ink3">Fuzzy Matching</span>
            <select
              value={fuzzyMatchingSensitivity}
              onChange={(event) => setFuzzyMatchingSensitivity(Number(event.target.value))}
              className="rounded border border-app-border bg-white px-2 py-1 text-[9px] dark:border-zinc-700 dark:bg-zinc-800"
            >
              <option value={0.55}>Loose</option>
              <option value={0.65}>Balanced</option>
              <option value={0.8}>Strict</option>
            </select>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {!googleTasksConnected || !isAuthenticated ? (
            <button
              type="button"
              onClick={() => void handleConnect()}
              className="flex-1 min-w-[120px] text-[10px] font-bold text-white bg-pink-dark dark:bg-pink-brand py-2 rounded-lg cursor-pointer hover:opacity-95 transition-opacity"
            >
              {isAuthenticated ? 'Connect Google Tasks' : 'Sign in to Connect'}
            </button>
          ) : (
            <>
              <button
                type="button"
                disabled={isSyncing}
                onClick={() => void runSync(true)}
                className="flex-1 text-[10px] font-bold text-blue-dark dark:text-blue-brand border border-blue-brand/25 hover:bg-blue-light/40 dark:hover:bg-blue-brand/10 py-2 rounded-lg cursor-pointer transition-colors flex items-center justify-center gap-1 disabled:opacity-50"
              >
                <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                {isSyncing ? 'Syncing…' : 'Sync Now'}
              </button>
              <button
                type="button"
                onClick={() => disconnectGoogleTasks()}
                className="flex-1 text-[10px] font-bold text-ink2 dark:text-zinc-400 border border-app-border dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 py-2 rounded-lg cursor-pointer transition-colors flex items-center justify-center gap-1"
              >
                <Unplug className="w-3 h-3" /> Disconnect
              </button>
            </>
          )}
        </div>

        <p className="text-[9px] text-ink3 dark:text-zinc-500 leading-relaxed">
          Conflict resolution: when both sides change at the same time, the newest edit wins. If timestamps match, you&apos;ll be asked to choose.
        </p>
      </div>
    </div>
  )
}

function ToggleRow({ label, enabled, onToggle }: { label: string; enabled: boolean; onToggle: () => void }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="font-bold uppercase tracking-wider text-ink3">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        onClick={onToggle}
        className={`relative h-5 w-9 rounded-full transition-colors cursor-pointer ${enabled ? 'bg-pink-brand' : 'bg-slate-300 dark:bg-zinc-700'}`}
      >
        <span className={`absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${enabled ? 'translate-x-4' : ''}`} />
      </button>
    </div>
  )
}
