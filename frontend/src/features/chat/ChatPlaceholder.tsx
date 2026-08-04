import { Link, useParams } from 'react-router'
import { Button } from '../../components/ui/Button'

/**
 * Placeholder for the chat view (`/chat/:sessionId`). The real ask-your-PDF
 * workspace lands in a later branch; this keeps session links from 404-ing and
 * confirms routing + the param round-trip.
 */
export function ChatPlaceholder() {
  const { sessionId } = useParams()

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        padding: 24,
        background: 'var(--surface-page)',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 13,
          color: 'var(--slate-500)',
          letterSpacing: '0.04em',
        }}
      >
        &gt; session {sessionId}
      </div>
      <h1
        style={{
          margin: 0,
          fontFamily: 'var(--font-display)',
          fontSize: 26,
          fontWeight: 600,
          letterSpacing: 'var(--tracking-tight)',
          color: 'var(--ink-900)',
        }}
      >
        Chat coming soon
      </h1>
      <p style={{ margin: 0, fontSize: 15, color: 'var(--text-muted)', maxWidth: '44ch' }}>
        The ask-your-PDF workspace is being built. For now, head back to your sessions.
      </p>
      <Link to="/dashboard">
        <Button variant="outline">Back to dashboard</Button>
      </Link>
    </div>
  )
}
