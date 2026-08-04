import { CONTAINER, PAD_X } from '../data'

export function TrustStrip() {
  return (
    <div style={{ borderBottom: '1px solid var(--border-subtle)', background: 'var(--surface-card)' }}>
      <div
        style={{
          width: CONTAINER,
          margin: '0 auto',
          padding: `16px ${PAD_X}`,
          display: 'flex',
          flexWrap: 'wrap',
          gap: '10px 26px',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'var(--font-mono)',
          fontSize: 12.5,
          color: 'var(--text-faint)',
        }}
      >
        <span style={{ color: 'var(--color-accent-press)' }}>&gt;</span>
        <span>trusted by engineers, PhD candidates &amp; legal teams</span>
        <span style={{ color: 'var(--slate-300)' }}>·</span>
        <span>2.4M pages searched</span>
        <span style={{ color: 'var(--slate-300)' }}>·</span>
        <span>avg answer in 1.3s</span>
      </div>
    </div>
  )
}
