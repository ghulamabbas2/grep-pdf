import { useMemo } from 'react'
import { Button } from '../../../components/ui/Button'
import { Card } from '../../../components/ui/Card'
import { Input } from '../../../components/ui/Input'
import { relativeTime } from '../lib/format'
import type { Session, SortKey } from '../types'
import { ChevronRightIcon, FileIcon, SearchIcon } from './icons'

type SessionListProps = {
  sessions: Session[]
  query: string
  onQueryChange: (q: string) => void
  sort: SortKey
  onSortChange: (s: SortKey) => void
  onOpenSession: (id: string) => void
}

const SORTS: { key: SortKey; label: string }[] = [
  { key: 'recent', label: 'Recent' },
  { key: 'old', label: 'Oldest' },
  { key: 'az', label: 'A–Z' },
]

function haystack(s: Session): string {
  return `${s.title} ${s.pdf_filename ?? ''} ${s.preview ?? ''}`.toLowerCase()
}

/** Searchable, sortable list of the user's sessions. Filter/sort are client-side. */
export function SessionList({
  sessions,
  query,
  onQueryChange,
  sort,
  onSortChange,
  onOpenSession,
}: SessionListProps) {
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    const filtered = q ? sessions.filter((s) => haystack(s).includes(q)) : sessions
    // `sessions` arrives newest-first from the API, so index order is "recent".
    const withIndex = filtered.map((s, i) => ({ s, i }))
    withIndex.sort((a, b) =>
      sort === 'az'
        ? a.s.title.localeCompare(b.s.title)
        : sort === 'old'
          ? b.i - a.i
          : a.i - b.i,
    )
    return withIndex.map((x) => x.s)
  }, [sessions, query, sort])

  const count = visible.length

  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          flexWrap: 'wrap',
          marginTop: 8,
          marginBottom: 16,
        }}
      >
        <div style={{ flex: 1, minWidth: 200 }}>
          <Input
            placeholder="Search sessions, PDFs, or answers…"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            leftIcon={<SearchIcon size={16} />}
          />
        </div>
        <div
          style={{
            display: 'flex',
            gap: 3,
            background: 'var(--slate-100)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 10,
            padding: 3,
            flexShrink: 0,
          }}
        >
          {SORTS.map((s) => (
            <button
              key={s.key}
              type="button"
              className="gp-seg"
              data-active={sort === s.key}
              onClick={() => onSortChange(s.key)}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 10, padding: '0 2px' }}>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11.5,
            letterSpacing: '0.04em',
            color: 'var(--slate-500)',
          }}
        >
          &gt; {count} {count === 1 ? 'session' : 'sessions'}
        </span>
      </div>

      {count === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '56px 20px',
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
            No sessions match “{query}”
          </div>
          <p style={{ margin: '0 0 16px', fontSize: 14, color: 'var(--text-muted)' }}>
            Try a different term, or clear the search.
          </p>
          <Button variant="outline" size="sm" onClick={() => onQueryChange('')}>
            Clear search
          </Button>
        </div>
      ) : (
        <Card padding="none" style={{ overflow: 'hidden' }}>
          {visible.map((s, idx) => (
            <button
              key={s.id}
              type="button"
              className="gp-row"
              onClick={() => onOpenSession(s.id)}
              style={{
                width: '100%',
                textAlign: 'left',
                display: 'flex',
                gap: 15,
                alignItems: 'flex-start',
                padding: '17px 18px',
                background: 'transparent',
                border: 'none',
                borderTop: idx === 0 ? 'none' : '1px solid var(--border-subtle)',
                cursor: 'pointer',
                font: 'inherit',
                color: 'var(--text-body)',
              }}
            >
              <span
                className="gp-filetile"
                style={{
                  width: 40,
                  height: 40,
                  flexShrink: 0,
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--slate-100)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--slate-500)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginTop: 2,
                }}
              >
                <FileIcon size={19} />
              </span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span
                  style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    justifyContent: 'space-between',
                    gap: 14,
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: 15.5,
                      fontWeight: 600,
                      letterSpacing: '-0.01em',
                      color: 'var(--ink-900)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {s.title}
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 12,
                      color: 'var(--slate-400)',
                      flexShrink: 0,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {relativeTime(s.created_at)}
                  </span>
                </span>
                {/* Plain preview for now: highlighting the cited span needs
                    citation offsets we won't have until RAG lands. */}
                {s.preview && (
                  <span
                    style={{
                      display: 'block',
                      fontSize: 13.5,
                      lineHeight: 1.5,
                      color: 'var(--text-muted)',
                      marginTop: 5,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {s.preview}
                  </span>
                )}
                {s.pdf_filename && (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      marginTop: 10,
                      height: 20,
                      padding: '0 8px',
                      borderRadius: 'var(--radius-pill)',
                      background: 'var(--surface-inset)',
                      border: '1px solid var(--border-subtle)',
                      fontFamily: 'var(--font-mono)',
                      fontSize: 11.5,
                      color: 'var(--slate-500)',
                    }}
                  >
                    <FileIcon size={12} />
                    {s.pdf_filename}
                  </span>
                )}
              </span>
              <span className="gp-chev" style={{ color: 'var(--slate-300)', marginTop: 11, flexShrink: 0 }}>
                <ChevronRightIcon size={18} />
              </span>
            </button>
          ))}
        </Card>
      )}
    </div>
  )
}
