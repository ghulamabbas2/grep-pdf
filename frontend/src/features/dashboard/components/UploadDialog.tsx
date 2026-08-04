import { Button } from '../../../components/ui/Button'
import { Dialog } from '../../../components/ui/Dialog'
import { UploadIcon } from './icons'

/**
 * Upload modal — placeholder for now. Real PDF upload lands in the next branch;
 * the actions just log and close (no network request).
 */
export function UploadDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const logAndClose = () => {
    // TODO(upload branch): replace this placeholder log with the real upload flow.
    console.log('[dashboard] upload placeholder clicked')
    onClose()
  }

  return (
    <Dialog open={open} onClose={onClose} title="Upload a PDF" width={380}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <label
          style={{
            border: '1.5px dashed var(--border-default)',
            borderRadius: 'var(--radius-lg)',
            background: 'var(--surface-inset)',
            padding: '34px 20px',
            textAlign: 'center',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 10,
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
            Drag a PDF here, or click to browse
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--slate-500)' }}>
            PDF · up to 50 MB
          </span>
          {/* Inert for now — wired up in the upload branch. */}
          <input type="file" accept="application/pdf" style={{ display: 'none' }} disabled />
        </label>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={logAndClose}>
            Upload &amp; start
          </Button>
        </div>
      </div>
    </Dialog>
  )
}
