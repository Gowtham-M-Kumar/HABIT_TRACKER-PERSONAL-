import React from 'react'
import { Settings as SettingsIcon } from 'lucide-react'
import { useProfileBanner } from '../hooks/useProfileBanner'

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

  const affirmation = profile.affirmationText || 'I am consistent in my habits daily.'
  const initial = profile.name ? profile.name.charAt(0).toUpperCase() : 'U'

  return (
    <header className="sticky top-0 z-40 border-b border-app-border/80 dark:border-zinc-800 bg-white/75 dark:bg-zinc-950/85 backdrop-blur-xl shadow-sm">
      <div className="max-w-[1500px] mx-auto px-4 md:px-6 py-3">
        <div className="flex items-center gap-3 md:gap-5">

          {/* Profile avatar + identity */}
          <div className="flex items-center gap-3 min-w-0 flex-shrink-0">
            <div
              onClick={handlePhotoClick}
              className="w-11 h-11 md:w-12 md:h-12 rounded-xl border-2 border-pink-brand/20 dark:border-zinc-700 overflow-hidden relative cursor-pointer group flex-shrink-0 bg-slate-50 dark:bg-zinc-800 shadow-sm"
              title="Tap to change profile picture"
            >
              {profile.photoDataURL ? (
                <img src={profile.photoDataURL} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-tr from-pink-brand to-purple-brand flex items-center justify-center text-white text-base font-bold select-none">
                  {initial}
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex items-center justify-center">
                <span className="text-[7px] text-white font-bold uppercase tracking-wider">Change</span>
              </div>
              <input type="file" ref={fileInputRef} onChange={handlePhotoChange} accept="image/*" className="hidden" />
            </div>

            <div className="min-w-0">
              <h1 className="text-sm md:text-[15px] font-bold text-ink dark:text-zinc-100 truncate leading-tight">
                {profile.name || 'User Profile'}
              </h1>
              <p className="text-[9px] font-bold uppercase tracking-wider text-ink3 dark:text-zinc-500 mt-0.5">
                Member since 2026
              </p>
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

          {/* Settings button */}
          <button
            onClick={onOpenSettings}
            className="ml-auto p-2.5 rounded-xl border border-app-border dark:border-zinc-700 bg-white dark:bg-zinc-800 text-ink2 dark:text-zinc-300 hover:text-ink hover:bg-slate-50 dark:hover:bg-zinc-700/50 cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md hover:border-pink-brand/30 focus:outline-none focus:ring-2 focus:ring-pink-brand/50 flex-shrink-0"
            aria-label="Open settings"
          >
            <SettingsIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Mobile affirmation strip */}
        <div className="md:hidden mt-2.5 pt-2.5 border-t border-app-border/50 dark:border-zinc-800/80">
          <p className="text-[10px] italic text-ink2 dark:text-zinc-400 line-clamp-2 leading-relaxed">
            &ldquo;{affirmation}&rdquo;
          </p>
          <p className="text-[9px] font-medium text-pink-dark dark:text-pink-brand mt-1.5 line-clamp-1">
            {motivationalMessage}
          </p>
        </div>
      </div>
    </header>
  )
}
