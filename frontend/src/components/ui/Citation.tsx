import type { CSSProperties, HTMLAttributes } from 'react'

type CitationProps = {
  page: number | string
  source?: string
  quote?: string
  onJump?: () => void
  compact?: boolean
} & Omit<HTMLAttributes<HTMLDivElement>, 'onClick'>

/** Cited-passage card: yellow bar, the quoted line, and a mono `> source p.N` footer. */
export function Citation({
  page,
  source = 'PDF',
  quote,
  onJump,
  compact = false,
  style,
  ...rest
}: CitationProps) {
  const containerStyle: CSSProperties = {
    display: 'flex',
    gap: 'var(--space-3)',
    alignItems: 'stretch',
    background: 'var(--surface-card)',
    border: '1px solid var(--border-subtle)',
    borderRadius: 'var(--radius-md)',
    padding: compact ? 'var(--space-2) var(--space-3)' : 'var(--space-3) var(--space-4)',
    cursor: onJump ? 'pointer' : 'default',
    boxShadow: 'var(--shadow-xs)',
    transition: 'box-shadow var(--dur-fast), border-color var(--dur-fast)',
    ...style,
  }

  return (
    <div onClick={onJump} style={containerStyle} {...rest}>
      <div
        style={{ width: 3, borderRadius: 3, background: 'var(--highlight-bar)', flexShrink: 0 }}
      />
      <div style={{ minWidth: 0, flex: 1 }}>
        {!compact && quote && (
          <p
            style={{
              margin: '0 0 6px',
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-sm)',
              lineHeight: 'var(--leading-normal)',
              color: 'var(--text-body)',
            }}
          >
            <mark
              style={{
                background: 'var(--highlight-bg)',
                color: 'var(--ink-900)',
                padding: '0 2px',
                borderRadius: 2,
              }}
            >
              {quote}
            </mark>
          </p>
        )}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-xs)',
            color: 'var(--text-muted)',
            letterSpacing: 'var(--tracking-mono)',
          }}
        >
          <span style={{ color: 'var(--color-accent-press)', fontWeight: 600 }}>&gt;</span>
          <span style={{ fontWeight: 600, color: 'var(--text-strong)' }}>{source}</span>
          <span style={{ color: 'var(--text-faint)' }}>p.{page}</span>
        </div>
      </div>
    </div>
  )
}
