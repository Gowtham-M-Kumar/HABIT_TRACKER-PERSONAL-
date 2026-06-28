import React, { useEffect } from 'react'
import { useAuthStore, hasSeenLanding } from '../../store/authStore'
import { LandingPage } from './LandingPage'
import { AuthModal } from './AuthModal'
import { Loader2 } from 'lucide-react'

interface AuthGateProps {
  children: React.ReactNode
}

/**
 * AuthGate wraps the entire app and handles the auth routing:
 *
 *   Not initialized  →  Loading spinner
 *   Signed in        →  App (cloud mode)
 *   Seen landing     →  App (guest mode, landing skipped)
 *   First visit      →  LandingPage → App
 */
export const AuthGate: React.FC<AuthGateProps> = ({ children }) => {
  const { initialize, isInitialized, mode, isAuthModalOpen, openAuthModal, closeAuthModal, continueAsGuest } =
    useAuthStore()

  // Detect password-reset deep link (?reset=true from Supabase redirect)
  useEffect(() => {
    const url = new URL(window.location.href)
    const isReset = url.searchParams.get('reset') === 'true'
    if (isReset) {
      // Clean URL
      url.searchParams.delete('reset')
      window.history.replaceState({}, '', url.toString())
      // Open modal on reset-password view
      openAuthModal('reset-password')
    }
  }, [openAuthModal])

  useEffect(() => {
    initialize()
  }, [initialize])

  // 1. Initializing — show centered spinner
  if (!isInitialized) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          background: 'radial-gradient(ellipse 120% 80% at 50% -10%, #2a1055 0%, #0d0d1f 55%, #050510 100%)',
        }}
      >
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-400 to-purple-600 flex items-center justify-center shadow-xl shadow-purple-900/50 animate-pulse" />
          <Loader2 className="w-5 h-5 text-white/40 animate-spin" />
        </div>
      </div>
    )
  }

  // 2. Signed in → show the main app
  if (mode === 'cloud') {
    return (
      <>
        {children}
        <AuthModal isOpen={isAuthModalOpen} onClose={closeAuthModal} />
      </>
    )
  }

  // 3. Guest who has already dismissed the landing → go straight to app
  if (hasSeenLanding()) {
    return (
      <>
        {children}
        <AuthModal isOpen={isAuthModalOpen} onClose={closeAuthModal} />
      </>
    )
  }

  // 4. First-time visitor → show landing page
  return (
    <>
      <LandingPage
        onOpenAuth={(view) => openAuthModal(view)}
        onContinueAsGuest={continueAsGuest}
      />
      <AuthModal isOpen={isAuthModalOpen} onClose={closeAuthModal} />
    </>
  )
}
