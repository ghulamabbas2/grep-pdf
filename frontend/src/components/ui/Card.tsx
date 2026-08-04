import type { CSSProperties, HTMLAttributes, ReactNode } from 'react'

type CardVariant = 'raised' | 'flat' | 'inset' | 'ink'
type CardPadding = 'none' | 'sm' | 'md' | 'lg'

type CardProps = {
  variant?: CardVariant
  padding?: CardPadding
  children?: ReactNode
} & HTMLAttributes<HTMLDivElement>

const variants: Record<CardVariant, CSSProperties> = {
  raised: {
    background: 'var(--surface-card)',
    border: '1px solid var(--border-subtle)',
    boxShadow: 'var(--shadow-md)',
  },
  flat: {
    background: 'var(--surface-card)',
    border: '1px solid var(--border-subtle)',
  },
  inset: {
    background: 'var(--surface-inset)',
    border: '1px solid var(--border-subtle)',
  },
  ink: {
    background: 'var(--surface-ink)',
    color: 'var(--text-on-ink)',
    border: '1px solid var(--surface-ink-raised)',
    boxShadow: 'var(--shadow-lg)',
  },
}

const paddings: Record<CardPadding, number> = { none: 0, sm: 12, md: 20, lg: 32 }

/** Surface container. Radius 14px; padding and ground vary by prop (docs/ui.md). */
export function Card({ variant = 'raised', padding = 'md', children, style, ...rest }: CardProps) {
  return (
    <div
      style={{
        borderRadius: 'var(--radius-lg)',
        padding: paddings[padding],
        ...variants[variant],
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  )
}
