// Shapes returned by the dashboard endpoints (backend app/schemas/session.py,
// stats.py), consumed via the typed API client.

export type Session = {
  id: string
  title: string
  pdf_filename: string | null
  preview: string | null
  /** The cited line from the latest answer, highlighted within the preview. */
  preview_quote: string | null
  created_at: string
}

export type Stats = {
  sessions_total: number
  sessions_this_week: number
  questions_asked: number
  answers: number
  citations_found: number
  pdfs_indexed: number
  pages_indexed: number
}

export type SortKey = 'recent' | 'old' | 'az'
