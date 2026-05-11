# CLAUDE.md — BladeHaul Auto Transport Landing Page

This file is the master context for AI assistants (Claude Code, Cursor, Antigravity, etc.) working on the BladeHaul website. Read this fully before writing any code.

---

## Project Overview

**Project:** Landing page for BladeHaul Auto Transport LLC
**Goal:** Convert paid traffic and organic search visitors into qualified car shipping leads via a quote form. Lead data will be pushed to BeRocker CRM via webhook (when activated, post-MC#).
**Status:** Pre-launch. Company registered, EIN pending, FMCSA broker authority pending. Site will go live before MC# becomes active; quote form is fully operational from day one.
**Stack:** React (Next.js 14+ App Router) + Tailwind CSS + TypeScript. Deployment: Vercel.

---

## Company Context

**Legal entity:** BladeHaul Auto Transport LLC, Wyoming-registered single-member LLC, formed April 26, 2026. Owner is a non-US resident based in Ukraine.

**Business model:** Auto transport brokerage. Matches private car owners (B2C) with vetted carriers across all 50 US states. Future expansion to B2B dealer relationships in Phase 3 (month 7+).

**Real competitive advantage:** Transparent process with daily client updates from contract signing to delivery. Honest written communication about price changes (raises) with two options offered to customer, requiring written confirmation. This is NOT "fixed pricing" — that would be dishonest in broker model where carrier prices fluctuate. The differentiator is the COMMUNICATION around price changes, not the absence of changes.

**Target customer profile (B2C, primary for first 12 months):**

- Age 35-65, middle-to-upper income
- Shipping a vehicle they own (not a third-party purchase)
- Common scenarios: relocation, snowbird seasonal, inheritance, gift car, online purchase
- Often emotional situation — their car is important to them, they are stressed
- Comparing 8-12 broker quotes simultaneously from aggregator leads
- Will pick the broker who responds fastest with confidence and clarity

**What customer fears (the pain points the site must address):**

1. Bait-and-switch — quoted $400, then suddenly $700 after deposit
2. Silence — no updates for days, carrier doesn't show up
3. Pressure — last-minute calls to raise price under time pressure
4. Damage — vehicle arrives scratched/dented with no recourse
5. Generic call-center experience — different person every call

**What customer wants:**

1. Honest quote that reflects market reality
2. Same person handling their order from quote to delivery
3. Daily proactive updates, not silence
4. Clear written communication when something changes
5. Knowing their car is in good hands

---

## Brand Voice and Slogan System

**Main slogan (HERO H1):**

> The Sharpest Way to Ship Your Car

**Sub-line (HERO subtitle):**

> Sharp on every detail.

**Slogan rules:**

- Main slogan is in Title Case: every significant word capitalized
- Sub-line is in Sentence Case: only first word capitalized, ends with period
- Never use ALL CAPS for either
- Never add exclamation marks or emojis
- Slogan is brand DNA — repeats "Sharp" twice, connecting visually to the BLADE in BladeHaul name and to the blade emblem in logo

**Voice principles:**

- **Direct, not corporate.** Write like a smart human, not a marketing department.
- **Confident, not aggressive.** "The Sharpest Way" claims authority. We don't need to shout.
- **Specific, not vague.** Avoid "premium," "world-class," "trusted." Show, don't claim.
- **Plain English.** Sixth-grade reading level. No industry jargon (no "bait-and-switch", no "FMCSA-licensed broker authority" on customer-facing pages).
- **Anti-clichés.** Never use: "Your trusted partner in auto transport," "Family-owned and operated," "Five-star service," "Hassle-free experience," "We treat your car like our own."

**Words and phrases to AVOID:**

- "Premium," "luxury," "world-class," "best-in-class"
- "Bait-and-switch" (insider term, scares customers who don't know it)
- "Quotes that don't change," "Fixed pricing" (dishonest in broker model)
- "Family-owned," "We treat your car like our own"
- "Hassle-free," "Stress-free," "Effortless"
- "Solutions" (corporate filler)
- "We pride ourselves on..."
- Excessive emojis (one per page maximum, if at all)

**Words and phrases that WORK:**

- "Daily updates"
- "Real people"
- "Honest quotes"
- "Coast-to-coast"
- "Vetted carriers"
- "Door-to-door"
- "Written confirmation"
- "Same person every call"
- "From quote to driveway"

---

## Visual Design System

**Color palette (steel + orange brand):**

| Token         | Hex       | Usage                                              |
| ------------- | --------- | -------------------------------------------------- |
| `navy`        | `#0B0D11` | Page background (dark sections), navbar background |
| `dark`        | `#14181F` | Card backgrounds on dark sections                  |
| `steel`       | `#6B7689` | Secondary text, "BLADE" in logo                    |
| `text`        | `#1A1A1A` | Primary text on light sections                     |
| `text-dim`    | `#555B67` | Secondary text on light sections                   |
| `text-faint`  | `#8A95A8` | Captions, microcopy                                |
| `orange`      | `#EA6A11` | Primary accent, CTAs, "HAUL" in logo               |
| `orange-dark` | `#B75A1D` | Hover state for orange CTAs                        |
| `orange-bg`   | `#FFF1E5` | Subtle background tint for callouts                |
| `line`        | `#E1E4E8` | Borders, dividers on light sections                |
| `line-soft`   | `#F1F3F5` | Very subtle backgrounds, alternating rows          |
| `white`       | `#FFFFFF` | Card backgrounds on light sections                 |

**Tailwind extension (add to `tailwind.config.ts`):**

```ts
theme: {
  extend: {
    colors: {
      navy: '#0B0D11',
      dark: '#14181F',
      steel: '#6B7689',
      'text-dim': '#555B67',
      'text-faint': '#8A95A8',
      orange: {
        DEFAULT: '#EA6A11',
        dark: '#B75A1D',
        bg: '#FFF1E5',
      },
      'line-soft': '#F1F3F5',
    },
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
      display: ['Inter Tight', 'Inter', 'sans-serif'],
    },
  },
}
```

**Typography:**

- Headings: Inter Tight (or Inter) — bold/semibold weights
- Body: Inter — regular/medium
- No serif fonts. No cursive. No display fonts.
- H1 (hero): 48–72px desktop, 36–44px mobile
- H2 (section headers): 32–40px desktop, 28–32px mobile
- Body: 16–18px
- Captions: 13–14px

**Layout principles:**

- Max content width: 1280px (`max-w-7xl` in Tailwind), centered
- Generous whitespace, especially around hero and CTAs
- Dark hero, then alternating light/dark sections for rhythm
- Mobile-first responsive (test at 375px, 768px, 1280px, 1920px)
- Buttons: solid orange primary CTA, large click area (min 48px height)
- Border radius: 8px (`rounded-lg`) for cards, 12px (`rounded-xl`) for major sections, full for pills

**Logo usage:**

- Final logo: wordmark "BLADEHAUL" with steel grey "BLADE" + orange "HAUL", inside a torn shield-blade emblem
- Logo will be provided as SVG by Denis (vectorizing now)
- On dark backgrounds: use light/white version
- On light backgrounds: use full color version
- Minimum size: 32px height (use simplified standalone mark for favicons under 64px)
- Clear space around logo: at least 0.5x the height of the logo on all sides

---

## Site Structure

Single-page landing initially. May expand to multi-page after MC# active.

### Sections (top to bottom)

1. **Navbar** (sticky, dark background)
   - Logo (left)
   - Links: How It Works, Routes, About, Reviews (when available)
   - CTA button: "Get a Quote" (right)

2. **Hero**
   - Eyebrow text: small, faint, all-caps: "COAST-TO-COAST AUTO TRANSPORT"
   - H1: "The Sharpest Way to Ship Your Car"
   - Sub-line: "Sharp on every detail."
   - CTA primary: "Get Your Quote in 60 Seconds" (anchors to quote form below or opens modal)
   - Optional secondary CTA: "How it works" (smooth-scrolls to How It Works)
   - Visual: clean, no stock photos of trucks/cars unless original. Subtle gradient or geometric pattern OK. Consider using the blade-shield emblem as a faint background watermark.

3. **Trust strip** (small horizontal band under hero)
   - Brief credibility signals. Until MC# is active, this can be soft and aspirational:
     - "Wyoming-registered LLC"
     - "Vetted carrier network"
     - "Daily client updates"
     - "Written confirmations"
   - When MC# becomes active, replace with: MC# number, Insurance status, Reviews badge

4. **Quote Form (main conversion section)**
   - Heading: "Get Your Quote"
   - Sub-heading: "Sharp on every detail — starting with your price."
   - Fields (in order):
     1. Pickup ZIP + city autofill
     2. Delivery ZIP + city autofill
     3. Vehicle Year (dropdown 1990-current)
     4. Vehicle Make (text input with autocomplete)
     5. Vehicle Model (text input)
     6. Vehicle Condition: Runs / Doesn't Run (radio)
     7. Trailer Type: Open / Enclosed (radio, with note "Open is standard and cheaper")
     8. Ready Date (date picker, default = 3 days from today)
     9. First Name + Last Name
     10. Email
     11. Phone (US format, with country code +1 prefix locked)
   - Submit button: "Get My Quote" (full width on mobile, prominent on desktop)
   - Trust microcopy under form: "No spam, no robocalls. Just a real quote from a real person."
   - **Important:** Quote form submission should POST to a backend endpoint. For now, write the form to POST to `/api/quote` which logs to console and (later) forwards to BeRocker webhook. Email confirmation to misha@bladehaul.com on every submission.

5. **How It Works** (3-step or 4-step process)
   - Section heading: "How BladeHaul Works"
   - Step 1: "Get a real quote" — "We pull pricing based on actual market conditions for your route, not a lowball number to win your business."
   - Step 2: "Lock in your carrier" — "We post your load to vetted carriers, accept the best offer, and confirm everything in writing."
   - Step 3: "Daily updates until delivery" — "From pickup to driveway, you'll know exactly where your car is — every day."
   - Visual: icon for each step (use Lucide React icons: FileText, Truck, MapPin or similar)

6. **What Makes Us Different** (comparison section, optional but strong)
   - Heading: "Why customers choose BladeHaul"
   - Two-column comparison: "Other brokers" vs "BladeHaul"
   - Examples:
     - Other: "Quote you a price they can't actually deliver to win your business" | BladeHaul: "Quote you a real price based on the market today"
     - Other: "Go silent after taking your deposit" | BladeHaul: "Daily updates from contract to delivery"
     - Other: "Call you the day before pickup demanding more money" | BladeHaul: "If the market shifts, we explain it and offer two options — in writing"
     - Other: "Call center with a different person every call" | BladeHaul: "Same dispatcher handling your order from quote to driveway"

7. **Routes We Cover** (SEO content section, lighter on visuals)
   - Heading: "Auto Transport, Coast-to-Coast"
   - Brief copy about US-wide coverage
   - Grid or list of popular routes (for SEO — Lera will provide final keyword targets):
     - NY → FL, CA → NY, IL → FL, TX → CA, NJ → FL, GA → CA, etc.
   - Each route can be a clickable link to a future route-specific page (Phase 2 SEO play)

8. **About / The People** (humanize the brand)
   - Heading: "Built by people who actually do this"
   - Short paragraph: "BladeHaul is led by Mykhailo, a car shipping operator with 5 years of experience and 1,000+ shipments handled before starting BladeHaul. We built BladeHaul because we got tired of seeing customers burned by silent brokers and last-minute price hikes."
   - Optional: photo placeholder (waiting for professional shot)
   - DO NOT include "family-owned" language or fake team members

9. **FAQ** (SEO + customer education)
   - 6–10 questions, expand/collapse
   - Examples:
     - "How long does car shipping take?"
     - "How is my price determined?"
     - "What if the market price changes after I book?"
     - "Open trailer vs enclosed trailer — which do I need?"
     - "Is my car insured during transport?"
     - "Can you handle classic, exotic, or non-running vehicles?"
     - "How far in advance should I book?"
     - "Do you ship to/from auctions?"

10. **Final CTA**
    - Heading: "Ready to ship? Get a quote in 60 seconds."
    - Single CTA button: "Get My Quote"
    - Sub-line: "Sharp on every detail."

11. **Footer**
    - Logo (smaller)
    - Tagline under logo: "The Sharpest Way to Ship Your Car"
    - Three columns:
      - Company: About, Careers (placeholder), Contact
      - Services: How It Works, Routes, FAQ
      - Legal: Privacy Policy, Terms of Service (need to create both)
    - Bottom strip:
      - © 2026 BladeHaul Auto Transport LLC
      - Wyoming-registered LLC
      - DOT/MC# (placeholder until active)
      - Phone (placeholder until OpenPhone activated)
      - Email: info@bladehaul.com

---

## Technical Requirements

**Stack:**

- Next.js 14+ with App Router
- React 18+
- TypeScript (strict mode)
- Tailwind CSS for styling
- Lucide React for icons
- React Hook Form + Zod for form validation
- next/font for font loading (Inter)
- next/image for image optimization

**Page structure:**

```
app/
├── layout.tsx              (root layout, metadata, fonts)
├── page.tsx                (landing — composes all sections)
├── api/
│   └── quote/
│       └── route.ts        (POST endpoint for quote form)
├── privacy/
│   └── page.tsx            (privacy policy)
├── terms/
│   └── page.tsx            (terms of service)
└── globals.css

components/
├── ui/                     (shadcn-style primitives if used)
├── sections/
│   ├── Navbar.tsx
│   ├── Hero.tsx
│   ├── TrustStrip.tsx
│   ├── QuoteForm.tsx
│   ├── HowItWorks.tsx
│   ├── Comparison.tsx
│   ├── Routes.tsx
│   ├── About.tsx
│   ├── FAQ.tsx
│   ├── FinalCTA.tsx
│   └── Footer.tsx
└── shared/
    ├── Container.tsx       (max-w-7xl wrapper)
    ├── Button.tsx
    └── Logo.tsx

lib/
├── routes.ts               (popular routes data for Routes section)
├── faq.ts                  (FAQ data)
└── validation.ts           (Zod schemas for quote form)
```

**SEO requirements:**

- Meta title (page): "BladeHaul Auto Transport — The Sharpest Way to Ship Your Car"
- Meta description: "Coast-to-coast car shipping with honest quotes, daily updates, and vetted carriers. Get your quote in 60 seconds. BladeHaul Auto Transport — sharp on every detail."
- Open Graph image (1200×630): logo + slogan on brand-color background, PNG export
- Twitter card: same OG image
- JSON-LD schema for LocalBusiness (use Wyoming address, add MC# when active)
- robots.txt: allow all (until/unless we want to gate something)
- sitemap.xml: generated by Next.js
- Canonical URLs on every page
- Lighthouse target: Performance 90+, Accessibility 95+, Best Practices 100, SEO 100

**Performance:**

- All images optimized via next/image
- Fonts via next/font with `display: swap`
- No client-side rendering for content that can be server-rendered
- Avoid heavy libraries; prefer native solutions
- Minimize JavaScript bundle (target < 100KB initial load)

**Accessibility:**

- WCAG 2.1 AA minimum
- Semantic HTML (header, main, nav, footer, section, article)
- Skip-to-content link
- Focus states visible on all interactive elements
- Form labels properly associated with inputs (label for=)
- Color contrast ratio 4.5:1 minimum for body text, 3:1 for large text
- Alt text on all images
- ARIA attributes where needed but not over-applied

**Forms:**

- All inputs use proper input types (tel for phone, email for email, etc.)
- Phone input: format as user types, lock to US +1
- ZIP code: auto-fetch city/state via API (use free service like Zippopotam.us)
- Form validation: client-side via Zod + React Hook Form, server-side validation on /api/quote endpoint
- Error messages: inline, friendly tone ("Looks like that phone number is missing a digit")
- Success state: replace form with confirmation message + next-steps text

**API endpoint `/api/quote`:**

- POST method only
- Validates payload with Zod
- Logs to console (for now) — later forwards to BeRocker webhook URL stored in env var `BEROCKER_WEBHOOK_URL`
- Sends email notification to misha@bladehaul.com via Resend or similar
- Returns 200 OK with `{ success: true, quoteId: <uuid> }`
- Returns 400 with validation errors if payload invalid
- Implement basic rate limiting (max 5 requests per IP per minute)

**Environment variables (`.env.local`):**

```
NEXT_PUBLIC_SITE_URL=https://bladehaul.com
RESEND_API_KEY=re_...                  # for email notifications
BEROCKER_WEBHOOK_URL=                  # leave blank until BeRocker activated
ADMIN_EMAIL=misha@bladehaul.com
```

---

## What to NOT Build (yet)

- **Login / user accounts** — not needed for landing
- **Stripe payment integration** — happens after MC# active and in CRM
- **Multi-language support** — English only for US market
- **Blog / CMS** — Lera will add SEO content later; for now hardcode FAQ and Routes data
- **Carrier portal / carrier signup** — separate site, future Phase 3
- **Real-time chat widget** — overkill for launch; add BeRocker chat widget when CRM active
- **Animation libraries** (Framer Motion, GSAP) — keep page fast. Subtle CSS transitions only.
- **Stock photos of generic trucks/cars** — looks like every other broker. Either use original photography or go without imagery.
- **Customer reviews carousel** — no reviews yet. Add when Trustpilot has real reviews after first shipments.

---

## Content Tone Examples

**GOOD copy:**

- "We quote you the real price. No fishing for deposits with lowball numbers."
- "If the market shifts after you book, we'll tell you exactly why and offer two options — in writing."
- "Same dispatcher from quote to delivery. No call-center runaround."
- "Daily updates, even on quiet days. Especially on quiet days."

**BAD copy (do NOT write like this):**

- "BladeHaul Auto Transport is your trusted partner for all your vehicle transportation needs."
- "Our family-owned business treats every car like our own."
- "Experience hassle-free, premium auto transport with industry-leading reliability."
- "We pride ourselves on five-star customer service and white-glove delivery."

---

## Working Style for AI Assistant

When implementing this project:

1. **Read this file first.** Always. Even on a small change.
2. **Ask before introducing new dependencies.** Justify why we need them.
3. **Match the existing component patterns** — if a Container component exists, use it; don't write inline `<div className="max-w-7xl mx-auto">`.
4. **No placeholder content.** If you're writing copy and don't have real data, write actual placeholder COPY (e.g., for routes), don't write Lorem Ipsum.
5. **Mobile-first.** Always implement mobile layout first, then enhance for larger screens.
6. **Component file structure:** one component per file, default export, TypeScript types defined in the same file unless reused across files.
7. **Comments:** only where the code is non-obvious. Self-documenting code preferred over commented code.
8. **Commit messages (if asked to suggest):** conventional commits style (`feat:`, `fix:`, `refactor:`, `style:`, `docs:`).

---

## Project History (key decisions)

- **April 26, 2026:** LLC registered in Wyoming
- **May 1, 2026:** Email infrastructure live (Google Workspace + custom DNS)
- **May 9, 2026:** BeRocker CRM selected after demo (activation pending MC#)
- **May 9, 2026:** Slogan finalized: "The Sharpest Way to Ship Your Car / Sharp on every detail."
- **May 10, 2026:** Landing page work begins

Founder: Mykhailo "Misha" Vlialko (full sole member, non-US resident, based in Odesa, Ukraine).

---

## Contact for questions

If anything in this document is unclear or contradicts another instruction, ask Misha before improvising. The brand voice and slogan rules are non-negotiable. Everything else can be adjusted with discussion.

---

**End of CLAUDE.md**
