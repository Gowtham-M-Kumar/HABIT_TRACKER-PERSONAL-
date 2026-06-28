import React, { useEffect, useRef, useState } from 'react'
import { ChevronDown, LogOut, RefreshCw, User, Wifi } from 'lucide-react'
import { useAuthStore, startGoogleLogin } from '../store/authStore'
import { useSyncStore } from '../store/syncStore'
import { runSync } from '../services/syncEngine'

interface GoogleAuthButtonProps {
  onOpenSettings: () => void
  onOpenConnectedServices?: () => void
}

export const GoogleAuthButton: React.FC<GoogleAuthButtonProps> = ({
  onOpenSettings,
  onOpenConnectedServices,
}) => {
  const { user, isAuthenticated, isLoading, logout } = useAuthStore()
  const { googleTasksConnected, isSyncing, lastSyncAt } = useSyncStore()
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  if (isLoading) {
    return (
      <div className="text-[10px] text-ink3 dark:text-zinc-500 px-3 py-2">Checking session…</div>
    )
  }

  if (!isAuthenticated || !user) {
    return (
      <button
        type="button"
        onClick={startGoogleLogin}
        className="flex items-center gap-2 px-3 py-2 rounded-xl border border-app-border dark:border-zinc-700 bg-white dark:bg-zinc-800 text-[11px] font-semibold text-ink dark:text-zinc-200 hover:border-pink-brand/40 hover:bg-pink-light/30 dark:hover:bg-zinc-700/50 transition-all cursor-pointer shadow-sm"
      >
        <GoogleIcon className="w-4 h-4" />
        <span className="hidden sm:inline">Continue with Google</span>
        <span className="sm:hidden">Google</span>
      </button>
    )
  }

  const lastSyncLabel = lastSyncAt
    ? new Date(lastSyncAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
    : 'Never'

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 pl-1.5 pr-2.5 py-1.5 rounded-xl border border-app-border dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:border-pink-brand/30 transition-all cursor-pointer shadow-sm max-w-[200px]"
      >
        {user.picture ? (
          <img src={user.picture} alt="" className="w-7 h-7 rounded-lg object-cover flex-shrink-0" />
        ) : (
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-pink-brand to-purple-brand flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {user.name.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="min-w-0 text-left hidden sm:block">
          <p className="text-[11px] font-bold text-ink dark:text-zinc-100 truncate leading-tight">{user.name}</p>
          <p className="text-[8px] font-bold uppercase tracking-wider text-green-dark dark:text-green-brand">
            Connected
          </p>
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-ink3 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 rounded-xl border border-app-border dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-xl z-50 py-1 overflow-hidden">
          <MenuItem icon={User} label="Profile" onClick={() => { setOpen(false); onOpenSettings() }} />
          <MenuItem
            icon={Wifi}
            label="Connected Services"
            onClick={() => {
              setOpen(false)
              onOpenConnectedServices?.()
              onOpenSettings()
            }}
          />
          <MenuItem
            icon={RefreshCw}
            label={isSyncing ? 'Syncing…' : `Sync · ${lastSyncLabel}`}
            onClick={() => {
              void runSync(true)
            }}
            subtitle={googleTasksConnected ? 'Google Tasks connected' : 'Tasks not connected'}
          />
          <div className="border-t border-app-border/60 dark:border-zinc-800 my-1" />
          <MenuItem
            icon={LogOut}
            label="Logout"
            onClick={() => {
              setOpen(false)
              void logout()
            }}
            danger
          />
        </div>
      )}
    </div>
  )
}

function MenuItem({
  icon: Icon,
  label,
  subtitle,
  onClick,
  danger,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  subtitle?: string
  onClick: () => void
  danger?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-start gap-2.5 px-3 py-2.5 text-left hover:bg-slate-50 dark:hover:bg-zinc-800/80 cursor-pointer transition-colors ${
        danger ? 'text-red-600 dark:text-red-400' : 'text-ink dark:text-zinc-200'
      }`}
    >
      <Icon className="w-4 h-4 mt-0.5 flex-shrink-0 opacity-70" />
      <span>
        <span className="block text-[11px] font-semibold">{label}</span>
        {subtitle && (
          <span className="block text-[9px] text-ink3 dark:text-zinc-500 mt-0.5">{subtitle}</span>
        )}
      </span>
    </button>
  )
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  )
}
