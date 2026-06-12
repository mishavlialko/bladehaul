# DESIGN.md — BladeHaul Visual System

## Color strategy

**Restrained** — tinted neutrals dominate, orange accent appears ≤10% of total surface area. This is a brand-register decision: every other broker shouts at the customer; we let typography and intentional space carry the brand. Orange is reserved for what we want the user to do, not for decoration.

## Palette (OKLCH-equivalent hex, tuned to brand)

| Token            | Hex       | Role                                                                             |
| ---------------- | --------- | -------------------------------------------------------------------------------- |
| `navy`           | `#0B0D11` | Dark page background (hero + body sections of the dark sandwich)                 |
| `dark`           | `#14181F` | Slight lift from navy — used for inset bands (TrustStrip) and dark card surfaces |
| `steel`          | `#6B7689` | "BLADE" wordmark color; secondary text on dark                                   |
| `text`           | `#1A1A1A` | Primary text on light sections                                                   |
| `text-dim`       | `#555B67` | Secondary text on light sections                                                 |
| `text-faint`     | `#68707E` | Captions, microcopy, very faint labels (AA-compliant on paper/white)             |
| `orange.DEFAULT` | `#EA6A11` | Primary CTA, single accent. The hero color of the brand.                         |
| `orange.dark`    | `#B75A1D` | Hover/active state for orange CTAs                                               |
| `orange.bg`      | `#FFF1E5` | Subtle background tint for light-section orange callouts                         |
| `line`           | `#E1E4E8` | Borders, dividers on light sections                                              |
| `line-soft`      | `#F1F3F5` | Alternating subtle row backgrounds                                               |
| `paper`          | `#F4F4F0` | Light bookend surface — Navbar + Footer background (dark-sandwich layout)        |

**Neutrals are tinted toward the brand hue, not pure greys.** Tailwind's defaults (`gray-*`, `slate-*`) are forbidden — always use the named tokens. `#000` and `#fff` are also forbidden; use `navy` and `white` (white is the only exception, since orange + navy + white is the locked tri-tone).

## Typography

- **Body:** Inter (variable font, loaded via next/font, `--font-inter` CSS var, weights 400/500/600)
- **Display / Headings:** Big Shoulders Display (`--font-big-shoulders`, Tailwind `font-display`) — American industrial condensed face
- **Tactical micro-copy:** JetBrains Mono (`--font-jetbrains-mono`, Tailwind `font-mono`) — dispatch strips, eyebrows, telemetry labels
- No serifs. No cursives. No script/handwriting faces.

### Scale (1.25× ratio between steps)

| Step           | Mobile                 | Desktop                  | Use                             |
| -------------- | ---------------------- | ------------------------ | ------------------------------- |
| Hero H1        | `text-4xl` (36px)      | `text-5xl/6xl` (48–60px) | Slogan only                     |
| Section H2     | `text-3xl` (30px)      | `text-4xl` (36px)        | Section openers                 |
| H3             | `text-xl` (20px)       | `text-2xl` (24px)        | Sub-sections, FAQ questions     |
| Body lg        | `text-lg` (18px)       | `text-xl` (20px)         | Lead paragraphs                 |
| Body           | `text-base` (16px)     | `text-base` (16px)       | Default                         |
| Caption / chip | `text-xs/sm` (12–14px) | `text-sm` (14px)         | Trust chips, microcopy          |
| Eyebrow        | `text-[11px]/text-xs`  | `text-xs` (12px)         | Tracking 0.18–0.22em, uppercase |

### Casing rules

- **Title Case** for the locked H1 slogan and nav link labels ("How It Works", not "How it works").
- **Sentence case** for the locked sub-line ("Sharp on every detail.") and body copy.
- **ALL CAPS only via CSS** (`uppercase` + `tracking-wider`), never typed as ALL CAPS in JSX. Reason: screen readers spell out typed-caps letter-by-letter.

## Layout

