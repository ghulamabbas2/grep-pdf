import { useUser } from '@clerk/react'
import { Link } from 'react-router'
import { Button } from '../../../components/ui/Button'
import { UserMenu } from '../../../components/UserMenu'
import { Wordmark } from '../../../components/Wordmark'
import { FileIcon, PlusIcon } from './icons'

export type SidebarDoc = { name: string; meta: string }

type SidebarProps = {
  docs: SidebarDoc[]
  onNewSession: () => void
  isOpen: boolean
}

/**
 * Left rail: logo, "New session" CTA, the user's documents, and an account
 * footer. On narrow widths it becomes an off-canvas drawer (see dashboard.css);
 * `isOpen` toggles the `is-open` class.
 */
export function Sidebar({ docs, onNewSession, isOpen }: SidebarProps) {
  const { user } = useUser()
  const email = user?.primaryEmailAddress?.emailAddress ?? ''

  return (
    <aside
      className={`gp-sidebar${isOpen ? ' is-open' : ''}`}
      style={{
        width: 264,
        flexShrink: 0,
        background: 'var(--surface-card)',
        borderRight: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'sticky',
        top: 0,
      }}
    >
      <div style={{ padding: '20px 16px 16px' }}>
        <Link to="/" aria-label="grep.pdf home" style={{ display: 'inline-flex' }}>
          <Wordmark iconSize={46} />
        </Link>
      </div>

      <div style={{ padding: '4px 12px 14px' }}>
        <Button variant="primary" fullWidth onClick={onNewSession} leftIcon={<PlusIcon size={16} />}>
          New session
        </Button>
      </div>

      <div
        style={{
          padding: '6px 18px 6px',
          fontSize: 11,
          fontFamily: 'var(--font-mono)',
          letterSpacing: '0.07em',
          textTransform: 'uppercase',
          color: 'var(--text-faint)',
        }}
      >
        Your documents
      </div>

      <div className="gp-scroll" style={{ flex: 1, overflowY: 'auto', padding: '2px 8px 8px' }}>
        {docs.length === 0 ? (
          <div style={{ padding: '10px 12px', fontSize: 13, color: 'var(--text-faint)' }}>
            No PDFs yet.
          </div>
        ) : (
          docs.map((d) => (
            <div
              key={d.name}
              className="gp-navitem"
              style={{
                display: 'flex',
                gap: 10,
                alignItems: 'flex-start',
                padding: '9px 10px',
                marginBottom: 2,
                borderRadius: 'var(--radius-md)',
                border: '1px solid transparent',
                color: 'var(--text-body)',
              }}
            >
              <span style={{ color: 'var(--text-faint)', marginTop: 1, flexShrink: 0 }}>
                <FileIcon size={16} />
              </span>
              <span style={{ minWidth: 0, flex: 1 }}>
                <span
                  style={{
                    display: 'block',
                    fontSize: 13.5,
                    fontWeight: 500,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {d.name}
                </span>
                <span
                  style={{
                    display: 'block',
                    fontSize: 11,
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--text-faint)',
                    marginTop: 2,
                  }}
                >
                  {d.meta}
                </span>
              </span>
            </div>
          ))
        )}
      </div>

      <div
        style={{
          borderTop: '1px solid var(--border-subtle)',
          padding: '11px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: 9,
          minWidth: 0,
        }}
      >
        <UserMenu />
        <span
          style={{
            fontSize: 13,
            color: 'var(--text-muted)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {email}
        </span>
      </div>
    </aside>
  )
}
