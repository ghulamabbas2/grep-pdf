import { useEffect, useMemo, useState } from 'react'
import { useUser } from '@clerk/react'
import { Link, useNavigate } from 'react-router'
import { ApiError } from '../../lib/api'
import { useApi } from '../../lib/useApi'
import { Button } from '../../components/ui/Button'
import { Wordmark } from '../../components/Wordmark'
import './dashboard.css'
import type { Session, SortKey, Stats } from './types'
import { EmptyState } from './components/EmptyState'
import { MenuIcon, PlusIcon } from './components/icons'
import { SessionList } from './components/SessionList'
import { Sidebar, type SidebarDoc } from './components/Sidebar'
import { StatsCards } from './components/StatsCards'
import { UploadDialog } from './components/UploadDialog'

type LoadState = 'loading' | 'error' | 'ready'

/** The signed-in dashboard: sessions list + stats, scoped to the current user. */
export function DashboardPage() {
  const api = useApi()
  const navigate = useNavigate()
  const { user } = useUser()

  const [status, setStatus] = useState<LoadState>('loading')
  const [sessions, setSessions] = useState<Session[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<SortKey>('recent')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    let active = true
    setStatus('loading')
    Promise.all([api.get<Session[]>('/api/sessions'), api.get<Stats>('/api/stats')])
      .then(([sessionData, statsData]) => {
        if (!active) return
        setSessions(sessionData)
        setStats(statsData)
        setStatus('ready')
      })
      .catch((err: unknown) => {
        if (!active) return
        console.error('[dashboard] failed to load', err instanceof ApiError ? err.code : err)
        setStatus('error')
      })
    return () => {
      active = false
    }
  }, [api])

  const docs = useMemo<SidebarDoc[]>(() => {
    const counts = new Map<string, number>()
    for (const s of sessions) {
      if (s.pdf_filename) counts.set(s.pdf_filename, (counts.get(s.pdf_filename) ?? 0) + 1)
    }
    return [...counts.entries()].map(([name, n]) => ({
      name,
      meta: `${n} session${n === 1 ? '' : 's'}`,
    }))
  }, [sessions])

  const openDialog = () => {
    setDialogOpen(true)
    setSidebarOpen(false)
  }
  const firstName = user?.firstName ?? 'there'
  const isFirstTime = status === 'ready' && sessions.length === 0

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--surface-page)' }}>
      <Sidebar docs={docs} onNewSession={openDialog} isOpen={sidebarOpen} />

      <div
        className={`gp-backdrop${sidebarOpen ? ' is-open' : ''}`}
        onClick={() => setSidebarOpen(false)}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(30, 27, 75, 0.42)',
          backdropFilter: 'blur(2px)',
          zIndex: 60,
        }}
      />

      <main style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <header
          className="gp-topbar"
          style={{
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            padding: '11px 14px',
            background: 'rgba(248, 250, 252, 0.85)',
            backdropFilter: 'blur(8px)',
            borderBottom: '1px solid var(--border-subtle)',
            position: 'sticky',
            top: 0,
            zIndex: 40,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              type="button"
              aria-label="Open menu"
              onClick={() => setSidebarOpen((open) => !open)}
              style={{
                width: 38,
                height: 38,
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-default)',
                background: 'var(--surface-card)',
                color: 'var(--ink-900)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <MenuIcon size={18} />
            </button>
            <Link to="/" aria-label="grep.pdf home" style={{ display: 'inline-flex' }}>
              <Wordmark iconSize={30} />
            </Link>
          </div>
          <Button variant="primary" size="sm" onClick={openDialog} leftIcon={<PlusIcon size={15} />}>
            New
          </Button>
        </header>

        <div className="gp-content gp-scroll" style={{ flex: 1, overflowY: 'auto', padding: '36px 44px 72px' }}>
          <div style={{ maxWidth: 1000, margin: '0 auto' }}>
            <div
              className="gp-pagehead"
              style={{
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'space-between',
                gap: 16,
                marginBottom: 26,
              }}
            >
              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 12,
                    letterSpacing: '0.04em',
                    color: 'var(--slate-500)',
                    marginBottom: 8,
                  }}
                >
                  &gt; welcome back, {firstName}
                </div>
                <h1
                  className="gp-h1"
                  style={{
                    margin: 0,
                    fontFamily: 'var(--font-display)',
                    fontSize: 30,
                    fontWeight: 600,
                    letterSpacing: 'var(--tracking-tight)',
                    color: 'var(--ink-900)',
                    lineHeight: 1.1,
                  }}
                >
                  Sessions
                </h1>
                <p
                  style={{
                    margin: '8px 0 0',
                    fontSize: 14.5,
                    color: 'var(--text-muted)',
                    maxWidth: '52ch',
                  }}
                >
                  Pick up a past conversation, or start a new one. Every answer keeps the exact line
                  it came from.
                </p>
              </div>
              <div className="gp-pagehead-new" style={{ flexShrink: 0 }}>
                <Button variant="primary" onClick={openDialog} leftIcon={<PlusIcon size={16} />}>
                  New session
                </Button>
              </div>
            </div>

            {status === 'loading' && (
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 13,
                  color: 'var(--text-muted)',
                  padding: '40px 2px',
                }}
              >
                &gt; loading sessions…
              </div>
            )}

            {status === 'error' && (
              <div
                style={{
                  textAlign: 'center',
                  padding: '48px 20px',
                  border: '1px dashed var(--border-default)',
                  borderRadius: 'var(--radius-lg)',
                  background: 'var(--surface-card)',
                }}
              >
                <div
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 18,
                    fontWeight: 600,
                    color: 'var(--ink-900)',
                    marginBottom: 6,
                  }}
                >
                  Couldn’t load your dashboard
                </div>
                <p style={{ margin: '0 0 16px', fontSize: 14, color: 'var(--text-muted)' }}>
                  Something went wrong fetching your sessions. Please try again.
                </p>
                <Button variant="outline" size="sm" onClick={() => location.reload()}>
                  Retry
                </Button>
              </div>
            )}

            {status === 'ready' && isFirstTime && <EmptyState onUpload={openDialog} />}

            {status === 'ready' && !isFirstTime && (
              <>
                {stats && <StatsCards stats={stats} />}
                <SessionList
                  sessions={sessions}
                  query={query}
                  onQueryChange={setQuery}
                  sort={sort}
                  onSortChange={setSort}
                  onOpenSession={(id) => navigate(`/chat/${id}`)}
                />
              </>
            )}
          </div>
        </div>
      </main>

      <UploadDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </div>
  )
}
