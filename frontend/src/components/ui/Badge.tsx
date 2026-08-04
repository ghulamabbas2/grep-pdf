import type { CSSProperties, HTMLAttributes, ReactNode } from 'react'

type BadgeVariant = 'neutral' | 'accent' | 'ink' | 'outline'
type BadgeSize = 'sm' | 'md'

type BadgeProps = {
  variant?: BadgeVariant
  size?: BadgeSize
  children?: ReactNode
} & HTMLAttributes<HTMLSpanElement>

const variants: Record<BadgeVariant, CSSProperties> = {
  neutral: {
    background: 'var(--surface-inset)',
    color: 'var(--text-muted)',
    border: '1px solid var(--border-subtle)',
  },
  accent: {
    background: 'var(--highlight-bg)',
    color: 'var(--ink-900)',
    border: '1px solid var(--yellow-400)',
  },
  ink: {
    background: 'var(--surface-ink)',
    color: 'var(--text-on-ink)',
    border: '1px solid transparent',
  },
  outline: {
    background: 'transparent',
    color: 'var(--text-strong)',
    border: '1px solid var(--border-default)',
  },
}

/** Small status/label pill. */
export function Badge({ variant = 'neutral', size = 'md', children, style, ...rest }: BadgeProps) {
  const s =
    size === 'sm'
      ? { fs: 'var(--text-xs)', px: 7, h: 20 }
      : { fs: 'var(--text-sm)', px: 9, h: 24 }

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        height: s.h,
        padding: `0 ${s.px}px`,
        fontFamily: 'var(--font-body)',
        fontSize: s.fs,
        fontWeight: 'var(--weight-semibold)',
        letterSpacing: 'var(--tracking-tight)',
        borderRadius: 'var(--radius-pill)',
        whiteSpace: 'nowrap',
        ...variants[variant],
        ...style,
      }}
      {...rest}
    >
      {children}
    </span>
  )
}
