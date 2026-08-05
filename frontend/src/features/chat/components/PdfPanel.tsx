import { useCallback, useEffect, useRef, useState } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/Page/TextLayer.css'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import { useApi } from '../../../lib/useApi'
import { ApiError } from '../../../lib/api'
import type { PdfRef } from '../types'

// Configure the pdf.js worker via Vite's URL handling (same module as usage).
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString()

type PdfPanelProps = {
  pdf: PdfRef
  activePage: number
  highlightQuote: string | null
  onPageChange: (page: number) => void
}

function normalize(text: string): string {
  return text.replace(/\s+/g, ' ').trim().toLowerCase()
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

/**
 * The left panel: the real PDF rendered as a continuous, scrollable stack of
 * pages (react-pdf / pdf.js). Prev/next and citation jumps scroll to a page;
 * the page indicator tracks whichever page is currently in view. The cited
 * quote is matched against the text layer and wrapped in a yellow `<mark>`.
 */
export function PdfPanel({ pdf, activePage, highlightQuote, onPageChange }: PdfPanelProps) {
  const api = useApi()
  const [fileUrl, setFileUrl] = useState<string | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [totalPages, setTotalPages] = useState<number | null>(pdf.num_pages)
  const [visiblePage, setVisiblePage] = useState(1)
  const [width, setWidth] = useState(0)

  const scrollRef = useRef<HTMLDivElement | null>(null)
  const pageEls = useRef<Map<number, HTMLDivElement>>(new Map())

  // Fetch the PDF bytes once (authenticated) and hand pdf.js an object URL.
  useEffect(() => {
    let revoked = false
    let url: string | null = null
    setFileUrl(null)
    setLoadError(null)
    api
      .getBlob(`/api/pdfs/${pdf.id}/file`)
      .then((blob) => {
        if (revoked) return
        url = URL.createObjectURL(blob)
        setFileUrl(url)
      })
      .catch((err: unknown) => {
        if (revoked) return
        setLoadError(err instanceof ApiError ? err.message : 'Could not load the PDF.')
      })
    return () => {
      revoked = true
      if (url) URL.revokeObjectURL(url)
    }
  }, [api, pdf.id])

  // Track the container width so pages fit the panel and stay responsive.
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const measure = () => setWidth(el.clientWidth - 52)
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const total = totalPages ?? pdf.num_pages ?? 1

  const setPageEl = useCallback(
    (pageNumber: number) => (el: HTMLDivElement | null) => {
      if (el) pageEls.current.set(pageNumber, el)
      else pageEls.current.delete(pageNumber)
    },
    [],
  )

  const scrollToPage = useCallback((pageNumber: number) => {
    const container = scrollRef.current
    const el = pageEls.current.get(pageNumber)
    if (container && el) {
      container.scrollTo({ top: el.offsetTop - 22, behavior: 'smooth' })
    }
  }, [])

  // Scroll to the active page whenever it changes (citation jump or nav).
  useEffect(() => {
    scrollToPage(activePage)
  }, [activePage, total, fileUrl, scrollToPage])

  // Keep the page indicator in sync with whatever page is in view.
  useEffect(() => {
    const container = scrollRef.current
    if (!container || !fileUrl) return
    const observer = new IntersectionObserver(
      (entries) => {
        let best: { page: number; ratio: number } | null = null
        for (const entry of entries) {
          const page = Number((entry.target as HTMLElement).dataset.page)
          if (!page) continue
          if (entry.isIntersecting && (!best || entry.intersectionRatio > best.ratio)) {
            best = { page, ratio: entry.intersectionRatio }
          }
        }
        if (best) setVisiblePage(best.page)
      },
      { root: container, threshold: [0.1, 0.25, 0.5, 0.75] },
    )
    for (const el of pageEls.current.values()) observer.observe(el)
    return () => observer.disconnect()
  }, [fileUrl, total])

  const textRenderer = useCallback(
    (textItem: { str: string }): string => {
      const str = textItem.str
      if (!highlightQuote || !str.trim()) return str
      const item = normalize(str)
      if (item.length >= 4 && normalize(highlightQuote).includes(item)) {
        return `<mark class="gp-pdf-hl">${escapeHtml(str)}</mark>`
      }
      return str
    },
    [highlightQuote],
  )

  const pageWidth = width > 0 ? Math.min(width, 820) : undefined

  return (
    <div className="gp-pane gp-pdf">
      <div
        style={{
          height: 52,
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '0 14px',
          background: 'var(--surface-card)',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        <span style={{ color: 'var(--color-accent-press)', display: 'inline-flex' }}>
          <FileGlyph />
        </span>
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 13.5,
            fontWeight: 600,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            flex: 1,
          }}
        >
          {pdf.filename}
        </span>
        <button
          className="gp-barbtn"
          onClick={() => onPageChange(Math.max(1, visiblePage - 1))}
          disabled={visiblePage <= 1}
          aria-label="Previous page"
        >
          <ChevronLeft />
        </button>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 12,
            color: 'var(--text-muted)',
            minWidth: 74,
            textAlign: 'center',
          }}
        >
          p.{visiblePage} / {total}
        </span>
        <button
          className="gp-barbtn"
          onClick={() => onPageChange(Math.min(total, visiblePage + 1))}
          disabled={visiblePage >= total}
          aria-label="Next page"
        >
          <ChevronRight />
        </button>
      </div>

      <div
        ref={scrollRef}
        style={{
          flex: 1,
          overflowY: 'auto',
          position: 'relative',
          padding: 26,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 22,
        }}
      >
        {loadError ? (
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', marginTop: 40 }}>
            {loadError}
          </p>
        ) : !fileUrl ? (
          <p style={{ color: 'var(--text-faint)', fontSize: 'var(--text-sm)', marginTop: 40 }}>
            Loading document…
          </p>
        ) : (
          <Document
            file={fileUrl}
            onLoadSuccess={({ numPages }) => setTotalPages(numPages)}
            onLoadError={() => setLoadError('Could not render the PDF.')}
            loading={
              <p style={{ color: 'var(--text-faint)', fontSize: 'var(--text-sm)', marginTop: 40 }}>
                Loading document…
              </p>
            }
          >
            {Array.from({ length: total }, (_, index) => index + 1).map((pageNumber) => (
              <div
                key={pageNumber}
                ref={setPageEl(pageNumber)}
                data-page={pageNumber}
                style={{ marginBottom: 22 }}
              >
                <Page
                  pageNumber={pageNumber}
                  width={pageWidth}
                  customTextRenderer={textRenderer}
                  renderAnnotationLayer={false}
                  renderTextLayer
                  className="gp-pdf-page"
                  loading={
                    <div
                      style={{
                        width: pageWidth ?? 480,
                        height: (pageWidth ?? 480) * 1.3,
                        background: 'var(--white)',
                        boxShadow: 'var(--shadow-md)',
                        borderRadius: 4,
                      }}
                    />
                  }
                />
              </div>
            ))}
          </Document>
        )}
      </div>
    </div>
  )
}

function FileGlyph() {
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
      <path d="M14 3v5h5" />
      <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    </svg>
  )
}

function ChevronLeft() {
  return (
    <svg
      width={15}
      height={15}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 18l-6-6 6-6" />
    </svg>
  )
}

function ChevronRight() {
  return (
    <svg
      width={15}
      height={15}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 18l6-6-6-6" />
    </svg>
  )
}
