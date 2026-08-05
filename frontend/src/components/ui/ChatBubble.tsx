import type { CSSProperties, HTMLAttributes, ReactNode } from 'react'

type ChatBubbleRole = 'user' | 'assistant'

type ChatBubbleProps = {
  role: ChatBubbleRole
  children?: ReactNode
} & HTMLAttributes<HTMLDivElement>

const roles: Record<ChatBubbleRole, CSSProperties> = {
  user: {
    alignSelf: 'flex-end',
    background: 'var(--surface-ink)',
    color: 'var(--text-on-ink)',
    borderRadius: '14px 14px 4px 14px',
  },
  assistant: {
    alignSelf: 'flex-start',
    background: 'var(--surface-card)',
    color: 'var(--text-body)',
    border: '1px solid var(--border-subtle)',
    borderRadius: '14px 14px 14px 4px',
    boxShadow: 'var(--shadow-xs)',
  },
}

/** A chat message bubble — ink + right for the user, white card + left for answers. */
export function ChatBubble({ role, children, style, ...rest }: ChatBubbleProps) {
  return (
    <div
      style={{
        maxWidth: '88%',
        padding: '10px 14px',
        fontFamily: 'var(--font-body)',
        fontSize: 'var(--text-base)',
        lineHeight: 'var(--leading-normal)',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
        ...roles[role],
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  )
}
