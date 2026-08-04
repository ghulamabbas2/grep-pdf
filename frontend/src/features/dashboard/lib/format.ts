// Small display helpers for the dashboard.

/**
 * Human-friendly relative time for a session's `created_at`, matching the
 * design's cadence: "just now" → "2h ago" → "Yesterday" → "Mar 28".
 */
export function relativeTime(iso: string): string {
  const then = new Date(iso)
  const diffMs = Date.now() - then.getTime()
  if (Number.isNaN(diffMs)) return ''

  const minutes = Math.floor(diffMs / 60_000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`

  const days = Math.floor(hours / 24)
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days} days ago`

  return then.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

/** Compact number with thousands separators, e.g. 1204 → "1,204". */
export function formatCount(n: number): string {
  return n.toLocaleString('en-US')
}
