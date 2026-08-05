import { useEffect, useRef } from 'react'
import { Badge } from '../../../components/ui/Badge'
import { ChatBubble } from '../../../components/ui/ChatBubble'
import { Citation as CitationCard } from '../../../components/ui/Citation'
import type { ChatMessage, Citation } from '../types'

export type StreamingState = {
  active: boolean
  text: string
  citations: Citation[]
}

type ChatPanelProps = {
  messages: ChatMessage[]
  streaming: StreamingState
  sourceName: string
  draft: string
  canAsk: boolean
  notice: string | null
  error: string | null
  onDraftChange: (value: string) => void
  onSubmit: () => void
  onJump: (page: number, quote: string) => void
}

/** Right panel: the answer thread + the "ask this PDF" composer. */
export function ChatPanel({
  messages,
  streaming,
  sourceName,
  draft,
  canAsk,
  notice,
  error,
  onDraftChange,
  onSubmit,
  onJump,
}: ChatPanelProps) {
  const threadRef = useRef<HTMLDivElement | null>(null)

  // Keep the newest message / streamed tokens in view.
  useEffect(() => {
    const el = threadRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages, streaming])

  return (
    <div className="gp-pane gp-chat">
      <div
        style={{
          height: 52,
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '0 18px',
          background: 'var(--surface-card)',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        <span style={{ color: 'var(--color-accent-press)', display: 'inline-flex' }}>
          <SparkleIcon />
        </span>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 15 }}>
          Ask this PDF
        </span>
        <div style={{ flex: 1 }} />
        <Badge variant="accent" size="sm">
          answers cite the source
        </Badge>
      </div>

      <div
        ref={threadRef}
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '22px 18px',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}
      >
        {messages.map((message) =>
          message.role === 'user' ? (
            <ChatBubble key={message.id} role="user">
              {message.content}
            </ChatBubble>
          ) : (
            <AssistantMessage
              key={message.id}
              text={message.content}
              citations={message.citations ?? []}
              sourceName={sourceName}
              onJump={onJump}
            />
          ),
        )}

        {streaming.active &&
          (streaming.text ? (
            <AssistantMessage
              text={streaming.text}
              citations={streaming.citations}
              sourceName={sourceName}
              streaming
              onJump={onJump}
            />
          ) : (
            <ChatBubble role="assistant">
              <span
                style={{
                  display: 'inline-flex',
                  gap: 4,
                  alignItems: 'center',
                  color: 'var(--text-muted)',
                }}
              >
                <span className="gp-dot" />
                <span className="gp-dot" style={{ animationDelay: '0.15s' }} />
                <span className="gp-dot" style={{ animationDelay: '0.3s' }} />
                <span style={{ marginLeft: 5, fontSize: 13 }}>searching the document…</span>
              </span>
            </ChatBubble>
          ))}

        {error && (
          <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--color-danger)' }}>
            {error}
          </p>
        )}
      </div>

      <div
        style={{
          flexShrink: 0,
          padding: '14px 18px 18px',
          background: 'var(--surface-card)',
          borderTop: '1px solid var(--border-subtle)',
        }}
      >
        {notice && (
          <p style={{ margin: '0 0 10px', fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
            {notice}
          </p>
        )}
        <form
          onSubmit={(e) => {
            e.preventDefault()
            onSubmit()
          }}
        >
          <div className="gp-composer">
            <span
              style={{
                color: 'var(--color-accent-press)',
                fontFamily: 'var(--font-mono)',
                fontWeight: 600,
                flexShrink: 0,
              }}
            >
              &gt;
            </span>
            <input
              placeholder="Ask this PDF anything…"
              value={draft}
              disabled={!canAsk}
              maxLength={2000}
              onChange={(e) => onDraftChange(e.target.value)}
            />
            <button
              type="submit"
              className="gp-send"
              disabled={!canAsk || draft.trim().length === 0}
              aria-label="Send"
            >
              <SendIcon />
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

type AssistantMessageProps = {
  text: string
  citations: Citation[]
  sourceName: string
  streaming?: boolean
  onJump: (page: number, quote: string) => void
}

function AssistantMessage({
  text,
  citations,
  sourceName,
  streaming = false,
  onJump,
}: AssistantMessageProps) {
  // Unique pages, in first-seen order, for the quick-jump chip row.
  const pages: number[] = []
  for (const citation of citations) {
    if (!pages.includes(citation.page)) pages.push(citation.page)
  }
  const quoteForPage = (page: number) =>
    citations.find((citation) => citation.page === page)?.quote ?? ''

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <ChatBubble role="assistant">
        {text}
        {streaming && <span className="gp-cursor" />}
      </ChatBubble>

      {citations.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: '88%' }}>
          {pages.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {pages.map((page) => (
                <button
                  key={page}
                  type="button"
                  className="gp-cite-chip"
                  onClick={() => onJump(page, quoteForPage(page))}
                >
                  &rsaquo; p.{page}
                </button>
              ))}
            </div>
          )}
          {citations.map((citation, index) => (
            <CitationCard
              key={`${citation.chunk_id}-${index}`}
              page={citation.page}
              source={sourceName}
              quote={citation.quote}
              onJump={() => onJump(citation.page, citation.quote)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function SparkleIcon() {
  return (
    <svg
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z" />
    </svg>
  )
}

function SendIcon() {
  return (
    <svg
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 2 11 13" />
      <path d="M22 2 15 22 11 13 2 9 22 2z" />
    </svg>
  )
}
