/** Static copy for the About page. */

export type Value = { t: string; d: string }
export type Stat = { n: string; l: string }

export const values: Value[] = [
  {
    t: 'Answers you can trust',
    d: 'Every response points to the exact line and page. If it is not in your document, we say so — no invented sources.',
  },
  {
    t: 'Fast by default',
    d: 'Indexing and answers take seconds. We build for the impatience of people who live in the terminal.',
  },
  {
    t: 'Your docs stay yours',
    d: 'Files are private to your workspace and deleted on request. We never train on your data.',
  },
  {
    t: 'Simple over clever',
    d: 'No prompt engineering, no setup rituals. Upload, ask, get the line. It feels like grep because it basically is.',
  },
]

export const stats: Stat[] = [
  { n: '80+', l: 'pages per doc, no drop in accuracy' },
  { n: 'Seconds', l: 'from upload to first answer' },
  { n: '100%', l: 'of answers carry a citation' },
]
