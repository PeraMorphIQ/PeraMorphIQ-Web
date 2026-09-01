# Design system

The site is deliberately **near-monochrome**: a neutral ink ramp plus one
accent. Hierarchy comes from type size, weight and whitespace - not from colour.
Reference points are university lab sites that read as credible research output,
not product marketing pages.

All values live in [`assets/css/tokens.css`](../assets/css/tokens.css).
**No raw hex, `rgb()` or `hsl()` value may appear anywhere else in the codebase.**

---

## Colour

The complete palette:

| Token | Value | Use |
|---|---|---|
| `--ink-900` | `#111418` | Headings, primary text |
| `--ink-700` | `#3d434c` | Body text |
| `--ink-500` | `#6b7280` | Meta, captions, bylines |
| `--ink-300` | `#9ca3af` | Disabled, subtle marks |
| `--rule` | `#e5e7eb` | Hairline borders and dividers |
| `--rule-strong` | `#d1d5db` | Hover / emphasised borders |
| `--surface` | `#ffffff` | Page ground |
| `--surface-2` | `#f7f8f9` | Alternating bands, card fill |
| `--surface-3` | `#eef0f2` | Input wells, media placeholders |
| `--surface-inverse` | `#111418` | Footer and closing CTA (flat, no gradient) |
| `--accent` | `#1e4f8f` | Links, primary button, active nav mark, focus ring |
| `--accent-hover` | `#163c6e` | Accent hover |
| `--accent-weak` | `#eef2f8` | Accent-tinted ground (selected chip, OA badge) |

That is **one hue**. There is no secondary accent, no teal, no status colours.

### Rules

- **Status is not colour.** Active/Completed is an outlined `.badge` with a dot;
  the dot takes the accent only for "Active". Meaning is carried by the label.
- **The accent is rationed.** Roughly one accent element per screen region:
  a link, the primary button, the active nav underline.
- **No gradients.** The old site's `#1a1a2e → #16213e` footer is now a flat
  `--surface-inverse`.
- Colours must be legible against `--surface` *and* `--surface-2`, since the
  section bands alternate.

---

## Typography

Two families:

- **Inter** - everything. Headings use `--tracking-tight`; body uses
  `--leading-normal` (1.65).
- **Orbitron** - the wordmark only, via `.wordmark`. Never in body copy, and
  never applied through an inline `style` attribute.

`html { font-size: 62.5% }`, so **1 rem = 10px**. Every rem in the codebase
assumes this; do not change it without rewriting all of them.

Scale: `--text-xs` 1.2 · `sm` 1.4 · `base` 1.6 · `md` 1.8 · `lg` 2.1 ·
`xl` 2.6 · `2xl` 3.2 · `3xl` 4 · `4xl` 5 (rem).

Running prose is capped at `--measure` (72ch) with the `.prose` class. Full-width
paragraphs at 116rem are unreadable and were a real problem on the old site.

---

## Space, shape, depth

- Space scale: `--space-1` … `--space-11` (0.4rem → 12.8rem).
- **One section rhythm**: `--section-y`. Use `.section`, `.section--lg` or
  `.section--tight` - never a bespoke `padding: 9.6rem 0`.
- **One radius**: `--radius: 4px`. (`--radius-pill` exists only for chips and
  the status dot.)
- **Two shadows only**: `--shadow-sm` for raised cards, `--shadow-md` for
  overlays. Cards are **border-led** - they use `--rule` and darken it on hover
  rather than casting a large shadow.

---

## Motion

Subdued by policy. `--transition` is 160ms; `reveal.js` does a short fade plus a
12px rise and nothing else. There is no typewriter, no bouncing arrow, no
`scale()` card hover. Nothing on the page moves unless the user acts.

`prefers-reduced-motion: reduce` zeroes `--transition` at the token level, so
every component inherits the behaviour without its own media query.

---

## Components

Defined in [`assets/css/components.css`](../assets/css/components.css).

- **Buttons** - `.btn` with `--primary` (solid accent), `--secondary` (outlined)
  and `--link`. Plus `--sm`. These replaced six unrelated button classes; do not
  add a seventh.
- **Card** - `.card` / `.card__media` / `.card__body` / `.card__title` /
  `.card__text` / `.card__footer`. Use `.stretched-link` on the title anchor to
  make the whole card clickable while keeping one correctly-labelled focus stop.
  `.card__media` displays images with `object-fit: contain` because covers here
  are architecture diagrams; add `.card__media--photo` for real photographs.
- **Badge / tag / chip** - `.badge` (outlined status), `.tag` (topic),
  `.chip` (interactive filter, uses `aria-pressed`).
- **Person** - `.person` with a greyscale portrait that colourises on hover.

---

## Layout and structure

```
assets/
  css/   tokens → base → components → pages   (load in this order)
  js/    layout.js (site chrome), reveal.js
  js/modules/   data, projects, publications, people, people-api, news, home
  img/   partners, placeholder, title
data/    projects, publications, news, people, research-areas  (+ img/)
tools/   add-project.html - authoring form and data validator
docs/    DESIGN.md
```

Responsive rules live **next to their component**, not in a separate
`query.css`. Breakpoints in `em`: `34` (~544px), `46` (~736px), `56` (~896px,
the nav drawer), `62` (~992px).

---

## Accessibility baseline

- Skip link on every page; `:focus-visible` rings from `--focus-ring`.
- Active nav item carries `aria-current="page"`.
- Filter chips are `<button aria-pressed>`; result counts are `aria-live`.
- Every content image has an `alt`; decorative images have `alt=""`.
- The mobile drawer closes on link click, Escape and outside click, and restores
  body scroll.

---

## Guardrail

CI-free, but run this before committing - it should return nothing:

```bash
grep -rInE "#[0-9a-fA-F]{3,8}\b|rgba?\(" --include=*.css --include=*.html --include=*.js . \
  | grep -v "assets/css/tokens.css"
```
