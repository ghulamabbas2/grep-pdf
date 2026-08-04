import type { ReactNode } from 'react'
import { RedirectToSignIn, useAuth } from '@clerk/react'

/**
 * Guard for protected routes (docs/routing.md). Waits for Clerk to load, then
 * renders children for a signed-in user or redirects to the Clerk-hosted
 * sign-in page otherwise.
 */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { isLoaded, isSignedIn } = useAuth()

  if (!isLoaded) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--surface-page)',
          fontFamily: 'var(--font-mono)',
          fontSize: 'var(--text-sm)',
          color: 'var(--text-muted)',
        }}
      >
        &gt; loading…
      </div>
    )
  }

  if (!isSignedIn) {
    return <RedirectToSignIn />
  }

  return <>{children}</>
}
