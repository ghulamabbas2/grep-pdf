import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { Link, useParams } from 'react-router'
import { UserMenu } from '../../components/UserMenu'
import { Button } from '../../components/ui/Button'
import { ApiError } from '../../lib/api'
import { useApi } from '../../lib/useApi'
import { ChatPanel, type StreamingState } from './components/ChatPanel'
import { PdfPanel } from './components/PdfPanel'
import type { ChatMessage, Citation, SessionDetail } from './types'
import './chat.css'

type LoadState = 'loading' | 'ready' | 'not_found' | 'error'

const EMPTY_STREAM: StreamingState = { active: false, text: '', citations: [] }

/** The ask-your-PDF workspace: PDF viewer (left) + streaming cited chat (right). */
export function ChatPage() {
  const { sessionId } = useParams()
  const api = useApi()

  const [load, setLoad] = useState<LoadState>('loading')
  const [session, setSession] = useState<SessionDetail | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [draft, setDraft] = useState('')
  const [streaming, setStreaming] = useState<StreamingState>(EMPTY_STREAM)
  const [error, setError] = useState<string | null>(null)
  const [activePage, setActivePage] = useState(1)
  const [highlightQuote, setHighlightQuote] = useState<string | null>(null)
  const [mobileView, setMobileView] = useState<'chat' | 'doc'>('chat')

  // Load session history + PDF on mount / when the session id changes.
  useEffect(() => {
    if (!sessionId) return
    let cancelled = false
    setLoad('loading')
    api
      .get<SessionDetail>(`/api/sessions/${sessionId}`)
      .then((detail) => {
        if (cancelled) return
        setSession(detail)
        setMessages(detail.messages)
        setLoad('ready')
      })
      .catch((err: unknown) => {
        if (cancelled) return
        if (err instanceof ApiError && err.status === 404) setLoad('not_found')
        else setLoad('error')
      })
    return () => {
      cancelled = true
    }
  }, [api, sessionId])

  const onJump = useCallback((page: number, quote: string) => {
    setActivePage(page)
    setHighlightQuote(quote || null)
    setMobileView('doc')
  }, [])

  const pdf = session?.pdf ?? null
  const canAsk = load === 'ready' && pdf?.status === 'ready' && !streaming.active

  const onSubmit = useCallback(async () => {
    const question = draft.trim()
    if (!question || !sessionId || streaming.active || !canAsk) return

    const userMessage: ChatMessage = {
      id: `local-user-${Date.now()}`,
      role: 'user',
      content: question,
      citations: null,
      created_at: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, userMessage])
    setDraft('')
    setError(null)
    setStreaming({ active: true, text: '', citations: [] })

    let text = ''
    let citations: Citation[] = []
    let failed = false

    try {
      await api.stream(`/api/sessions/${sessionId}/messages`, { question }, (event, data) => {
        if (event === 'token') {
          text += (data as { text: string }).text
          setStreaming((s) => ({ ...s, text }))
        } else if (event === 'citations') {
          citations = data as Citation[]
          setStreaming((s) => ({ ...s, citations }))
        } else if (event === 'error') {
          failed = true
          setError((data as { message: string }).message)
        }
      })

      if (!failed && (text || citations.length > 0)) {
        setMessages((prev) => [
          ...prev,
          {
            id: `local-assistant-${Date.now()}`,
            role: 'assistant',
            content: text,
            citations: citations.length > 0 ? citations : null,
            created_at: new Date().toISOString(),
          },
        ])
        if (citations.length > 0) onJump(citations[0].page, citations[0].quote)
      }
    } catch (err: unknown) {
      // Failed before streaming started (e.g. 409 not ready, 422 invalid) — the
      // question was never persisted, so drop the optimistic user message.
      setError(err instanceof ApiError ? err.message : 'Something went wrong.')
      setMessages((prev) => prev.filter((m) => m.id !== userMessage.id))
    } finally {
      setStreaming(EMPTY_STREAM)
    }
  }, [api, canAsk, draft, onJump, sessionId, streaming.active])

  if (load === 'loading') {
    return <CenteredNote text="Loading session…" />
  }
  if (load === 'not_found') {
    return (
      <CenteredNote text="This session doesn't exist or isn't yours.">
        <Link to="/dashboard">
          <Button variant="outline">Back to dashboard</Button>
        </Link>
      </CenteredNote>
    )
  }
  if (load === 'error' || !session) {
    return (
      <CenteredNote text="Couldn't load this session.">
        <Link to="/dashboard">
          <Button variant="outline">Back to dashboard</Button>
        </Link>
      </CenteredNote>
    )
  }

  const notice = !pdf
    ? 'This session has no document to search yet.'
    : pdf.status !== 'ready'
      ? "This document is still being processed — you'll be able to ask questions once it's ready."
      : null

  return (
    <div className="gp-shell">
      <header className="gp-hdr">
        <HeaderMark />
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 600,
            fontSize: 17,
            letterSpacing: 'var(--tracking-tight)',
          }}
        >
          grep<span style={{ color: 'var(--slate-400)' }}>.pdf</span>
        </span>
        <div style={{ flex: 1 }} />
        <UserMenu />
      </header>

      <div className="gp-app" data-mv={mobileView}>
        <div className="gp-tabs">
          <button
            type="button"
            className="gp-tab"
            data-on={mobileView === 'doc' ? '1' : '0'}
            onClick={() => setMobileView('doc')}
          >
            Document
          </button>
          <button
            type="button"
            className="gp-tab"
            data-on={mobileView === 'chat' ? '1' : '0'}
            onClick={() => setMobileView('chat')}
          >
            Chat
          </button>
        </div>

        {pdf ? (
          <PdfPanel
            pdf={pdf}
            activePage={activePage}
            highlightQuote={highlightQuote}
            onPageChange={setActivePage}
          />
        ) : (
          <div className="gp-pane gp-pdf" style={{ alignItems: 'center', justifyContent: 'center' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', padding: 24 }}>
              No document attached to this session.
            </p>
          </div>
        )}

        <ChatPanel
          messages={messages}
          streaming={streaming}
          sourceName={pdf?.filename ?? 'PDF'}
          draft={draft}
          canAsk={canAsk}
          notice={notice}
          error={error}
          onDraftChange={setDraft}
          onSubmit={onSubmit}
          onJump={onJump}
        />
      </div>
    </div>
  )
}

function HeaderMark() {
  return (
    <span
      style={{
        width: 30,
        height: 30,
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--color-accent)',
        color: 'var(--ink-900)',
        borderRadius: 9,
        fontFamily: 'var(--font-display)',
        fontWeight: 700,
        fontSize: 16,
        lineHeight: 1,
      }}
    >
      &gt;
    </span>
  )
}

function CenteredNote({ text, children }: { text: string; children?: ReactNode }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        padding: 24,
        background: 'var(--surface-page)',
        textAlign: 'center',
      }}
    >
      <p style={{ margin: 0, fontSize: 'var(--text-md)', color: 'var(--text-muted)' }}>{text}</p>
      {children}
    </div>
  )
}
