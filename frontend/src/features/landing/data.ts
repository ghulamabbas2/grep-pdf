/** Static marketing copy for the landing page. Ported from Landing.dc.html. */

export type Step = { n: string; t: string; d: string }
export type Feature = { t: string; d: string }
export type FaqItem = { q: string; a: string }
export type PricingTier = {
  name: string
  tagline: string
  monthly: number
  annual: number
  cta: string
  featured: boolean
  features: string[]
}

export const steps: Step[] = [
  { n: '01', t: 'Upload', d: 'Drop any PDF — contracts, papers, specs, textbooks. Indexed in seconds.' },
  { n: '02', t: 'Ask', d: 'Type a question in plain language. No scrolling, no Ctrl-F guessing.' },
  {
    n: '03',
    t: 'Get the line',
    d: 'Every answer comes with the exact passage and page it was pulled from.',
  },
]

export const features: Feature[] = [
  {
    t: 'Citations, always',
    d: 'Every answer links to the exact line and page. No hallucinated sources, no guessing.',
  },
  {
    t: 'Built for long docs',
    d: 'An 80-page spec is the same effort as one page. Ask across the whole document.',
  },
  {
    t: 'Dev-grade speed',
    d: 'Indexing and answers in seconds. It feels like grep, because it basically is.',
  },
  {
    t: 'Your docs stay yours',
    d: 'Files are private to your workspace and deleted on request. No training on your data.',
  },
]

export const pricingTiers: PricingTier[] = [
  {
    name: 'Free',
    tagline: 'For trying it out',
    monthly: 0,
    annual: 0,
    cta: 'Upload a PDF',
    featured: false,
    features: ['5 documents', '50 questions / month', 'Citations on every answer', 'Community support'],
  },
  {
    name: 'Pro',
    tagline: 'For daily drivers',
    monthly: 12,
    annual: 9,
    cta: 'Start Pro',
    featured: true,
    features: [
      'Unlimited documents',
      'Unlimited questions',
      'Priority indexing',
      'Export answers + citations',
      'Email support',
    ],
  },
  {
    name: 'Team',
    tagline: 'For research groups',
    monthly: 29,
    annual: 24,
    cta: 'Contact sales',
    featured: false,
    features: ['Everything in Pro', 'Shared workspaces', 'Admin controls', 'SSO / SAML', 'Priority support'],
  },
]

export const faqs: FaqItem[] = [
  {
    q: 'Where do the answers come from?',
    a: 'Every answer is pulled straight from your document and shown with the exact line and page it came from. If the answer isn’t in the doc, grep.pdf tells you — no invented sources.',
  },
  {
    q: 'What file types can I upload?',
    a: 'Any PDF — contracts, papers, specs, textbooks, even scanned documents. 80+ pages are handled with no drop in accuracy.',
  },
  {
    q: 'Do you train on my documents?',
    a: 'No. Files are private to your workspace and deleted on request. Your docs stay yours.',
  },
  {
    q: 'How fast is it?',
    a: 'Indexing and answers take seconds. It feels like grep, because it basically is.',
  },
  {
    q: 'Is there a free plan?',
    a: 'Yes — your first 5 documents are free, no card required. Upgrade only when you need more.',
  },
]

/** Shared content-column width + horizontal padding used across sections. */
export const CONTAINER = 'min(1120px, 100%)'
export const PAD_X = 'clamp(16px, 4vw, 28px)'
