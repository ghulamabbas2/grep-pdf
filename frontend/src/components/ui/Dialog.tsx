import type { ReactNode } from 'react'

type DialogProps = {
  open: boolean
  onClose: () => void
  title?: string
  footer?: ReactNode
  width?: number
  children?: ReactNode
}

/**
 * Modal dialog. Scrim click closes; content click is stopped.
 *
 * TBD (docs/ui.md): focus trap, Escape-to-close, scroll-lock, and
 * return-focus-to-trigger are not implemented — add before production.
 */
export function Dialog({ open, onClose, title, footer, width = 460, children }: DialogProps) {
  if (!open) return null

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 80,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        background: 'rgba(30, 27, 75, 0.42)',
        backdropFilter: 'blur(2px)',
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: width,
          background: 'var(--surface-card)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-lg)',
          overflow: 'hidden',
        }}
      >
        {title && (
          <div
            style={{
              padding: '18px 22px',
              borderBottom: '1px solid var(--border-subtle)',
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--text-lg)',
              fontWeight: 'var(--weight-semibold)',
              letterSpacing: 'var(--tracking-tight)',
              color: 'var(--ink-900)',
            }}
          >
            {title}
          </div>
        )}
        <div style={{ padding: 22 }}>{children}</div>
        {footer && (
          <div
            style={{
              padding: '14px 22px',
              background: 'var(--surface-inset)',
              borderTop: '1px solid var(--border-subtle)',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 10,
            }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
