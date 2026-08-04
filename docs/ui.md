# grep.pdf — UI Components & Patterns

Component contracts mirror the design-system source (`components/**`). Props, variants, and states below are authoritative; anything not defined is marked **TBD** — do not invent it. Pair with `design-system.md` for token values. Assumes React + Vite + Tailwind.

Namespace note: components reference styling via CSS custom properties. In a Tailwind build, map tokens per `design-system.md` and use the equivalent classes.

---

## Core

### Button

The primary action. `primary` is the yellow signature CTA.

| Prop | Type | Default |
|------|------|---------|
| `variant` | `'primary' \| 'ink' \| 'outline' \| 'ghost'` | `'primary'` |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` |
| `leftIcon` / `rightIcon` | `ReactNode` | — |
| `fullWidth` | `boolean` | `false` |
| `disabled` | `boolean` | `false` |

Variants:

| Variant | Fill | Text | Border |
|---------|------|------|--------|
| `primary` | `yellow-500` | `ink-900` | none |
| `ink` | `ink-900` | `page-50` | none |
| `outline` | transparent | `ink-900` | `1px slate-300` |
| `ghost` | transparent | `ink-900` | none |

Sizes: `sm` h32 / px12 / 13px · `md` h40 / px16 / 15px · `lg` h48 / px22 / 17px. Radius `10px`, weight 600, tracking `-0.02em`.

States:
- **Hover** — `primary` → `yellow-400`; `ghost`/`outline` → `slate-100` fill. (Base transitions color; add these in your build.)
- **Press** — `primary` → `yellow-600`. No scale.
- **Focus** — yellow focus ring (`--shadow-focus`).
- **Disabled** — opacity `0.45`, `cursor: not-allowed`.

```jsx
<Button variant="primary" size="md" leftIcon={<Upload/>}>Upload a PDF</Button>
<Button variant="ghost">Cancel</Button>
```

### IconButton

Square icon-only button. **`label` (aria-label) is required.**

| Prop | Type | Default |
|------|------|---------|
| `variant` | `'ghost' \| 'outline' \| 'ink' \| 'accent'` | `'ghost'` |
| `size` | `'sm' \| 'md' \| 'lg'` (30 / 36 / 42px) | `'md'` |
| `label` | `string` (required) | — |

```jsx
<IconButton label="Next page" variant="outline"><ChevronRight/></IconButton>
```

### Input

Text field. The `ask` variant is the "ask your PDF" composer.

| Prop | Type | Default |
|------|------|---------|
| `variant` | `'default' \| 'ask'` | `'default'` |
| `size` | `'sm' \| 'md' \| 'lg'` (h34 / h42 / h50) | `'md'` |
| `leftIcon` | `ReactNode` | — |
| `rightSlot` | `ReactNode` | — |
| `invalid` | `boolean` | `false` |

- `ask` prepends a yellow `>` prompt and uses `radius-lg`; `default` uses `radius-md`.
- **Invalid** border → `#DC2626` (see design-system TBD note).
- **Focus** — border-color + ring transition. Exact focused border color: **TBD** (only transition is defined).

```jsx
<Input variant="ask" placeholder="Ask this PDF anything…"
  rightSlot={<IconButton label="Send" variant="accent"><Send/></IconButton>} />
```

### Card

Surface container.

| Prop | Type | Default |
|------|------|---------|
| `variant` | `'raised' \| 'flat' \| 'inset' \| 'ink'` | `'raised'` |
| `padding` | `'none' \| 'sm' \| 'md' \| 'lg'` | `'md'` |

| Variant | Background | Border | Shadow |
|---------|-----------|--------|--------|
| `raised` | `white` | `slate-200` | `md` |
| `flat` | `white` | `slate-200` | none |
| `inset` | `slate-100` | `slate-200` | none |
| `ink` | `ink-900` (light text) | `ink-800` | `lg` |

Radius `14px`. Padding: `sm 12` · `md 20` · `lg 32`.

### Badge

Compact status/metadata pill.

| Prop | Type | Default |
|------|------|---------|
| `variant` | `'neutral' \| 'accent' \| 'ink' \| 'outline'` | `'neutral'` |
| `size` | `'sm' \| 'md'` (h20 / h24) | `'md'` |

| Variant | Background | Text |
|---------|-----------|------|
| `neutral` | `slate-100` | `slate-500` |
| `accent` | `yellow-300` | `ink-900` |
| `ink` | `ink-900` | `page-50` |
| `outline` | transparent (`slate-300` border) | `ink-900` |

Radius `pill`, weight 600.

---

## Forms

### Switch

| Prop | Type | Default |
|------|------|---------|
| `checked` | `boolean` | `false` |
| `onChange` | `(next: boolean) => void` | — |
| `size` | `'sm' \| 'md'` (34×20 / 42×24) | `'md'` |
| `label` | `string` | — |
| `disabled` | `boolean` | `false` |

States: **on** → track `yellow-500`; **off** → track `slate-300`. Knob white with `shadow-sm`, slides `200ms`. Disabled opacity `0.5`. `role="switch"`, `aria-checked` set.

### Checkbox

| Prop | Type | Default |
|------|------|---------|
| `checked` | `boolean` | `false` |
| `onChange` | `(next: boolean) => void` | — |
| `label` | `string` | — |
| `disabled` | `boolean` | `false` |

