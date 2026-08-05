# grep.pdf — Design System Foundations

Source of truth: the CSS custom properties in `styles.css` (`tokens/*.css`). This doc maps them to a React + Vite + Tailwind setup. Values marked **TBD** are not defined in the design system — do not invent them.

Light mode only.

---

## Colors

Hex values are authoritative. The **Tailwind class** column assumes you extend `theme.colors` with the tokens below (config at the end of this section); default-palette equivalents are noted where they happen to match closely, but prefer the named tokens.

### Brand — Ink (deep indigo)

| Token | Hex | Tailwind class | Use |
|-------|-----|----------------|-----|
| `--ink-900` | `#1E1B4B` | `ink-900` | Primary ground for dark sections; default body-text color |
| `--ink-800` | `#312E81` | `ink-800` | Raised ink surface (reversed logo square) |
| `--ink-700` | `#3730A3` | `ink-700` | Ink hover on dark |

### Brand — Accent (highlighter yellow)

| Token | Hex | Tailwind class | Use |
|-------|-----|----------------|-----|
| `--yellow-300` | `#FEF08A` | `yellow-300` | Faint highlight wash |
| `--yellow-400` | `#FDE047` | `yellow-400` | Lighter highlight fill; primary-button hover |
| `--yellow-500` | `#FACC15` | `yellow-500` | **Signature accent** — CTA fill, citations, cursor |
| `--yellow-600` | `#EAB308` | `yellow-600` | Pressed / darker accent |

> Contrast rule: yellow needs a dark ground or ink text pairing. Never yellow text on white.

### Neutrals — Slate & Page

| Token | Hex | Tailwind class | Use |
|-------|-----|----------------|-----|
| `--slate-500` | `#64748B` | `slate-500` | Stronger secondary text |
| `--slate-400` | `#94A3B8` | `slate-400` | Muted secondary text, `.pdf`, metadata, page numbers |
| `--slate-300` | `#CBD5E1` | `slate-300` | Default borders |
| `--slate-200` | `#E2E8F0` | `slate-200` | Subtle borders, track fills |
| `--slate-100` | `#F1F5F9` | `slate-100` | Hover surface, inset panel |
| `--page-50` | `#F8FAFC` | `page-50` | Soft off-white page background |
| `--white` | `#FFFFFF` | `white` | Card surface |

> Slate values are Tailwind's default `slate` scale — Ink 900/800/700 are close to Tailwind `indigo-950/900/800` but not exact; use the named tokens.

### Semantic aliases

| Alias | Resolves to | Tailwind class |
|-------|-------------|----------------|
| `--color-accent` | `#FACC15` | `yellow-500` |
| `--color-accent-hover` | `#FDE047` | `yellow-400` |
| `--color-accent-press` | `#EAB308` | `yellow-600` |
| `--text-strong` / `--text-body` | `#1E1B4B` | `ink-900` |
| `--text-muted` | `#64748B` | `slate-500` |
| `--text-faint` | `#94A3B8` | `slate-400` |
| `--text-on-ink` | `#F8FAFC` | `page-50` |
| `--text-on-accent` | `#1E1B4B` | `ink-900` |
| `--surface-page` | `#F8FAFC` | `page-50` |
| `--surface-card` | `#FFFFFF` | `white` |
| `--surface-inset` | `#F1F5F9` | `slate-100` |
| `--surface-ink` | `#1E1B4B` | `ink-900` |
| `--surface-ink-raised` | `#312E81` | `ink-800` |
| `--border-subtle` | `#E2E8F0` | `slate-200` |
| `--border-default` | `#CBD5E1` | `slate-300` |
| `--border-strong` | `#1E1B4B` | `ink-900` |
| `--highlight-bg` | `#FEF08A` | `yellow-300` |
| `--highlight-bar` | `#FACC15` | `yellow-500` |

> **Status / semantic feedback colors**: error/danger is tokenized as `--color-danger` (`#DC2626`) — used for invalid inputs and inline errors. Success, warning, and info remain **TBD** — not defined; add tokens before relying on them.

### Tailwind config

```js
// tailwind.config.js
export default {
  theme: {
    extend: {
      colors: {
        ink:  { 700: '#3730A3', 800: '#312E81', 900: '#1E1B4B' },
        yellow: { 300: '#FEF08A', 400: '#FDE047', 500: '#FACC15', 600: '#EAB308' },
        page: { 50: '#F8FAFC' },
        // slate-100..500 use Tailwind defaults
      },
    },
  },
};
```

---

## Type scale

Families:

| Role | Stack | Tailwind |
|------|-------|----------|
| Display / heading / wordmark / mono | `'Space Grotesk', ui-monospace, 'SF Mono', Menlo, monospace` | `font-display` |
| Body | `'Inter', -apple-system, system-ui, 'Segoe UI', sans-serif` | `font-body` |

> Space Grotesk doubles as the mono/terminal face — there is no separate mono family. Both are Google Fonts.

Sizes (px; the scale is px-based, not rem):

| Token | Size | Tailwind (arbitrary) | Typical use |
|-------|------|----------------------|-------------|
| `--text-xs` | 12px | `text-[12px]` | Mono labels, badges |
| `--text-sm` | 13px | `text-[13px]` | Metadata, muted body |
| `--text-base` | 15px | `text-[15px]` | Body / answers / citations |
| `--text-md` | 17px | `text-[17px]` | Lead paragraph, lg button |
| `--text-lg` | 20px | `text-[20px]` | Section heading |
| `--text-xl` | 26px | `text-[26px]` | Subhead |
| `--text-2xl` | 34px | `text-[34px]` | Page title |
| `--text-3xl` | 46px | `text-[46px]` | Display |
| `--text-4xl` | 60px | `text-[60px]` | Hero |

