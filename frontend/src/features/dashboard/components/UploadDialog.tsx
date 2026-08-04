import { useEffect, useRef, useState } from 'react'
import { Button } from '../../../components/ui/Button'
import { Dialog } from '../../../components/ui/Dialog'
import { ApiError } from '../../../lib/api'
import { useApi } from '../../../lib/useApi'
import { UploadIcon } from './icons'

const MAX_BYTES = 50 * 1024 * 1024

// No semantic status tokens exist in the design system yet; keep these local.
const ACTIVE = 'var(--color-accent)'
const FAILED = '#b42318'
const DONE = '#1f8a5b'

/** Response shapes from the two-phase upload endpoints. */
type PdfOut = { id: string; filename: string; status: string }
type SessionOut = { id: string }

/** The three visible progress steps, in order. */
const STEPS = [
  { key: 'uploading', label: 'Uploading' },
  { key: 'parsing', label: 'Parsing' },
  { key: 'indexing', label: 'Indexing' },
] as const
type Stage = (typeof STEPS)[number]['key'] | 'done'

type UploadDialogProps = {
  open: boolean
  onClose: () => void
  onSuccess: (sessionId: string) => void
}

/**
 * Upload modal: drop or pick a PDF (≤ 50 MB), then a two-phase flow —
 * `POST /api/pdfs` stores the file (real upload %), `POST /api/pdfs/{id}/process`
 * parses/indexes it and returns a session. Progress shows per step; a failure is
 * shown inline and can be retried without re-uploading (the stored `pdfId` is
 * reused). On success the caller redirects to `/chat/:sessionId`.
 */
export function UploadDialog({ open, onClose, onSuccess }: UploadDialogProps) {
  const api = useApi()

  const [file, setFile] = useState<File | null>(null)
  const [dragging, setDragging] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)

  const [busy, setBusy] = useState(false)
  const [stage, setStage] = useState<Stage>('uploading')
  const [uploadFraction, setUploadFraction] = useState(0)
  const [failure, setFailure] = useState<{ step: Stage; message: string } | null>(null)

  // Set once phase 1 succeeds, so a retry re-runs only phase 2.
  const pdfIdRef = useRef<string | null>(null)
  // Timer that advances the label from "parsing" to "indexing" during phase 2.
  const stageTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearStageTimer = () => {
    if (stageTimer.current) {
      clearTimeout(stageTimer.current)
      stageTimer.current = null
    }
  }

  // Reset everything each time the modal opens.
  useEffect(() => {
    if (open) {
      setFile(null)
      setDragging(false)
      setValidationError(null)
      setBusy(false)
      setStage('uploading')
      setUploadFraction(0)
      setFailure(null)
      pdfIdRef.current = null
    }
    return clearStageTimer
  }, [open])

  const chooseFile = (candidate: File | undefined) => {
    if (!candidate) return
    if (candidate.type !== 'application/pdf') {
      setValidationError('Only PDF files are accepted.')
      return
    }
    if (candidate.size > MAX_BYTES) {
      setValidationError('That PDF is larger than the 50 MB limit.')
      return
    }
    setValidationError(null)
    setFailure(null)
    pdfIdRef.current = null // a new file invalidates any prior upload
    setFile(candidate)
  }

  const run = async () => {
    if (!file) return
    setBusy(true)
    setFailure(null)

    try {
      // Phase 1 — upload + store (skipped on retry when already uploaded).
      if (!pdfIdRef.current) {
        setStage('uploading')
        setUploadFraction(0)
        const form = new FormData()
        form.append('file', file)
        const pdf = await api.upload<PdfOut>('/api/pdfs', form, setUploadFraction)
        pdfIdRef.current = pdf.id
      }

      // Phase 2 — parse/chunk/embed + create session (one request; the label
      // advances optimistically from parsing to indexing while we wait).
      setStage('parsing')
      clearStageTimer()
      stageTimer.current = setTimeout(() => setStage('indexing'), 1200)
      const session = await api.post<SessionOut>(`/api/pdfs/${pdfIdRef.current}/process`)

      clearStageTimer()
      setStage('done')
      onSuccess(session.id)
    } catch (err) {
      clearStageTimer()
      const failedStep: Stage = pdfIdRef.current ? stage : 'uploading'
      const message =
        err instanceof ApiError ? err.message : 'Something went wrong. Please try again.'
      setFailure({ step: failedStep, message })
      setBusy(false)
    }
  }

  const canRetryWithoutUpload = pdfIdRef.current !== null

  return (
    <Dialog open={open} onClose={busy ? () => {} : onClose} title="Upload a PDF" width={420}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {!busy && !failure ? (
          <DropZone
            file={file}
            dragging={dragging}
            onDragging={setDragging}
            onChoose={chooseFile}
          />
        ) : (
          <StepList stage={stage} uploadFraction={uploadFraction} failure={failure} />
        )}

        {validationError && <InlineError message={validationError} />}
        {failure && <InlineError message={failure.message} />}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          {!busy && (
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
          )}
          {failure ? (
            <Button variant="primary" onClick={run}>
              {canRetryWithoutUpload ? 'Retry' : 'Try again'}
            </Button>
          ) : (
            <Button variant="primary" onClick={run} disabled={!file || busy}>
              {busy ? 'Working…' : 'Upload & start'}
            </Button>
          )}
        </div>
      </div>
    </Dialog>
  )
}

