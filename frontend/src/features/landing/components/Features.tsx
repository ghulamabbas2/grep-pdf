import { CONTAINER, PAD_X, features } from '../data'

export function Features() {
  return (
    <section id="features" style={{ padding: '0 0 clamp(56px, 8vw, 88px)' }}>
      <div style={{ width: CONTAINER, margin: '0 auto', padding: `0 ${PAD_X}` }}>
        <div style={{ marginBottom: 'clamp(28px, 4vw, 40px)' }}>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 13,
              color: 'var(--color-accent-press)',
              marginBottom: 12,
            }}
          >
            &gt; features
          </div>
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(28px, 4.5vw, 36px)',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              margin: 0,
              color: 'var(--ink-900)',
            }}
          >
            Built like a tool, not a toy.
          </h2>
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
            gap: 18,
          }}
        >
          {features.map((feat) => (
            <div
              key={feat.t}
              style={{
                display: 'flex',
                gap: 14,
                padding: 22,
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-subtle)',
                background: 'var(--surface-card)',
              }}
            >
              <div
                style={{
                  width: 8,
                  alignSelf: 'stretch',
                  borderRadius: 4,
                  background: 'var(--color-accent)',
                  flexShrink: 0,
                }}
              />
              <div>
                <div
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 18,
                    fontWeight: 600,
                    color: 'var(--ink-900)',
                    marginBottom: 6,
                  }}
                >
                  {feat.t}
                </div>
                <div
                  style={{
                    fontSize: 14.5,
                    lineHeight: 1.55,
                    color: 'var(--text-muted)',
                    textWrap: 'pretty',
                  }}
                >
                  {feat.d}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
