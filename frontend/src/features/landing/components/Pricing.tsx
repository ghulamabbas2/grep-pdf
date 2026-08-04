import { useState, type CSSProperties } from 'react'
import { Badge } from '../../../components/ui/Badge'
import { Button } from '../../../components/ui/Button'
import { CONTAINER, PAD_X, pricingTiers } from '../data'

const segBase: CSSProperties = {
  border: 'none',
  cursor: 'pointer',
  fontFamily: 'var(--font-body)',
  fontSize: 14,
  fontWeight: 600,
  padding: '7px 16px',
  borderRadius: 'var(--radius-pill)',
  transition: 'background var(--dur-fast), color var(--dur-fast)',
}
const segOn: CSSProperties = {
  ...segBase,
  background: 'var(--surface-card)',
  color: 'var(--ink-900)',
  boxShadow: 'var(--shadow-sm)',
}
const segOff: CSSProperties = { ...segBase, background: 'transparent', color: 'var(--text-muted)' }

const checkIcon = (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="var(--color-accent-press)"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ flexShrink: 0, marginTop: 2 }}
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

export function Pricing() {
  const [annual, setAnnual] = useState(false)

  return (
    <section id="pricing" style={{ padding: '0 0 clamp(56px, 8vw, 88px)' }}>
      <div style={{ width: CONTAINER, margin: '0 auto', padding: `0 ${PAD_X}` }}>
        <div style={{ textAlign: 'center', marginBottom: 'clamp(24px, 4vw, 36px)' }}>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 13,
              color: 'var(--color-accent-press)',
              marginBottom: 12,
            }}
          >
            &gt; pricing
          </div>
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(28px, 4.5vw, 36px)',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              margin: '0 0 20px',
              color: 'var(--ink-900)',
            }}
          >
            Simple pricing. Free to start.
          </h2>
          <div
            style={{
              display: 'inline-flex',
              padding: 4,
              background: 'var(--surface-inset)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-pill)',
              gap: 4,
            }}
          >
            <button type="button" onClick={() => setAnnual(false)} style={annual ? segOff : segOn}>
              Monthly
            </button>
            <button type="button" onClick={() => setAnnual(true)} style={annual ? segOn : segOff}>
              Annual <span style={{ color: 'var(--color-accent-press)', fontWeight: 600 }}>−25%</span>
            </button>
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
            gap: 20,
            alignItems: 'start',
          }}
        >
          {pricingTiers.map((tier) => {
            const price = annual ? tier.annual : tier.monthly
            const free = price === 0
            const billNote = free
              ? 'Free forever'
              : annual
                ? 'per user, billed annually'
                : 'per user, billed monthly'

            return (
              <div
                key={tier.name}
                style={{
                  position: 'relative',
                  background: 'var(--surface-card)',
                  border: tier.featured
                    ? '1.5px solid var(--color-accent)'
                    : '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: tier.featured ? 'var(--shadow-lg)' : 'var(--shadow-md)',
                  padding: 'clamp(24px, 3vw, 30px)',
                }}
              >
                {tier.featured && (
                  <div style={{ position: 'absolute', top: -11, left: '50%', transform: 'translateX(-50%)' }}>
                    <Badge variant="accent" size="sm">
                      Most popular
                    </Badge>
                  </div>
                )}
                <div
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 20,
                    fontWeight: 600,
                    color: 'var(--ink-900)',
                  }}
                >
                  {tier.name}
                </div>
                <div style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 4 }}>
                  {tier.tagline}
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, margin: '18px 0 4px' }}>
                  <span
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: 40,
                      fontWeight: 700,
                      letterSpacing: '-0.02em',
                      color: 'var(--ink-900)',
                    }}
                  >
                    ${price}
                  </span>
                  {!free && <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>/mo</span>}
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 11.5,
                    color: 'var(--text-faint)',
                    minHeight: 16,
                    marginBottom: 18,
                  }}
                >
                  {billNote}
                </div>
                <div style={{ marginBottom: 20 }}>
                  <Button variant={tier.featured ? 'primary' : 'outline'} size="md" fullWidth>
                    {tier.cta}
                  </Button>
                </div>
                <ul
                  style={{
                    listStyle: 'none',
                    margin: 0,
                    padding: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 11,
                  }}
                >
                  {tier.features.map((f) => (
                    <li
                      key={f}
                      style={{
                        display: 'flex',
                        gap: 9,
                        alignItems: 'flex-start',
                        fontSize: 14,
                        color: 'var(--text-body)',
                        lineHeight: 1.45,
                      }}
                    >
                      {checkIcon}
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
