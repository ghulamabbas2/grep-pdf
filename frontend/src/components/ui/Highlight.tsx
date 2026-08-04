import type { CSSProperties, HTMLAttributes, ReactNode } from 'react'

type HighlightTone = 'solid' | 'swipe' | 'underline'

type HighlightProps = {
  tone?: HighlightTone
  children?: ReactNode
} & HTMLAttributes<HTMLElement>

const tones: Record<HighlightTone, CSSProperties> = {
  solid: {
    background: 'var(--highlight-bg)',
    boxShadow: 'inset 0 -0.55em 0 var(--yellow-400)',
  },
  swipe: {
    background: 'linear-gradient(120deg, var(--yellow-300) 0%, var(--yellow-400) 100%)',
  },
  underline: {
    background: 'transparent',
    boxShadow: 'inset 0 -3px 0 var(--highlight-bar)',
  },
}

/** The highlighter motif — a yellow mark that stands in for a cited passage. */
export function Highlight({ tone = 'solid', children, style, ...rest }: HighlightProps) {
  return (
    <mark
      style={{
        color: 'var(--ink-900)',
        padding: '0.05em 0.15em',
        borderRadius: 3,
        background: 'transparent',
        ...tones[tone],
        ...style,
      }}
      {...rest}
    >
      {children}
    </mark>
  )
}
