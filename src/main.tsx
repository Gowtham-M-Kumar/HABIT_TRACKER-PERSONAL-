import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AuthGate } from './components/auth/AuthGate'
import { applyTheme } from './utils/theme'

// Apply saved theme before first paint to prevent flash of wrong theme
try {
  const raw = localStorage.getItem('habit-tracker-storage')
  if (raw) {
    const parsed = JSON.parse(raw) as { state?: { settings?: { darkMode?: boolean; accentColor?: string } } }
    const settings = parsed?.state?.settings
    if (settings) {
      applyTheme(!!settings.darkMode, settings.accentColor || '#F4A0B8')
    }
  }
} catch {
  // App applies theme on mount
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthGate>
      <App />
    </AuthGate>
  </StrictMode>,
)
