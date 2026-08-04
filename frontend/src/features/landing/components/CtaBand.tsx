import { Button } from '../../../components/ui/Button'
import { CONTAINER, PAD_X } from '../data'

export function CtaBand() {
  return (
    <section style={{ padding: '0 0 clamp(56px, 9vw, 96px)' }}>
      <div style={{ width: CONTAINER, margin: '0 auto', padding: `0 ${PAD_X}` }}>
        <div
          style={{
            background: 'var(--surface-ink)',
            borderRadius: 'var(--radius-xl)',
            padding: 'clamp(40px, 6vw, 64px) clamp(24px, 4vw, 40px)',
            textAlign: 'center',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 13,
              color: 'var(--color-accent)',
              marginBottom: 16,
            }}
          >
            &gt; ready?
          </div>
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(26px, 4.5vw, 38px)',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              color: 'var(--page-50)',
              margin: '0 auto 14px',
              maxWidth: 640,
              lineHeight: 1.1,
              textWrap: 'balance',
            }}
          >
            Ask. Get the answer and the line it came from.
          </h2>
          <p style={{ fontSize: 'clamp(15px, 2.2vw, 17px)', color: 'var(--slate-300)', margin: '0 0 28px' }}>
            Free for your first 5 documents. No card required.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
            <Button variant="primary" size="lg">
              Upload a PDF
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
