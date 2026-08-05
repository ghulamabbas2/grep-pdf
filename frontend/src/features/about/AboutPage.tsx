import { SiteNav } from '../landing/components/SiteNav'
import { SiteFooter } from '../landing/components/SiteFooter'
import { CONTAINER, PAD_X } from '../landing/data'
import { values, stats } from './data'

/** Public static About page. No auth, no backend calls. */
export function AboutPage() {
  return (
    <div style={{ background: 'var(--surface-page)', minHeight: '100vh' }}>
      <SiteNav />

      {/* Hero */}
      <section style={{ padding: 'clamp(56px, 9vw, 104px) 0 clamp(40px, 6vw, 64px)' }}>
        <div style={{ width: CONTAINER, margin: '0 auto', padding: `0 ${PAD_X}` }}>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 13,
              color: 'var(--color-accent-press)',
              marginBottom: 14,
            }}
          >
            &gt; about us
          </div>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(32px, 6vw, 54px)',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              lineHeight: 1.05,
              margin: '0 0 18px',
              color: 'var(--ink-900)',
              maxWidth: 720,
              textWrap: 'balance',
            }}
          >
            We built grep.pdf so you never have to Ctrl-F a PDF again.
          </h1>
          <p
            style={{
              color: 'var(--text-muted)',
              fontSize: 'clamp(16px, 2.4vw, 20px)',
              lineHeight: 1.55,
              margin: 0,
              maxWidth: 640,
              textWrap: 'pretty',
            }}
          >
            Documents hold the answers — they just make you dig for them. grep.pdf turns any
            PDF into something you can talk to, with every answer backed by the exact line and
            page it came from.
          </p>
        </div>
      </section>

      {/* Story */}
      <section style={{ padding: 'clamp(32px, 5vw, 56px) 0' }}>
        <div
          style={{
            width: CONTAINER,
            margin: '0 auto',
            padding: `0 ${PAD_X}`,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
            gap: 'clamp(20px, 4vw, 40px)',
          }}
        >
          <div>
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(24px, 3.5vw, 32px)',
                fontWeight: 700,
                letterSpacing: '-0.02em',
                margin: '0 0 14px',
                color: 'var(--ink-900)',
              }}
            >
              Why we made it
            </h2>
            <p
              style={{
                color: 'var(--text-muted)',
                fontSize: 'clamp(15px, 2.2vw, 17px)',
                lineHeight: 1.6,
                margin: 0,
                textWrap: 'pretty',
              }}
            >
              We kept watching people scroll through 80-page specs, contracts, and papers hunting
              for a single clause. Search-in-page finds words, not answers — and the AI tools that
              could help too often made things up. So we built the tool we wanted: fast, honest,
              and grounded in the document in front of you.
            </p>
          </div>
          <div>
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(24px, 3.5vw, 32px)',
                fontWeight: 700,
                letterSpacing: '-0.02em',
                margin: '0 0 14px',
                color: 'var(--ink-900)',
              }}
            >
              What we believe
            </h2>
            <p
              style={{
                color: 'var(--text-muted)',
                fontSize: 'clamp(15px, 2.2vw, 17px)',
                lineHeight: 1.6,
                margin: 0,
                textWrap: 'pretty',
              }}
            >
              An answer you can't verify is just a guess. Everything grep.pdf returns is traceable
              back to your source, and your files stay private to your workspace. We would rather
              tell you an answer isn't in the document than invent one that is.
            </p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section style={{ padding: 'clamp(32px, 5vw, 56px) 0' }}>
        <div
          style={{
            width: CONTAINER,
            margin: '0 auto',
            padding: `0 ${PAD_X}`,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))',
            gap: 20,
          }}
        >
          {stats.map((stat) => (
            <div
              key={stat.l}
              style={{
                background: 'var(--surface-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-md)',
                padding: 'clamp(22px, 3vw, 30px)',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(28px, 4.5vw, 40px)',
                  fontWeight: 700,
                  letterSpacing: '-0.02em',
                  color: 'var(--ink-900)',
                  marginBottom: 8,
                }}
              >
                {stat.n}
              </div>
              <div style={{ fontSize: 14, lineHeight: 1.5, color: 'var(--text-muted)' }}>
                {stat.l}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Values */}
      <section style={{ padding: 'clamp(40px, 6vw, 72px) 0' }}>
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
              &gt; what drives us
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
              The principles behind every answer
            </h2>
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))',
              gap: 20,
            }}
          >
            {values.map((value) => (
              <div
                key={value.t}
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
                    fontFamily: 'var(--font-display)',
                    fontSize: 20,
                    fontWeight: 600,
                    color: 'var(--ink-900)',
                    marginBottom: 8,
                  }}
                >
                  {value.t}
                </div>
                <div
                  style={{
                    fontSize: 14.5,
                    lineHeight: 1.55,
                    color: 'var(--text-muted)',
                    textWrap: 'pretty',
                  }}
                >
                  {value.d}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  )
}
