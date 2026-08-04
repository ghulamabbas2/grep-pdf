import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ClerkProvider } from '@clerk/react'
import './index.css'
import App from './App.tsx'

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  throw new Error('Missing VITE_CLERK_PUBLISHABLE_KEY — add it to frontend/.env')
}

// Map Clerk's prebuilt UI onto the design-system tokens (docs/design-system.md).
const clerkAppearance = {
  variables: {
    colorPrimary: '#1E1B4B', // --ink-900 (safe dark ground; yellow needs ink text)
    colorText: '#1E1B4B', // --text-body
    colorTextSecondary: '#64748B', // --text-muted
    colorBackground: '#FFFFFF', // --surface-card
    colorInputBackground: '#F1F5F9', // --surface-inset
    borderRadius: '10px', // --radius-md
    fontFamily: "'Inter', -apple-system, system-ui, 'Segoe UI', sans-serif",
  },
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ClerkProvider
      publishableKey={PUBLISHABLE_KEY}
      afterSignOutUrl="/"
      appearance={clerkAppearance}
    >
      <App />
    </ClerkProvider>
  </StrictMode>,
)
