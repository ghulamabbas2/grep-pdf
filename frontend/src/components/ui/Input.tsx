import type { CSSProperties, InputHTMLAttributes, ReactNode } from 'react'

type InputVariant = 'default' | 'ask'
type InputSize = 'sm' | 'md' | 'lg'

type InputProps = {
  variant?: InputVariant
  size?: InputSize
  leftIcon?: ReactNode
  rightSlot?: ReactNode
  invalid?: boolean
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'size'>

const heights: Record<InputSize, number> = { sm: 34, md: 42, lg: 50 }

/**
 * Text field. `ask` prepends a yellow `>` prompt (the "ask your PDF" composer);
 * `default` is the standard field. Focus styling lives in base.css via `.gp-input`.
 */
export function Input({
  variant = 'default',
  size = 'md',
  leftIcon,
  rightSlot,
  invalid = false,
  style,
  ...rest
}: InputProps) {
  const wrapStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    height: heights[size],
    padding: '0 12px',
    background: 'var(--surface-card)',
    border: `1px solid ${invalid ? '#DC2626' : 'var(--border-default)'}`,
    borderRadius: variant === 'ask' ? 'var(--radius-lg)' : 'var(--radius-md)',
    transition: 'border-color var(--dur-fast), box-shadow var(--dur-fast)',
    ...style,
  }

  return (
    <div className="gp-input" style={wrapStyle}>
      {variant === 'ask' && (
        <span
          style={{ color: 'var(--color-accent-press)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}
        >
          &gt;
        </span>
      )}
      {leftIcon && (
        <span style={{ display: 'inline-flex', color: 'var(--text-faint)', flexShrink: 0 }}>
          {leftIcon}
        </span>
      )}
      <input
        style={{
          flex: 1,
          minWidth: 0,
          border: 'none',
          outline: 'none',
          background: 'transparent',
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-base)',
          color: 'var(--text-body)',
        }}
        {...rest}
      />
      {rightSlot && <span style={{ display: 'inline-flex', flexShrink: 0 }}>{rightSlot}</span>}
    </div>
  )
}