Weights: `400` regular · `500` medium · `600` semibold · `700` bold (`font-normal/medium/semibold/bold`).

Line heights: tight `1.1` · snug `1.3` · normal `1.55` · relaxed `1.7` (`leading-[1.1]` … or extend `theme.lineHeight`).

Tracking: tight `-0.02em` (headings) · normal `0` · wide `0.04em` (eyebrow caps) · mono `0.01em`.

```js
// tailwind extend
fontFamily: {
  display: ["'Space Grotesk'", 'ui-monospace', 'SF Mono', 'Menlo', 'monospace'],
  body: ["'Inter'", '-apple-system', 'system-ui', "'Segoe UI'", 'sans-serif'],
},
```

---

## Spacing

4px base scale.

| Token | Value | Tailwind | Token | Value | Tailwind |
|-------|-------|----------|-------|-------|----------|
| `--space-1` | 4px | `1` | `--space-8` | 32px | `8` |
| `--space-2` | 8px | `2` | `--space-10` | 40px | `10` |
| `--space-3` | 12px | `3` | `--space-12` | 48px | `12` |
| `--space-4` | 16px | `4` | `--space-16` | 64px | `16` |
| `--space-5` | 20px | `5` | `--space-20` | 80px | `20` |
| `--space-6` | 24px | `6` | `--space-24` | 96px | `24` |

> These map 1:1 onto Tailwind's default spacing scale (`4px * n`) — no config change needed.

---

## Radius

| Token | Value | Tailwind | Use |
|-------|-------|----------|-----|
| `--radius-sm` | 6px | `rounded-md` (0.375rem≈6px) | Small controls, marks, checkbox |
| `--radius-md` | 10px | `rounded-[10px]` | Buttons, icon buttons, inputs (default) |
| `--radius-lg` | 14px | `rounded-[14px]` | Cards, ask-composer, chat bubbles |
| `--radius-xl` | 20px | `rounded-[20px]` | Dialogs, large CTA blocks |
| `--radius-pill` | 999px | `rounded-full` | Badges, pills, switch track |

```js
borderRadius: { sm: '6px', md: '10px', lg: '14px', xl: '20px' },
```

Border widths: default `1px`; strong `1.5px` (checkbox, emphasis).

---

## Shadows

Low, cool, **ink-tinted** (rgba of `#1E1B4B`) — never black, never heavy.

| Token | Value | Tailwind | Use |
|-------|-------|----------|-----|
| `--shadow-xs` | `0 1px 2px rgba(30,27,75,.06)` | `shadow-xs` | Chips, citation cards |
| `--shadow-sm` | `0 1px 3px rgba(30,27,75,.08), 0 1px 2px rgba(30,27,75,.04)` | `shadow-sm` | Switch knob |
| `--shadow-md` | `0 4px 12px rgba(30,27,75,.08), 0 2px 4px rgba(30,27,75,.04)` | `shadow-md` | Cards |
| `--shadow-lg` | `0 12px 32px rgba(30,27,75,.12), 0 4px 8px rgba(30,27,75,.05)` | `shadow-lg` | Dialogs, floating panels |
| `--shadow-focus` | `0 0 0 3px rgba(250,204,21,.45)` | `ring-4 ring-yellow-500/45` | Focus ring (yellow) |

```js
boxShadow: {
  xs: '0 1px 2px rgba(30,27,75,.06)',
  sm: '0 1px 3px rgba(30,27,75,.08), 0 1px 2px rgba(30,27,75,.04)',
  md: '0 4px 12px rgba(30,27,75,.08), 0 2px 4px rgba(30,27,75,.04)',
  lg: '0 12px 32px rgba(30,27,75,.12), 0 4px 8px rgba(30,27,75,.05)',
},
```

---

## Breakpoints

**TBD** — no responsive breakpoints are defined in the design system. UI kits are authored at fixed widths (app `1280px`, marketing `1080px` max content). Use Tailwind defaults (`sm 640 / md 768 / lg 1024 / xl 1280 / 2xl 1536`) unless the team defines its own.

---

## Motion

| Token | Value | Use |
|-------|-------|-----|
| `--dur-fast` | 120ms | Hover/press color, small state changes |
| `--dur-med` | 200ms | Switch knob, background transitions |
| `--dur-slow` | 320ms | Dialog / panel enter |
| `--ease-standard` | `cubic-bezier(0.2, 0, 0, 1)` | Default easing |
| `--ease-out` | `cubic-bezier(0.16, 1, 0.3, 1)` | Entrances |

```js
transitionDuration: { fast: '120ms', med: '200ms', slow: '320ms' },
transitionTimingFunction: {
  standard: 'cubic-bezier(0.2,0,0,1)',
  out: 'cubic-bezier(0.16,1,0.3,1)',
},
```

Named animations in use (define as `@keyframes` in your global CSS — not tokenized):
- **Thinking dots** — 3 dots, `translateY(-4px)` + opacity, `1s infinite ease-in-out`, staggered 0/0.15/0.3s.
- **Terminal cursor** — blinking bar `▌` on the accent color.

Principles: restrained and functional. Fades and small position shifts only. No bounces on chrome, no parallax, no scale-on-press.
