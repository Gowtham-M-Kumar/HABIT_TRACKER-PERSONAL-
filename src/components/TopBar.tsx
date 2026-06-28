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
      <header className="sticky top-0 z-40 border-b border-app-border/80 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/90 backdrop-blur-xl shadow-sm">
        <div className="max-w-[1500px] mx-auto px-4 md:px-6 py-2.5 md:py-3">
          <div className="flex items-center gap-3 md:gap-5">

            {/* Profile avatar + identity */}
            <div className="flex items-center gap-3 min-w-0 flex-shrink-0">
              <div
                onClick={isCloud ? openProfile : handlePhotoClick}
                className="w-11 h-11 md:w-12 md:h-12 rounded-xl border-2 border-pink-brand/20 dark:border-zinc-700 overflow-hidden relative cursor-pointer group flex-shrink-0 bg-slate-50 dark:bg-zinc-800 shadow-sm"
                title={isCloud ? 'View profile' : 'Tap to change profile picture'}
              >
                {profile.photoDataURL ? (
                  <img src={profile.photoDataURL} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-tr from-pink-brand to-purple-brand flex items-center justify-center text-white text-base font-bold select-none">
                    {initial}
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex items-center justify-center">
                  <span className="text-[7px] text-white font-bold uppercase tracking-wider">
                    {isCloud ? 'Profile' : 'Change'}
                  </span>
                </div>
                {!isCloud && (
                  <input type="file" ref={fileInputRef} onChange={handlePhotoChange} accept="image/*" className="hidden" />
                )}
              </div>

              <div className="min-w-0">
                <h1 className="text-sm md:text-[15px] font-bold text-ink dark:text-zinc-100 truncate leading-tight">
                  {displayName}
                </h1>
                <div className="flex items-center gap-1.5 mt-0.5">
                  {isCloud ? (
                    <span className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                      <Cloud className="w-2.5 h-2.5" /> Cloud Sync
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-ink3 dark:text-zinc-500">
                      <CloudOff className="w-2.5 h-2.5" /> Guest
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Affirmation — tablet+ */}
            <div className="hidden md:flex flex-1 min-w-0 flex-col justify-center pl-4 md:pl-5 border-l border-app-border/70 dark:border-zinc-800">
              <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-ink3 dark:text-zinc-600 mb-0.5">
                Daily Affirmation
              </span>
              <blockquote
                className="text-[11px] italic text-ink2 dark:text-zinc-300 leading-snug pl-2.5 border-l-2 border-pink-brand line-clamp-1"
                title={affirmation}
              >
                &ldquo;{affirmation}&rdquo;
              </blockquote>
            </div>

            {/* Motivation pill — desktop */}
            <div className="hidden lg:flex items-center max-w-[240px] xl:max-w-[280px] flex-shrink-0">
              <div className="bg-gradient-to-r from-pink-light/80 to-purple-light/40 dark:from-pink-brand/10 dark:to-purple-brand/5 border border-pink-brand/15 dark:border-zinc-700/50 rounded-xl px-3 py-2">
                <p className="text-[10px] font-medium text-pink-dark dark:text-pink-brand leading-snug line-clamp-2">
                  {motivationalMessage} 🚀
                </p>
              </div>
            </div>

            {/* Auth controls */}
            <div className="ml-auto flex items-center gap-2 flex-shrink-0">
              {isCloud ? (
                /* User dropdown */
                <div className="relative" ref={menuRef}>
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-1.5 py-1.5 px-2.5 rounded-xl border border-app-border dark:border-zinc-700 bg-white dark:bg-zinc-800 text-ink2 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-700/50 cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md text-xs font-semibold"
                    aria-label="Account menu"
                  >
                    <User className="w-3.5 h-3.5 text-pink-brand" />
                    <span className="hidden sm:inline max-w-[80px] truncate">{user?.email?.split('@')[0]}</span>
                    <ChevronDown className={`w-3 h-3 transition-transform duration-150 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isUserMenuOpen && (
                    <div className="absolute top-full right-0 mt-1.5 w-52 bg-white dark:bg-zinc-900 border border-app-border dark:border-zinc-700 rounded-xl shadow-xl z-50 overflow-hidden py-1">
                      <div className="px-3 py-2 border-b border-app-border dark:border-zinc-800">
                        <p className="text-xs font-bold text-ink dark:text-zinc-200 truncate">{displayName}</p>
                        <p className="text-[10px] text-ink3 dark:text-zinc-500 truncate">{user?.email}</p>
                      </div>
                      <button
                        onClick={() => { setIsUserMenuOpen(false); openProfile() }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-ink2 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer text-left"
                      >
                        <User className="w-3.5 h-3.5 text-ink3 dark:text-zinc-500" /> View Profile
                      </button>
                      <button
                        onClick={() => { setIsUserMenuOpen(false); signOut() }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors cursor-pointer text-left"
                      >
                        <LogOut className="w-3.5 h-3.5" /> Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                /* Sign In button (guest) */
                <button
                  onClick={() => openAuthModal('login')}
                  className="flex items-center gap-1.5 py-1.5 px-2.5 rounded-xl border border-pink-brand/25 dark:border-pink-brand/20 bg-pink-light/60 dark:bg-pink-brand/10 text-pink-dark dark:text-pink-brand hover:bg-pink-light dark:hover:bg-pink-brand/15 cursor-pointer transition-all duration-200 shadow-sm text-xs font-semibold"
                  aria-label="Sign in"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Sign In</span>
                </button>
              )}

              {/* Settings button */}
              <button
                onClick={onOpenSettings}
                className="p-2.5 md:p-2.5 rounded-xl border border-app-border dark:border-zinc-700 bg-white dark:bg-zinc-800 text-ink2 dark:text-zinc-300 hover:text-ink hover:bg-slate-50 dark:hover:bg-zinc-700/50 cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md hover:border-pink-brand/30 focus:outline-none focus:ring-2 focus:ring-pink-brand/50 flex-shrink-0 touch-manipulation active:scale-95"
                aria-label="Open settings"
              >
                <SettingsIcon className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Mobile affirmation strip */}
          <div className="md:hidden mt-2 pt-2 border-t border-app-border/40 dark:border-zinc-800/80">
            <p className="text-[11px] italic text-ink2 dark:text-zinc-400 line-clamp-1 leading-relaxed">
              &ldquo;{affirmation}&rdquo;
            </p>
          </div>
        </div>
      </header>

      {/* Profile drawer */}
      <ProfilePage isOpen={isProfileOpen} onClose={closeProfile} />
    </>
  )
}
