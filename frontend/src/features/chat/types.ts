/** Shapes returned by the chat API (docs/api.md), mirrored from backend schemas. */

export type Citation = {
  page: number
  chunk_id: string
  quote: string
}

export type ChatMessage = {
  id: string
  role: 'user' | 'assistant'
  content: string
  citations: Citation[] | null
  created_at: string
}

export type PdfRef = {
  id: string
  filename: string
  num_pages: number | null
  status: string
}

export type SessionDetail = {
  id: string
  title: string
  pdf: PdfRef | null
  messages: ChatMessage[]
}