States: **checked** → `ink-900` box (1.5px border) with a `yellow-500` check; **unchecked** → white box, `slate-300` border. 20×20, radius `6px`.

> Radio, Select, Textarea, Slider: **TBD** — not defined in the system.

---

## Overlay

### Tooltip

| Prop | Type | Default |
|------|------|---------|
| `label` | `string` | — |
| `side` | `'top' \| 'bottom' \| 'left' \| 'right'` | `'top'` |
| `children` | `ReactNode` (trigger) | — |

Ink bubble (`ink-900`), light text, 12px, `shadow-md`, radius `6px`. Shows on hover **and** focus; `role="tooltip"`; `pointer-events: none`. 8px offset from trigger.

### Dialog

| Prop | Type | Default |
|------|------|---------|
| `open` | `boolean` | — |
| `onClose` | `() => void` | — |
| `title` | `string` | — |
| `footer` | `ReactNode` | — |
| `width` | `number` (px) | `460` |

- Scrim: `rgba(30,27,75,.42)` + `blur(2px)`. Clicking scrim → `onClose`; content click is stopped.
- Panel: white, radius `20px`, `shadow-lg`. Title bar (`font-display`, 20px, 600) + body + footer (`slate-100`, right-aligned actions).
- `role="dialog"`, `aria-modal="true"`.
- **TBD:** focus trap, `Escape`-to-close, and scroll-lock are not implemented — add for production.

---

## Brand (signature)

### Highlight

The yellow highlighter mark over cited text — the core brand motif.

| Prop | Type | Default |
|------|------|---------|
| `tone` | `'solid' \| 'swipe' \| 'underline'` | `'solid'` |

- `solid` — `yellow-300` bg with inset `yellow-400` bar.
- `swipe` — `yellow-300 → yellow-400` gradient.
- `underline` — transparent bg, 3px `yellow-500` bottom bar.

Renders `<mark>`, ink text. `<mark>` carries default browser semantics.

```jsx
<p>The refund window is <Highlight>30 days from delivery</Highlight>.</p>
```

### Citation

The exact line an answer came from, with page ref and a yellow bar. The product's core promise made visible.

| Prop | Type | Default |
|------|------|---------|
| `page` | `number \| string` | — |
| `source` | `string` | `'PDF'` |
| `quote` | `string` | — |
| `onJump` | `() => void` | — |
| `compact` | `boolean` | `false` |

- Left `yellow-500` bar; `quote` shown highlighted (hidden when `compact`); mono footer `> {source} p.{page}`.
- Clickable when `onJump` set (cursor pointer). Renders as a `div` — **TBD:** for keyboard access make it a real button/link with a focusable role in production.

```jsx
<Citation source="terms.pdf" page={12} quote="…30 days written notice." onJump={() => goToPage(12)} />
```

### ChatBubble

Message in the ask-your-PDF thread.

| Prop | Type | Default |
|------|------|---------|
| `role` | `'user' \| 'assistant'` | `'assistant'` |

- `user` — `ink-900` fill, light text, right-aligned, tight bottom-right corner.
- `assistant` — white card, `slate-200` border, `shadow-xs`, left-aligned. Compose `<Citation>` inside assistant bubbles.
- Max width `82%`.

---

## Layout patterns

### App workspace (`ui_kits/app`, ~1280px)

Three-column flex, full viewport height:

| Region | Width | Contents |
|--------|-------|----------|
| Sidebar | `264px` fixed | Logo, "Upload a PDF" CTA, document list, account footer |
| PDF reader | `50%` (`flex 0 0 50%`) | 52px toolbar (file name, page nav), scrollable white page with highlighted citation |
| Chat | remaining (`flex 1`) | 52px header, scrollable message thread, sticky composer + suggested-question chips |

- Toolbars are 52px, white, `slate-200` bottom border.
- Reader ground is `slate-100`; the page is a white sheet with `shadow-md`.
- Composer is pinned at the bottom of the chat column (not the viewport).

### Marketing landing (`ui_kits/site`, 1080px max content)

Stacked sections: sticky blurred nav → ink hero (2-col: copy + product-preview card) → how-it-works (3 cards) → features (2-col) → ink CTA block → footer. Content wrapper `max-width 1080px`, `padding 0 28px`.

- Dark (`ink-900`) and light (`page-50`) sections alternate; max 2 grounds.
- Sticky nav: `rgba(248,250,252,.85)` + `blur(8px)`.

---

## Accessibility notes

Defined in the system:
- `IconButton` requires `label` → `aria-label`.
- `Switch`: `role="switch"` + `aria-checked`.
- `Tooltip`: `role="tooltip"`, opens on hover **and** focus.
- `Dialog`: `role="dialog"`, `aria-modal="true"`.
- Focus ring is yellow (`--shadow-focus`) — visible against light grounds.
- Color pairings enforce contrast: ink text on yellow (never yellow text on white); `text-on-ink` = `page-50`.

Gaps to close for production (**TBD** in the system):
- Dialog: focus trap, `Escape` to close, scroll-lock, return-focus-to-trigger.
- Citation: it's a clickable `div` — give it a button role + keyboard handler when `onJump` is set.
- Suggested-question chips and the reader page use native buttons/scroll — verify tab order end-to-end.
- Reduced-motion: no `prefers-reduced-motion` handling defined — gate the thinking-dots and cursor animations.
- Form validation messaging (error text, `aria-invalid`, `aria-describedby`): not defined.
