import { useState } from 'react'
import { PAD_X, faqs } from '../data'

export function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <section id="faq" style={{ padding: '0 0 clamp(56px, 8vw, 88px)' }}>
      <div style={{ width: 'min(760px, 100%)', margin: '0 auto', padding: `0 ${PAD_X}` }}>
        <div style={{ textAlign: 'center', marginBottom: 'clamp(24px, 4vw, 36px)' }}>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 13,
              color: 'var(--color-accent-press)',
              marginBottom: 12,
            }}
          >
            &gt; faq
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
            Questions, answered.
          </h2>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {faqs.map((item, index) => {
            const open = openIndex === index
            return (
              <div
                key={item.q}
                style={{
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-lg)',
                  background: 'var(--surface-card)',
                  overflow: 'hidden',
                }}
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(open ? null : index)}
                  aria-expanded={open}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    padding: '18px 20px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontFamily: 'var(--font-body)',
                  }}
                >
                  <span style={{ flex: 1, fontSize: 16, fontWeight: 600, color: 'var(--ink-900)' }}>
                    {item.q}
                  </span>
                  <span
                    style={{
                      display: 'inline-flex',
                      flexShrink: 0,
                      transition: 'transform var(--dur-med) var(--ease-standard)',
                      transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
                    }}
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="var(--text-muted)"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </span>
                </button>
                {open && (
                  <div
                    style={{
                      padding: '0 20px 20px',
                      fontSize: 14.5,
                      lineHeight: 1.6,
                      color: 'var(--text-muted)',
                      textWrap: 'pretty',
                    }}
                  >
                    {item.a}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
