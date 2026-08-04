import { Button } from '../../../components/ui/Button'
import { UploadIcon } from './icons'

/** First-run panel shown when the user has no sessions yet. */
export function EmptyState({ onUpload }: { onUpload: () => void }) {
  return (
    <div
      style={{
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-xl)',
        background: 'var(--surface-card)',
        boxShadow: 'var(--shadow-md)',
        padding: '64px 32px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <div
        style={{
          width: 66,
          height: 66,
          borderRadius: 20,
          background: 'var(--ink-900)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 24,
          boxShadow: 'var(--shadow-md)',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 600,
            fontSize: 26,
            color: 'var(--yellow-500)',
            letterSpacing: '-0.04em',
          }}
        >
          &gt;
        </span>
        <span className="gp-cursor gp-anim" />
      </div>
      <h2
        style={{
          margin: 0,
          fontFamily: 'var(--font-display)',
          fontSize: 26,
          fontWeight: 600,
          letterSpacing: 'var(--tracking-tight)',
          color: 'var(--ink-900)',
        }}
      >
        No sessions yet
      </h2>
      <p
        style={{
          margin: '12px 0 0',
          fontSize: 15,
          lineHeight: 1.6,
          color: 'var(--text-muted)',
          maxWidth: '44ch',
        }}
      >
        Upload a PDF and start asking. Stop scrolling 80 pages — grep.pdf gives you the answer and
        the exact line it came from.
      </p>
      <div style={{ margin: '28px 0 8px' }}>
        <Button variant="primary" size="lg" onClick={onUpload} leftIcon={<UploadIcon size={18} />}>
          Upload a PDF
        </Button>
      </div>
      <div
        style={{
          marginTop: 26,
          padding: '14px 18px',
          background: 'var(--surface-inset)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          fontFamily: 'var(--font-mono)',
          fontSize: 13,
          color: 'var(--slate-500)',
          maxWidth: '100%',
        }}
      >
        &gt; ask this PDF anything…
        <span className="gp-cursor gp-anim" style={{ height: '0.95em' }} />
      </div>
    </div>
  )
}
