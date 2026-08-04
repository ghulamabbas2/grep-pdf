import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from 'react'

type ButtonVariant = 'primary' | 'ink' | 'outline' | 'ghost'
type ButtonSize = 'sm' | 'md' | 'lg'

type ButtonProps = {
  variant?: ButtonVariant
  size?: ButtonSize
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  fullWidth?: boolean
} & ButtonHTMLAttributes<HTMLButtonElement>

const sizes: Record<ButtonSize, { h: number; px: number; fs: string; gap: number }> = {
  sm: { h: 32, px: 12, fs: 'var(--text-sm)', gap: 6 },
  md: { h: 40, px: 16, fs: 'var(--text-base)', gap: 8 },
  lg: { h: 48, px: 22, fs: 'var(--text-md)', gap: 8 },
}

const variants: Record<ButtonVariant, CSSProperties> = {
  primary: {
    background: 'var(--color-accent)',
    color: 'var(--text-on-accent)',
    border: '1px solid transparent',
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
  ghost: {
    background: 'transparent',
    color: 'var(--text-strong)',
    border: '1px solid transparent',
  },
}

/** Primary interactive control. Hover/press/focus states live in base.css via [data-variant]. */
export function Button({
  variant = 'primary',
  size = 'md',
  leftIcon,
  rightIcon,
  disabled = false,
  fullWidth = false,
  children,
  style,
  ...rest
}: ButtonProps) {
  const s = sizes[size]
  const v = variants[variant]

  return (
    <button
      className="gp-btn"
      data-variant={variant}
      disabled={disabled}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: s.gap,
        height: s.h,
        padding: `0 ${s.px}px`,
        width: fullWidth ? '100%' : 'auto',
        fontFamily: 'var(--font-body)',
        fontSize: s.fs,
        fontWeight: 'var(--weight-semibold)',
        lineHeight: 1,
        letterSpacing: 'var(--tracking-tight)',
        whiteSpace: 'nowrap',
        borderRadius: 'var(--radius-md)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.45 : 1,
        transition:
          'transform var(--dur-fast) var(--ease-standard), background var(--dur-fast) var(--ease-standard), box-shadow var(--dur-fast)',
        ...v,
        ...style,
      }}
      {...rest}
    >
      {leftIcon && <span style={{ display: 'inline-flex', flexShrink: 0 }}>{leftIcon}</span>}
      {children}
      {rightIcon && <span style={{ display: 'inline-flex', flexShrink: 0 }}>{rightIcon}</span>}
    </button>
  )
}
