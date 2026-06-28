import React from 'react'
import { useProfileBanner } from '../hooks/useProfileBanner'

/** Compact card variant — profile lives in TopBar on desktop; kept for settings/embed use */
export const ProfileCard: React.FC = () => {
  const {
    profile,
    motivationalMessage,
    fileInputRef,
    handlePhotoClick,
    handlePhotoChange,
  } = useProfileBanner()

  const initial = profile.name ? profile.name.charAt(0).toUpperCase() : 'U'

  return (
    <div className="bg-white dark:bg-zinc-900 border border-app-border dark:border-zinc-800 rounded-xl p-4 card-shadow flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <div
          onClick={handlePhotoClick}
          className="w-12 h-12 rounded-xl border border-app-border dark:border-zinc-700 overflow-hidden relative cursor-pointer group flex-shrink-0"
        >
          {profile.photoDataURL ? (
            <img src={profile.photoDataURL} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-tr from-pink-brand to-purple-brand flex items-center justify-center text-white font-bold">
              {initial}
            </div>
          )}
          <input type="file" ref={fileInputRef} onChange={handlePhotoChange} accept="image/*" className="hidden" />
        </div>
        <div className="min-w-0">
          <h3 className="text-sm font-bold text-ink dark:text-zinc-200 truncate">{profile.name || 'User Profile'}</h3>
          <p className="text-[9px] font-bold uppercase tracking-wider text-ink3">Member since 2026</p>
        </div>
      </div>
      <blockquote className="text-[10px] italic text-ink2 dark:text-zinc-300 pl-2 border-l-2 border-pink-brand line-clamp-2">
        &ldquo;{profile.affirmationText || 'I am consistent in my habits daily.'}&rdquo;
      </blockquote>
      <p className="text-[10px] font-medium text-pink-dark dark:text-pink-brand bg-pink-light/30 dark:bg-zinc-800/30 rounded-lg p-2">
        {motivationalMessage}
      </p>
    </div>
  )
}
