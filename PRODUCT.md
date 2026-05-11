# PRODUCT.md — BladeHaul Auto Transport

## Register

**brand** — this is a marketing landing page where design IS the product. Conversion engine for paid traffic and organic search visitors who land here from aggregator broker quotes and Google Ads.

## Product Purpose

Convert stressed B2C car shippers (private owners, not third-party) into qualified leads via a quote form. Pre-launch: FMCSA broker authority pending, MC# activation ~2 months out. Quote form fully operational from day one; lead pushed to BeRocker CRM webhook (stubbed pre-MC#).

The page exists to do **one job** in three seconds: convince a stressed parent comparing 8–12 brokers on their phone that BladeHaul is the one operator who won't bait-and-switch them.

## Users

**Primary (first 12 months, B2C):**

- Age 35–65, middle-to-upper income
- Shipping a vehicle they own (relocation, snowbird seasonal, inheritance, gift car, online purchase)
- Emotional state: stressed — their car matters, the situation matters
- Mobile-heavy: 70%+ traffic from phones, often older phones (iPhone SE-class screens)
- Comparing 8–12 broker quotes simultaneously from aggregator leads
- Will pick whoever responds fastest with confidence and clarity

**What they fear (the 5 pain points the design must address):**

1. Bait-and-switch — quoted $400, then $700 after deposit
2. Silence after deposit — no updates for days, carrier doesn't show
3. Pressure — last-minute calls to raise price under time pressure
4. Damage — vehicle arrives scratched with no recourse
5. Call-center experience — different person every call

**What they want:**

1. Honest quote that reflects market reality
2. Same person handling their order from quote to delivery
3. Daily proactive updates, not silence
4. Clear written communication when something changes
5. Knowing their car is in good hands

## Brand Voice and Tone

**Direction:** direct, not corporate. Confident, not aggressive. Specific, not vague. Plain English at sixth-grade reading level.

**Slogan (NON-NEGOTIABLE, locked 2026-05-09):**

- H1: `The Sharpest Way to Ship Your Car` (Title Case)
- Sub-line: `Sharp on every detail.` (Sentence Case, with period)

**Show, don't claim.** No self-praise vocabulary: "trusted", "premium", "world-class", "honest", "family-owned", "five-star", "hassle-free". Trust comes from describing the mechanism, not adjectives.

**Real differentiators (what we say instead of self-claims):**

- One dispatcher from quote to delivery
- Daily client updates, even on quiet days
- Price changes confirmed in writing — two options offered, written confirmation required
- No deposit until carrier confirmed
- Operator background: 5 years + 1,000+ shipments handled before BladeHaul

## Anti-References

Visual and copy patterns to actively AVOID:

- **Other auto-transport broker sites.** Generic stock photos of car carriers on highways, "America's #1" / "5-star" badges, free-quote popups, yellow-and-blue patriotic palettes, sliders, exclamation marks. Looks like everyone else.
- **Cheap SaaS gradients.** Pastel purple-pink hero backgrounds, glassmorphism cards, blob shapes, gradient text. We are not a 2021 design Twitter darling.
- **Luxury car dealership aesthetic.** Black + gold, hairline serifs, "experience the BladeHaul difference". Wrong customer.
- **Insurance / lawyer site aesthetic.** Stock photo of smiling family, blue header, navy CTA. Generic trust theater.
- **The hero-metric template.** Big number + small label + supporting stats with gradient accent. Banned across all impeccable projects.

## Reference Aesthetic

**Target register:** mechanical operator. Linear-style precision, Vercel-style restraint, Ramp-style trust through specificity. Sharp, intentional, expensive-looking through restraint and craft — not through luxury cliches.

The blade-shield emblem in the logo is the visual anchor: geometric arrows pointing inward, sharp edges, military-utility feel without being aggressive. Type carries the brand, not chrome.

## Strategic Principles

1. **Hero does one job:** prevent close-tab in 3 seconds. Every pixel earns its place toward that single goal.
2. **Trust through mechanism, not adjectives.** "Same dispatcher from quote to delivery" beats "trusted service."
3. **Pre-launch honesty.** No MC#, insurance certs, customer reviews, or phone yet. Don't fake them, don't write "coming soon" — just don't claim what we can't back.
4. **Mobile is the canonical view.** Old iPhones too. Design on 320–375px first, scale up.
5. **One CTA dominates each screen.** Secondary actions are subordinate links, not competing buttons.
6. **Brand voice is locked. Everything else is negotiable, but voice is the contract.**

## Canonical section H2s (overrides CLAUDE.md drafts)

The CLAUDE.md spec contains draft section H2s written before brand voice rules were finalized. Several of those drafts contain self-claim wording ("Why customers choose BladeHaul", "How BladeHaul Works") which violates the show-don't-claim principle in this document. Grok provided brand-voice-compliant replacements which Misha approved 2026-05-10. These are now canonical and supersede CLAUDE.md:

| Section          | CLAUDE.md draft (deprecated)        | Canonical H2 (current)                                                                               |
| ---------------- | ----------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Hero eyebrow     | "COAST-TO-COAST AUTO TRANSPORT"     | "ONE DISPATCHER · 50 STATES · DAILY UPDATES"                                                         |
| Hero CTA primary | "Get Your Quote in 60 Seconds"      | "Get a Real Quote"                                                                                   |
| HowItWorks       | "How BladeHaul Works"               | "How it works"                                                                                       |
| HowItWorks sub   | (none)                              | "We do the same thing every single time."                                                            |
| Comparison       | "Why customers choose BladeHaul"    | "How we're different"                                                                                |
| Comparison sub   | (none)                              | "Here's what actually happens after you book."                                                       |
| Routes           | "Auto Transport, Coast-to-Coast"    | "We ship coast to coast"                                                                             |
| Routes sub       | "Brief copy about US-wide coverage" | "We move cars between any two points in the United States. These are the routes we ship most often." |

When agent reviews flag any of these as "deviation from CLAUDE.md", treat the flag as informational, not as a fix-required item. The canonical H2s above win.

## Tech Constraint

Next.js 16 + React 19 + TypeScript strict + Tailwind v3 + App Router. No animation libraries (Framer Motion, GSAP banned). CSS transitions only. Lighthouse targets: Performance ≥90, Accessibility ≥95, Best Practices 100, SEO 100. Initial JS bundle <100KB.
