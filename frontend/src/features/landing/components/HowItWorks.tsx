import { CONTAINER, PAD_X, steps } from '../data'

export function HowItWorks() {
  return (
    <section id="how" style={{ padding: 'clamp(56px, 8vw, 88px) 0' }}>
      <div style={{ width: CONTAINER, margin: '0 auto', padding: `0 ${PAD_X}` }}>
        <div style={{ textAlign: 'center', marginBottom: 'clamp(32px, 5vw, 48px)' }}>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 13,
              color: 'var(--color-accent-press)',
              marginBottom: 12,
            }}
          >
            &gt; how it works
          </div>
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(28px, 4.5vw, 36px)',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              margin: '0 0 10px',
              color: 'var(--ink-900)',
            }}
          >
            Three steps. That's it.
          </h2>
          <p
            style={{
              color: 'var(--text-muted)',
              fontSize: 'clamp(15px, 2.2vw, 17px)',
              margin: 0,
            }}
          >
            No setup. No prompt engineering. Just ask.
          </p>
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))',
            gap: 20,
          }}
        >
          {steps.map((step) => (
            <div
              key={step.n}
              style={{
                background: 'var(--surface-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-md)',
                padding: 'clamp(22px, 3vw, 30px)',
              }}
            >
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 13,
                  color: 'var(--color-accent-press)',
                  marginBottom: 14,
                  fontWeight: 600,
                }}
              >
                {step.n}
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 20,
                  fontWeight: 600,
                  color: 'var(--ink-900)',
                  marginBottom: 8,
                }}
              >
                {step.t}
              </div>
              <div
                style={{
                  fontSize: 14.5,
                  lineHeight: 1.55,
                  color: 'var(--text-muted)',
                  textWrap: 'pretty',
                }}
              >
                {step.d}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