function DropZone({
  file,
  dragging,
  onDragging,
  onChoose,
}: {
  file: File | null
  dragging: boolean
  onDragging: (value: boolean) => void
  onChoose: (file: File | undefined) => void
}) {
  return (
    <label
      onDragOver={(e) => {
        e.preventDefault()
        onDragging(true)
      }}
      onDragLeave={() => onDragging(false)}
      onDrop={(e) => {
        e.preventDefault()
        onDragging(false)
        onChoose(e.dataTransfer.files[0])
      }}
      style={{
        border: `1.5px dashed ${dragging ? 'var(--color-accent)' : 'var(--border-default)'}`,
        borderRadius: 'var(--radius-lg)',
        background: dragging ? 'var(--surface-card)' : 'var(--surface-inset)',
        padding: '34px 20px',
        textAlign: 'center',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 10,
        transition: 'border-color var(--dur-fast), background var(--dur-fast)',
      }}
    >
      <span
        style={{
          width: 48,
          height: 48,
          borderRadius: 'var(--radius-md)',
          background: 'var(--surface-card)',
          border: '1px solid var(--border-subtle)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--color-accent-press)',
        }}
      >
        <UploadIcon size={22} />
      </span>
      <span style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--ink-900)' }}>
        {file ? file.name : 'Drag a PDF here, or click to browse'}
      </span>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--slate-500)' }}>
        {file ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` : 'PDF · up to 50 MB'}
      </span>
      <input
        type="file"
        accept="application/pdf"
        style={{ display: 'none' }}
        onChange={(e) => onChoose(e.target.files?.[0])}
      />
    </label>
  )
}

function StepList({
  stage,
  uploadFraction,
  failure,
}: {
  stage: Stage
  uploadFraction: number
  failure: { step: Stage; message: string } | null
}) {
  const order: Stage[] = ['uploading', 'parsing', 'indexing', 'done']
  const currentIndex = order.indexOf(stage)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '6px 2px' }}>
      {STEPS.map((step, index) => {
        let status: 'pending' | 'active' | 'done' | 'failed'
        if (failure && failure.step === step.key) status = 'failed'
        else if (stage === 'done' || index < currentIndex) status = 'done'
        else if (index === currentIndex) status = 'active'
        else status = 'pending'

        const showPct = status === 'active' && step.key === 'uploading'

        return (
          <div key={step.key} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <StatusDot status={status} />
            <span
              style={{
                fontSize: 14,
                fontWeight: status === 'pending' ? 500 : 600,
                color: status === 'pending' ? 'var(--slate-500)' : 'var(--ink-900)',
              }}
            >
              {step.label}
            </span>
            {showPct && (
              <span
                style={{
                  marginLeft: 'auto',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 12,
                  color: 'var(--slate-500)',
                }}
              >
                {Math.round(uploadFraction * 100)}%
              </span>
            )}
          </div>
        )
      })}
    </div>
  )
}

function StatusDot({ status }: { status: 'pending' | 'active' | 'done' | 'failed' }) {
  const color =
    status === 'done'
      ? DONE
      : status === 'failed'
        ? FAILED
        : status === 'active'
          ? ACTIVE
          : 'var(--border-strong)'

  return (
    <span
      aria-hidden
      style={{
        width: 18,
        height: 18,
        borderRadius: '50%',
        flexShrink: 0,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: status === 'pending' ? '2px solid var(--border-strong)' : 'none',
        background: status === 'pending' ? 'transparent' : color,
        color: '#fff',
        fontSize: 11,
      }}
    >
      {status === 'done' && '✓'}
      {status === 'failed' && '!'}
      {status === 'active' && (
        <span
          className="gp-spin"
          style={{
            width: 10,
            height: 10,
            borderRadius: '50%',
            border: '2px solid rgba(255,255,255,0.5)',
            borderTopColor: '#fff',
          }}
        />
      )}
    </span>
  )
}

function InlineError({ message }: { message: string }) {
  return (
    <p
      role="alert"
      style={{
        margin: 0,
        fontSize: 13,
        color: FAILED,
        background: 'rgba(180, 35, 24, 0.08)',
        border: '1px solid rgba(180, 35, 24, 0.2)',
        borderRadius: 'var(--radius-md)',
        padding: '10px 12px',
      }}
    >
      {message}
    </p>
  )
}
