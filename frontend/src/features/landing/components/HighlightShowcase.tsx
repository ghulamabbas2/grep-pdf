import { Highlight } from '../../../components/ui/Highlight'
import { CONTAINER, PAD_X } from '../data'

export function HighlightShowcase() {
  return (
    <section style={{ padding: '0 0 clamp(56px, 8vw, 88px)' }}>
      <div style={{ width: CONTAINER, margin: '0 auto', padding: `0 ${PAD_X}` }}>
        <div
          style={{
            background: 'var(--surface-ink)',
            color: 'var(--text-on-ink)',
            borderRadius: 'var(--radius-xl)',
            padding: 'clamp(28px, 5vw, 52px)',
            display: 'flex',
            flexWrap: 'wrap',
            gap: 'clamp(28px, 4vw, 48px)',
            alignItems: 'center',
          }}
        >
          <div style={{ flex: '1 1 340px', minWidth: 'min(100%, 300px)' }}>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 13,
                color: 'var(--color-accent)',
                marginBottom: 14,
              }}
            >
              &gt; the answer, and the line
            </div>
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(26px, 4vw, 34px)',
                fontWeight: 700,
                letterSpacing: '-0.02em',
                margin: '0 0 14px',
                lineHeight: 1.1,
              }}
            >
              Never guess where an answer came from.
            </h2>
            <p
              style={{
                fontSize: 'clamp(15px, 2.2vw, 17px)',
                lineHeight: 1.55,
                color: 'var(--slate-300)',
                margin: 0,
                maxWidth: 420,
                textWrap: 'pretty',
              }}
            >
              Every response points back to the exact passage and page. Click the citation, jump to
              the highlight. No hallucinated sources — if it's not in the doc, grep.pdf says so.
            </p>
          </div>
          <div style={{ flex: '1 1 320px', minWidth: 'min(100%, 280px)' }}>
            <div
              style={{
                background: 'var(--surface-card)',
                borderRadius: 'var(--radius-lg)',
                padding: 'clamp(20px, 3vw, 26px)',
                boxShadow: 'var(--shadow-lg)',
              }}
            >
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11,
                  color: 'var(--text-faint)',
                  marginBottom: 14,
                }}
              >
                spec-v2.pdf · p.8
              </div>
              <p style={{ fontSize: 14.5, lineHeight: 1.7, color: 'var(--text-body)', margin: 0 }}>
                The service level agreement guarantees <Highlight>99.95% uptime</Highlight>, measured
                monthly, excluding scheduled maintenance windows announced{' '}
                <Highlight tone="underline">at least 48 hours in advance</Highlight>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
