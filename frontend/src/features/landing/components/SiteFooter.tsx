import { CONTAINER, PAD_X } from '../data'
import logoUrl from '../../../assets/logo.svg'

export function SiteFooter() {
  return (
    <footer style={{ borderTop: '1px solid var(--border-subtle)', background: 'var(--surface-card)' }}>
      <div
        style={{
          width: CONTAINER,
          margin: '0 auto',
          padding: `32px ${PAD_X}`,
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: 16,
        }}
      >
        <img src={logoUrl} alt="grep.pdf" style={{ height: 46 }} />
        <span style={{ fontSize: 13, color: 'var(--text-faint)', fontFamily: 'var(--font-mono)' }}>
          grep your documents · © 2026
        </span>
        <div style={{ flex: 1, minWidth: 20 }} />
        <div style={{ display: 'flex', gap: 20, fontSize: 13, color: 'var(--text-muted)' }}>
          <a href="#" style={{ color: 'inherit' }}>
            Privacy
          </a>
          <a href="#" style={{ color: 'inherit' }}>
            Terms
          </a>
          <a href="#" style={{ color: 'inherit' }}>
            Docs
          </a>
        </div>
      </div>
    </footer>
  )
}