- Max content width 1280px (`max-w-7xl`) via the `Container` primitive.
- Container padding: `px-4 sm:px-6 lg:px-8`.
- Section vertical rhythm: `py-24 sm:py-32` is the canonical band; Hero gets `py-24 sm:py-32 lg:py-40`. **Vary intentionally** — TrustStrip is narrow (`py-5 sm:py-6`), Hero is tall, Final CTA is medium. Same padding everywhere is monotony.
- Mobile-first. Test 320 / 375 / 768 / 1280 / 1920.
- Cards are not the default. Most blocks are horizontal bands with internal layout. Nested cards forbidden.

## Elevation

We don't use box-shadow as a "lifted card" metaphor — that's product-register UX language and reads as SaaS-default in brand context. Lift instead through:

- A 1px border in the relevant tone (`border-white/10` on dark, `border-line` on light)
- A subtle background shift (`bg-dark` lifting from `bg-navy`)
- A thin top/bottom border to delineate horizontal bands

Hero may use **one** subtle radial wash (orange at ≤8% alpha) to add depth — but only if it earns its place by interacting meaningfully with other elements (e.g., behind the logo, framing the H1). A generic centered glow is the AI default; refuse it.

## Motion

- CSS `transition-colors duration-150` for interactive state changes (hover, active, focus).
- No animation libraries.
- Ease out curves (`ease-out`, not the default `ease`).
- No layout-affecting animations.
- Logo and key visual elements may have a one-time fade-in via Tailwind's `animate-in fade-in` for entry, but this is the exception, not the rule.

## Focus state

`focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange` everywhere interactive. Orange focus ring is intentional — high contrast on both dark and light, brand-consistent.

## Component primitives

Located in `components/shared/`:

- `Container` — `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`. Polymorphic `as` prop. Use everywhere a content boundary is needed.
- `Button` — `variant: primary | secondary`, `size: md | lg`, optional `fullWidth`, optional `href` (renders as `<Link>`) otherwise `<button>`. Primary = orange solid. Secondary = white-border outline on dark only.
- `Logo` — `<img>` over `/logo.svg` (3.3 KB vector, fixed 39.27:22.98 aspect). `size` = rendered height: `sm | md | lg | xl | 2xl | 3xl | 4xl` → 22 / 32 / 44 / 64 / 88 / 128 / 176 px. Clicking it on the home page scrolls to top (reduced-motion aware).
- `cn()` utility in `lib/cn.ts` (clsx + tailwind-merge) for class merging. Use everywhere classes are conditional or merged.

## Slop rejection list

These are AI defaults to reject on sight:

1. Centered radial gradient as the only depth treatment in a hero. Either commit to a real composition (asymmetric, layered, intentional) or use no gradient at all.
2. Generic icon-grid bento for "features" sections. We don't have features in the SaaS sense.
3. Stock car/truck photography. Banned by spec.
4. "Glow" effects, glassmorphism, blob shapes.
5. Three-card icon-row for "How It Works." If we use a card-like layout, the cards must be meaningfully different in content shape, not just three clones.
6. Em dashes in copy. Use commas, colons, periods. (Yes, the codebase currently has a few `—` characters; those need to come out in a copy pass.)
7. The hero-metric template (giant number + small label + supporting stats).

## Currently shipped / pending

- ✅ Container, Button (primary + secondary), Logo, cn()
- ✅ Navbar (fixed `paper`, auto-hide on scroll, desktop dispatch strip, mobile full-screen overlay menu)
- ✅ Footer (`paper`, 4-column grid, Logo `xl`, social pills)
- ✅ Hero (dark, asymmetric: copy left, MiniQuoteForm + ShipmentCascade right, photo bg)
- ✅ TrustStrip, HowItWorks (step-rail), Comparison, Coverage (dot-grid US map), Routes (dispatch manifest), About, FAQ (accordion), FinalCTA, QuoteForm (3-step)
- ⏳ OG image (1200×630) — not yet produced
