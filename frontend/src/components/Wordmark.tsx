/**
 * The grep.pdf brand lockup: the ink icon (rounded square + yellow `>` cursor)
 * next to the "grep.pdf" wordmark. Composed from an icon + styled text rather
 * than the padded logo.svg so it can be sized precisely in tight layouts.
 * Icon geometry is lifted from src/assets/logo.svg.
 */
export function Wordmark({ iconSize = 42 }: { iconSize?: number }) {
  const fontSize = Math.round(iconSize * 0.64)

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: iconSize * 0.28 }}>
      <svg
        viewBox="40 36 66 66"
        width={iconSize}
        height={iconSize}
        style={{ display: 'block', flexShrink: 0 }}
        role="img"
        aria-label="grep.pdf"
      >
        <rect x="40" y="36" width="66" height="66" rx="14" fill="var(--ink-900)" />
        <path
          d="M56 56 L70 72 L56 88"
          fill="none"
          stroke="var(--yellow-500)"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <rect x="76" y="83" width="18" height="5" rx="2.5" fill="var(--yellow-500)" />
      </svg>
      <span
        style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 600,
          fontSize,
          letterSpacing: 'var(--tracking-tight)',
          lineHeight: 1,
        }}
      >
        <span style={{ color: 'var(--ink-900)' }}>grep</span>
        <span style={{ color: 'var(--slate-400)' }}>.pdf</span>
      </span>
    </span>
  )
}
