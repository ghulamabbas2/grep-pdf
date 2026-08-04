import { useState } from 'react'
import { Button } from '../../../components/ui/Button'
import { CONTAINER, PAD_X } from '../data'
import logoUrl from '../../../assets/logo.svg'

const NAV_LINKS = [
  { href: '#how', label: 'How it works' },
  { href: '#features', label: 'Features' },
  { href: '#pricing', label: 'Pricing' },
  { href: '#faq', label: 'FAQ' },
]

export function SiteNav() {
  const [menuOpen, setMenuOpen] = useState(false)
  const closeMenu = () => setMenuOpen(false)

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'rgba(248, 250, 252, 0.85)',
        backdropFilter: 'blur(8px)',
        borderBottom: '1px solid var(--border-subtle)',
      }}
    >
      <div
        style={{
          width: CONTAINER,
          margin: '0 auto',
          padding: `0 ${PAD_X}`,
          display: 'flex',
          alignItems: 'center',
          height: 80,
          gap: 20,
        }}
      >
        <a href="#top" style={{ display: 'flex', alignItems: 'center' }}>
          <img src={logoUrl} alt="grep.pdf" style={{ height: 56, display: 'block' }} />
        </a>
        <nav
          className="gp-nav-links"
          style={{ gap: 24, marginLeft: 12, fontSize: 14, color: 'var(--text-muted)' }}
        >
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href} style={{ color: 'inherit' }}>
              {link.label}
            </a>
          ))}
        </nav>
        <div style={{ flex: 1 }} />
        <div className="gp-nav-actions" style={{ gap: 16, alignItems: 'center' }}>
          <a href="#" style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-body)' }}>
            Sign in
          </a>
          <Button variant="primary" size="sm">
            Upload a PDF
          </Button>
        </div>
        <button
          type="button"
          className="gp-hamburger"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label="Menu"
          aria-expanded={menuOpen}
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            width: 40,
            height: 40,
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
          }}
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--ink-900)"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
      </div>

      {menuOpen && (
        <div
          className="gp-mobile-panel"
          style={{
            display: 'flex',
            flexDirection: 'column',
            padding: `8px ${PAD_X} 20px`,
            background: 'var(--surface-card)',
            borderBottom: '1px solid var(--border-subtle)',
          }}
        >
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={closeMenu}
              style={{
                color: 'var(--text-body)',
                padding: '10px 0',
                borderBottom: '1px solid var(--border-subtle)',
                fontSize: 15,
              }}
            >
              {link.label}
            </a>
          ))}
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', paddingTop: 14 }}>
            <a
              href="#"
              onClick={closeMenu}
              style={{ fontSize: 15, fontWeight: 500, color: 'var(--text-body)' }}
            >
              Sign in
            </a>
            <div style={{ flex: 1 }} />
            <Button variant="primary" size="sm">
              Upload a PDF
            </Button>
          </div>
        </div>
      )}
    </header>
  )
}
