# Plan — grep.pdf public landing page

## Context

The frontend currently renders only scaffolding (`frontend/src/App.tsx` — a centered health-check card). A finished marketing landing page was designed in Claude Design (`Landing.dc.html`) on top of a `grep.pdf` design system. This task ports that design into the real React + Vite frontend as a **public** page (no auth, no backend calls). The design source, all four design-system components used (`Button`, `Badge`, `Highlight`, `Citation`), and every token file have been read directly from the design project and will be reproduced faithfully.

The page sells the product ("Stop scrolling. Ask your PDF.") with these sections, in order: sticky nav (+ mobile menu), hero with an animated "searching → answered" demo card, trust strip, how-it-works (3 steps), highlight showcase (ink band), features (4), pricing (monthly/annual toggle, 3 tiers), FAQ (accordion), CTA band, footer.

## Styling approach (decision)

The design is authored entirely with **inline styles referencing CSS custom properties** (`var(--ink-900)`, `var(--font-display)`, `var(--radius-lg)`, …). The highest-fidelity, lowest-risk port is to **carry the tokens over as CSS variables and mirror the source's inline styles**, rather than hand-translating hundreds of values into Tailwind arbitrary-value classes. Tailwind v4 stays available for incidental needs, but the landing page and DS components will use inline styles + CSS vars to match the design 1:1. This is consistent with `docs/design-system.md`, whose source of truth is those same custom properties.

Responsive behavior (nav collapse) will use **CSS media queries** instead of the design's JS `window.innerWidth` check — cleaner in React and avoids a resize listener. State-driven interactivity (mobile menu open, hero demo loop, pricing toggle, FAQ accordion) stays in React.

## Files to create or change

### Tokens & global styles
- `frontend/src/styles/tokens.css` — **new.** The four token files combined into one `:root` block: colors, typography (families + scale/weights/leading/tracking), spacing/radius/shadows/motion. Verbatim from the design project's `tokens/*.css`. Source of truth per `docs/design-system.md`.
- `frontend/src/styles/base.css` — **new.** Global page styles + keyframes lifted from the design's `<helmet><style>`: `body` background/color/font, smooth scroll, anchor colors, and the `gp-blink` (cursor), `gp-dot` (searching dots), `gp-fade` keyframes. Plus the nav responsive rules (`.gp-nav-links` / `.gp-nav-actions` hidden and `.gp-hamburger` shown under 760px) and a `prefers-reduced-motion` guard.
- `frontend/src/index.css` — **edit.** Add the Google Fonts `@import` (Space Grotesk + Inter) at the very top (before `@import "tailwindcss"` — CSS requires `@import` first), then import `./styles/tokens.css` and `./styles/base.css`.

### Assets
- `frontend/src/assets/logo.svg` — **new.** Primary wordmark (ink text), used in nav + footer. Content copied from the design project.
- `frontend/src/assets/logo-reversed.svg` — **new.** Reversed lockup (kept for completeness / future dark surfaces).

### Design-system components (shared UI) — `frontend/src/components/ui/` per architecture.md ("presentation-only UI shared across features"), PascalCase files
- `Button.tsx` — **new.** Variants `primary | ink | outline | ghost`, sizes `sm | md | lg`, `fullWidth`, `leftIcon`/`rightIcon`, `style` override. Base ported from the DS bundle; documented hover/press/focus states added via a small class in `base.css` (primary → yellow-400 hover / yellow-600 press; ghost → slate-100 hover; yellow focus ring).
- `Badge.tsx` — **new.** Variants `neutral | accent | ink | outline`, sizes `sm | md`. Ported from bundle.
- `Highlight.tsx` — **new.** `<mark>` with tones `solid | swipe | underline`. Ported from bundle.
- `Citation.tsx` — **new.** `source` / `page` / `quote` / optional `onJump` citation card with the yellow bar + mono `> source p.N` footer. Ported from bundle.

### Landing feature — `frontend/src/features/landing/` per architecture.md (self-contained feature slice)
- `LandingPage.tsx` — **new.** Composes all sections; sets the page container background.
- `data.ts` — **new.** Static content arrays: `steps`, `features`, `pricingTiers`, `faqs` (typed).
- `components/SiteNav.tsx` — **new.** Sticky blurred nav; `useState` mobile menu; logo, links, Sign in + "Upload a PDF" `Button`. Links are in-page anchors (`#how`, `#features`, …); auth/upload CTAs are placeholder `#` anchors (no routes exist yet).
- `components/Hero.tsx` — **new.** Two-column hero; right column is the demo chat card that loops `searching → answered` via `useEffect` timers (disabled under reduced motion), using `Highlight` + `Citation`.
- `components/TrustStrip.tsx`, `components/HowItWorks.tsx`, `components/HighlightShowcase.tsx`, `components/Features.tsx`, `components/CtaBand.tsx`, `components/SiteFooter.tsx` — **new.** Mostly-static sections.
- `components/Pricing.tsx` — **new.** `useState` monthly/annual segmented toggle; recomputes price/period/bill note; featured tier gets the "Most popular" `Badge` + accent border.
- `components/Faq.tsx` — **new.** `useState` single-open accordion with rotating chevron.

### Wiring
- `frontend/src/App.tsx` — **edit.** Replace the health-check scaffold with `<LandingPage />`. (Removes the `/api/health` fetch — the landing page is public and makes no backend calls.)

## Approach notes

- **No new dependencies, no router, no backend changes.** Project has no react-router; the page is a single view, so CTAs/nav are anchors with placeholder `#` / in-page hash targets. Keeps the CORS/proxy assumptions in CLAUDE.md untouched.
- **DS components** are thin ports of the exact inline-style objects from the design bundle, typed with explicit prop unions (no `any`) to satisfy `tsconfig.app` strict + `docs/coding-standards.md`.
- **Data flow** is entirely local component state — nothing fetches. `data.ts` holds copy so section components stay layout-only.
- **Fidelity:** section markup, spacing, `clamp()` sizing, colors, and the three animations mirror `Landing.dc.html`; only the responsive mechanism (CSS media query vs JS width) and framework (React components vs the `.dc` runtime) differ.

## QA Scenarios

- **Happy path (render):** `npm run dev` (root) → open `:5173` → the full landing page renders with fonts, ink hero, yellow accents, and all sections in order.
- **Hero demo loop:** on load the demo card shows the "searching the document…" dots, then flips to the answer with a `Highlight` + `Citation`, and re-loops (~6.5s). Under OS "reduce motion", it settles on the answered state without looping.
- **Pricing toggle:** clicking **Annual** drops every tier's price to the annual number, changes the bill note to "billed annually", and shows "−25%"; **Monthly** restores it. Featured "Pro" tier keeps the accent border + "Most popular" badge.
- **FAQ accordion:** clicking a question expands its answer and rotates the chevron; opening another closes the previous (single-open); clicking an open one collapses it.
- **Responsive / mobile nav:** below 760px the desktop links + actions hide and the hamburger appears; tapping it opens the panel, tapping a link closes it. No horizontal scroll at 375px width.
- **Type-check & lint (build gate):** `npm run build` (tsc strict + vite build) and `npm run lint` (oxlint) both pass with no errors.

## Verification

1. From repo root: `npm run dev`, visit `http://localhost:5173`, walk the six QA scenarios above (backend not required — page makes no API calls).
2. From `frontend/`: `npm run build` and `npm run lint` — both must pass clean.
