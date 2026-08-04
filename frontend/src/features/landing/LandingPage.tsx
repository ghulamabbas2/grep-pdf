import { SiteNav } from './components/SiteNav'
import { Hero } from './components/Hero'
import { TrustStrip } from './components/TrustStrip'
import { HowItWorks } from './components/HowItWorks'
import { HighlightShowcase } from './components/HighlightShowcase'
import { Features } from './components/Features'
import { Pricing } from './components/Pricing'
import { Faq } from './components/Faq'
import { CtaBand } from './components/CtaBand'
import { SiteFooter } from './components/SiteFooter'

/** Public marketing landing page. No auth, no backend calls. */
export function LandingPage() {
  return (
    <div style={{ background: 'var(--surface-page)', minHeight: '100vh' }}>
      <SiteNav />
      <Hero />
      <TrustStrip />
      <HowItWorks />
      <HighlightShowcase />
      <Features />
      <Pricing />
      <Faq />
      <CtaBand />
      <SiteFooter />
    </div>
  )
}
