import type { ReactNode } from 'react'
import { Card } from '../../../components/ui/Card'
import { formatCount } from '../lib/format'
import type { Stats } from '../types'
import { CheckBadgeIcon, FileIcon, ListIcon, SearchIcon } from './icons'

type Metric = {
  label: string
  value: string
  sub: string
  icon: ReactNode
  underline?: boolean
}

function buildMetrics(stats: Stats): Metric[] {
  const thisWeek = stats.sessions_this_week
  return [
    {
      label: 'Sessions',
      value: formatCount(stats.sessions_total),
      sub: `${thisWeek} this week`,
      icon: <ListIcon size={15} />,
    },
    {
      label: 'Questions asked',
      value: formatCount(stats.questions_asked),
      sub: 'across your PDFs',
      icon: <SearchIcon size={15} />,
    },
    {
      // Stands in for the design's "citations" card until citations are tracked;
      // keeps the yellow underline accent that slot carries.
      label: 'Answers',
      value: formatCount(stats.answers),
      sub: 'every answer sourced',
      icon: <CheckBadgeIcon size={15} />,
      underline: true,
    },
    {
      label: 'PDFs indexed',
      value: formatCount(stats.pdfs_indexed),
      sub: `${formatCount(stats.pages_indexed)} pages`,
      icon: <FileIcon size={15} />,
    },
  ]
}

/** The four aggregate stat cards, in a hairline-divided responsive grid. */
export function StatsCards({ stats }: { stats: Stats }) {
  return (
    <Card padding="none" style={{ overflow: 'hidden', marginBottom: 28 }}>
      <div className="gp-metrics">
        {buildMetrics(stats).map((m) => (
          <div key={m.label} style={{ background: 'var(--surface-card)', padding: '20px 22px 22px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 7,
                color: 'var(--slate-500)',
                marginBottom: 12,
              }}
            >
              <span style={{ display: 'inline-flex' }}>{m.icon}</span>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11,
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                }}
              >
                {m.label}
              </span>
            </div>
            <div
              style={{
                display: 'inline-block',
                fontFamily: 'var(--font-display)',
                fontSize: 30,
                fontWeight: 600,
                letterSpacing: 'var(--tracking-tight)',
                color: 'var(--ink-900)',
                lineHeight: 1,
                borderBottom: m.underline ? '3px solid var(--highlight-bar)' : 'none',
              }}
            >
              {m.value}
            </div>
            <div style={{ marginTop: 9, fontSize: 12.5, color: 'var(--text-muted)' }}>{m.sub}</div>
          </div>
        ))}
      </div>
    </Card>
  )
}
