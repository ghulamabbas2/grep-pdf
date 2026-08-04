import { useEffect, useState } from 'react'
import { Button } from '../../../components/ui/Button'
import { Highlight } from '../../../components/ui/Highlight'
import { Citation } from '../../../components/ui/Citation'
import { CONTAINER, PAD_X } from '../data'

const HERO_META = ['> no card required', '> 5 free documents', '> docs stay yours']

export function Hero() {
  const [answered, setAnswered] = useState(false)

  useEffect(() => {
    const reduceMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (reduceMotion) {
      setAnswered(true)
      return
    }

    const timers: ReturnType<typeof setTimeout>[] = []
    timers.push(setTimeout(() => setAnswered(true), 1700))

    const interval = setInterval(() => {
      setAnswered(false)
      timers.push(setTimeout(() => setAnswered(true), 1700))
    }, 6500)

    return () => {
      timers.forEach(clearTimeout)
      clearInterval(interval)
    }
  }, [])

  return (
    <section
      id="top"
      style={{
        background: 'var(--surface-ink)',
        color: 'var(--text-on-ink)',
        padding: 'clamp(56px, 8vw, 92px) 0 clamp(64px, 9vw, 100px)',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          width: CONTAINER,
          margin: '0 auto',
          padding: `0 ${PAD_X}`,
          display: 'flex',
          flexWrap: 'wrap',
          gap: 'clamp(36px, 5vw, 60px)',
          alignItems: 'center',
        }}
      >
        <div style={{ flex: '1 1 420px', minWidth: 'min(100%, 320px)' }}>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 13,
              letterSpacing: '0.04em',
              color: 'var(--color-accent)',
              marginBottom: 18,
            }}
          >
            &gt; grep your documents
          </div>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(38px, 6.2vw, 60px)',
              lineHeight: 1.02,
              fontWeight: 700,
              letterSpacing: '-0.03em',
              margin: '0 0 20px',
              textWrap: 'balance',
            }}
          >
            Stop scrolling.
            <br />
            Ask your <span style={{ color: 'var(--color-accent)' }}>PDF</span>
            <span
              className="gp-anim"
              style={{
                display: 'inline-block',
                width: '0.5ch',
                height: '0.95em',
                background: 'var(--color-accent)',
                marginLeft: 2,
                transform: 'translateY(2px)',
                animation: 'gp-blink 1.1s steps(1) infinite',
              }}
            />
          </h1>
          <p
            style={{
              fontSize: 'clamp(16px, 2.4vw, 19px)',
              lineHeight: 1.55,
              color: 'var(--slate-300)',
              margin: '0 0 30px',
              maxWidth: 460,
              textWrap: 'pretty',
            }}
          >
            Upload a document and get the answer — with the exact line it came from. Built for devs,
            students, and researchers.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            <Button variant="primary" size="lg">
              Upload a PDF
            </Button>
            <Button
              variant="ink"
              size="lg"
              style={{ background: 'var(--ink-800)', border: '1px solid var(--ink-700)' }}
            >
              See a demo
            </Button>
          </div>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px 20px',
              marginTop: 26,
              fontFamily: 'var(--font-mono)',
              fontSize: 12,
              color: 'var(--slate-400)',
            }}
          >
            {HERO_META.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </div>

        <div
          className="gp-anim"
          style={{
            flex: '1 1 380px',
            minWidth: 'min(100%, 300px)',
            animation: 'gp-fade 0.5s var(--ease-standard) both',
          }}
        >
          <div
            style={{
              background: 'var(--surface-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-lg)',
              overflow: 'hidden',
              maxWidth: 440,
              marginLeft: 'auto',
            }}
          >
            <div
              style={{
                background: 'var(--surface-inset)',
                padding: '10px 14px',
                display: 'flex',
                gap: 6,
                alignItems: 'center',
                borderBottom: '1px solid var(--border-subtle)',
              }}
            >
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--slate-300)' }} />
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--slate-300)' }} />
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--slate-300)' }} />
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11,
                  color: 'var(--text-faint)',
                  marginLeft: 8,
                }}
              >
                refund-policy.pdf
              </span>
            </div>
            <div
              style={{
                padding: 18,
                display: 'flex',
                flexDirection: 'column',
                gap: 14,
                minHeight: 180,
              }}
            >
              <div
                style={{
                  alignSelf: 'flex-end',
                  background: 'var(--surface-ink)',
                  color: 'var(--text-on-ink)',
                  padding: '9px 13px',
                  borderRadius: 'var(--radius-lg)',
                  borderBottomRightRadius: 4,
                  fontSize: 13.5,
                  maxWidth: '82%',
                }}
              >
                What's the refund window?
              </div>

              {answered ? (
                <div
                  className="gp-anim"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12,
                    animation: 'gp-fade 0.35s var(--ease-standard) both',
                  }}
                >
                  <div style={{ fontSize: 13.5, lineHeight: 1.55, color: 'var(--text-body)' }}>
                    You can return items within <Highlight>30 days of delivery</Highlight> for a full
                    refund.
                  </div>
                  <Citation
                    source="refund-policy.pdf"
                    page={12}
                    quote="Refunds are available within 30 days of delivery."
                  />
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 9, color: 'var(--text-muted)' }}>
                  <span style={{ display: 'inline-flex', gap: 4 }}>
                    {[0, 0.18, 0.36].map((delay) => (
                      <span
                        key={delay}
                        className="gp-anim"
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          background: 'var(--color-accent-press)',
                          animation: `gp-dot 1.2s ease-in-out ${delay}s infinite`,
                        }}
                      />
                    ))}
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>
                    searching the document…
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
