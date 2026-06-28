import React, { useState, useRef, useEffect } from 'react'
import { Settings as SettingsIcon, Cloud, CloudOff, LogIn, LogOut, User, ChevronDown } from 'lucide-react'
import { useProfileBanner } from '../hooks/useProfileBanner'
import { useAuthStore } from '../store/authStore'
import { ProfilePage } from './profile/ProfilePage'

interface TopBarProps {
  onOpenSettings: () => void
}

export const TopBar: React.FC<TopBarProps> = ({ onOpenSettings }) => {
  const {
    profile,
    motivationalMessage,
    fileInputRef,
    handlePhotoClick,
    handlePhotoChange,
  } = useProfileBanner()

  const { mode, user, signOut, openAuthModal, isProfileOpen, openProfile, closeProfile } = useAuthStore()

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false)
      }
    }
    if (isUserMenuOpen) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [isUserMenuOpen])

  const affirmation = profile.affirmationText || 'I am consistent in my habits daily.'
  const initial = profile.name ? profile.name.charAt(0).toUpperCase() : (user?.email?.charAt(0).toUpperCase() ?? 'U')
  const displayName = profile.name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'Guest'

  const isCloud = mode === 'cloud'

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-app-border/80 dark:border-zinc-800 bg-white/90 dark:bg-zinc-950/95 backdrop-blur-2xl shadow-xl">
        <div className="max-w-[1500px] mx-auto px-4 md:px-6 py-3">
          <div className="rounded-[28px] border border-app-border/80 dark:border-zinc-800/90 bg-gradient-to-br from-white via-slate-50 to-pink-light/80 dark:from-zinc-950 dark:via-zinc-900 dark:to-blue-dark/5 shadow-2xl shadow-slate-200/40 dark:shadow-black/20 p-4 md:p-5 grid gap-4 lg:grid-cols-[minmax(320px,360px)_1fr_minmax(240px,280px)] items-center">

            <div className="flex items-start gap-4">
              <div
                onClick={isCloud ? openProfile : handlePhotoClick}
                className="w-14 h-14 md:w-16 md:h-16 rounded-3xl border-2 border-pink-brand/20 dark:border-zinc-700 overflow-hidden relative cursor-pointer group bg-slate-100 dark:bg-zinc-900 shadow-sm shadow-pink-brand/10"
                title={isCloud ? 'View profile' : 'Tap to change profile picture'}
              >
                {profile.photoDataURL ? (
                  <img src={profile.photoDataURL} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-tr from-pink-brand to-purple-brand flex items-center justify-center text-white text-xl font-bold select-none">
                    {initial}
                  </div>
                )}
                <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex items-center justify-center">
                  <span className="text-[8px] md:text-[9px] text-white font-semibold uppercase tracking-[0.2em]">
                    {isCloud ? 'Profile' : 'Change'}
                  </span>
                </div>
                {!isCloud && (
                  <input type="file" ref={fileInputRef} onChange={handlePhotoChange} accept="image/*" className="hidden" />
                )}
              </div>

              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-[0.32em] font-bold text-pink-dark/80 dark:text-pink-brand/70 mb-1">
                  Daily Habit Studio
                </p>
                <h1 className="text-base md:text-lg font-semibold text-ink dark:text-zinc-100 leading-tight">
                  {displayName}
                </h1>
                <p className="mt-1 text-sm md:text-[13px] text-ink3 dark:text-zinc-400 leading-snug truncate">
                  {user?.email ?? 'Build better habits every day.'}
                </p>
                <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-app-border/80 dark:border-zinc-700 bg-white/80 dark:bg-zinc-900/70 px-3 py-1 text-[10px] uppercase tracking-[0.24em] font-semibold text-ink3 dark:text-zinc-400 shadow-sm">
                  {isCloud ? <Cloud className="w-3 h-3 text-emerald-500" /> : <CloudOff className="w-3 h-3 text-ink3" />}
                  {isCloud ? 'Cloud Synced' : 'Guest Profile'}
                </div>
              </div>
            </div>

            <div className="min-w-0">
              <div className="flex flex-col gap-3">
                <div className="rounded-[22px] border border-app-border/70 dark:border-zinc-800/80 bg-white dark:bg-zinc-950/80 p-4 shadow-sm">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-ink3 dark:text-zinc-500 mb-2">
                    Daily Affirmation
                  </p>
                  <p className="text-sm md:text-base font-semibold text-ink dark:text-zinc-100 leading-tight md:leading-snug">
                    “{affirmation}”
                  </p>
                </div>
                <div className="rounded-[22px] bg-gradient-to-r from-pink-light/80 via-purple-light/70 to-blue-light/80 dark:from-pink-brand/15 dark:via-purple-brand/15 dark:to-blue-brand/10 border border-pink-brand/15 dark:border-zinc-700/60 p-4 shadow-sm">
                  <p className="text-[11px] uppercase tracking-[0.27em] text-pink-dark/80 dark:text-pink-brand/80 font-semibold mb-2">
                    Motivation boost
                  </p>
                  <p className="text-sm text-ink dark:text-zinc-100 leading-relaxed">
                    {motivationalMessage} <span className="inline-block ml-1">✨</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 items-stretch sm:items-end">
              <div className="flex gap-2 items-center justify-end flex-wrap">
                {isCloud ? (
                  <div className="relative" ref={menuRef}>
                    <button
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                      className="inline-flex items-center gap-2 py-2 px-3 rounded-2xl border border-app-border dark:border-zinc-700 bg-white dark:bg-zinc-900 text-ink2 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-shadow duration-200 shadow-sm"
                      aria-label="Account menu"
                    >
                      <User className="w-4 h-4 text-pink-brand" />
                      <span className="text-sm font-semibold truncate max-w-[100px] hidden sm:inline">{user?.email?.split('@')[0]}</span>
                      <ChevronDown className={`w-3 h-3 transition-transform duration-150 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isUserMenuOpen && (
                      <div className="absolute top-full right-0 mt-2 w-56 bg-white dark:bg-zinc-950 border border-app-border dark:border-zinc-700 rounded-[20px] shadow-2xl overflow-hidden py-2 z-50">
                        <div className="px-4 py-3 border-b border-app-border dark:border-zinc-800">
                          <p className="text-xs font-semibold text-ink dark:text-zinc-200 truncate">{displayName}</p>
                          <p className="text-[11px] text-ink3 dark:text-zinc-500 truncate">{user?.email}</p>
                        </div>
                        <button
                          onClick={() => { setIsUserMenuOpen(false); openProfile() }}
                          className="w-full text-left px-4 py-3 text-sm text-ink2 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-900 transition-colors"
                        >
                          <span className="inline-flex items-center gap-2">
                            <User className="w-4 h-4" /> View Profile
                          </span>
                        </button>
                        <button
                          onClick={() => { setIsUserMenuOpen(false); signOut() }}
                          className="w-full text-left px-4 py-3 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                        >
                          <span className="inline-flex items-center gap-2">
                            <LogOut className="w-4 h-4" /> Sign Out
                          </span>
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => openAuthModal('login')}
                    className="inline-flex items-center gap-2 py-2 px-3 rounded-2xl border border-pink-brand/25 dark:border-pink-brand/20 bg-pink-light/70 dark:bg-pink-brand/15 text-pink-dark dark:text-pink-brand font-semibold hover:bg-pink-light dark:hover:bg-pink-brand/20 transition"
                    aria-label="Sign in"
                  >
                    <LogIn className="w-4 h-4" />
                    <span className="text-sm">Sign In</span>
                  </button>
                )}
              </div>

              <button
                onClick={onOpenSettings}
                className="inline-flex items-center justify-center rounded-2xl border border-app-border dark:border-zinc-700 bg-white dark:bg-zinc-900 text-ink2 dark:text-zinc-200 py-3 px-4 font-semibold hover:shadow-lg hover:border-pink-brand/50 transition-all duration-200"
                aria-label="Open settings"
              >
                <SettingsIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Profile drawer */}
      <ProfilePage isOpen={isProfileOpen} onClose={closeProfile} />
    </>
  )
}
