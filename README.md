# BladeHaul Auto Transport — Website

Pre-launch landing page for **BladeHaul Auto Transport LLC**, a US car shipping brokerage. Conversion engine for paid traffic and organic search. FMCSA broker authority pending (~2 months out as of May 2026).

**Live URL (when deployed):** [bladehaul.com](https://bladehaul.com) · **Status:** pre-launch, not yet indexed by Google.

---

## For AI agents reviewing this repo

If you are an AI assistant landing on this codebase to provide review or recommendations, read these three files **before** generating any feedback. They are the authoritative project context.

1. **[CLAUDE.md](./CLAUDE.md)** — Master spec. Brand voice rules, site structure, slogan locks, banned vocabulary, technical requirements. Long but load-bearing.
2. **[PRODUCT.md](./PRODUCT.md)** — Customer profile (35–65 stressed B2C, mobile-heavy), strategic principles, canonical section H2s (these override CLAUDE.md drafts), anti-references.
3. **[DESIGN.md](./DESIGN.md)** — Visual system. Color palette (locked hex values), typography, layout rules, elevation patterns, anti-AI-slop list.

Plus [AGENTS.md](./AGENTS.md) — a note from `create-next-app` reminding you to read Next.js docs in `node_modules/next/dist/docs/` since this is Next.js 16 (not the version most training data covers).

### What kind of feedback is most useful

- **Strategic / conversion** — does this convert a stressed parent comparing 8–12 broker quotes on an old iPhone? Where do you see drop-off risk?
- **Visual polish** — the founder has flagged that the design feels "generic, not premium" despite being structurally correct. Specific section-by-section recommendations for visual lift are welcome.
- **A11y** — the form, FAQ accordion, and navbar are the highest-impact a11y surfaces. Verify ARIA attributes and semantic structure.
- **Brand voice violations** — the spec bans self-claims like "trusted", "premium", "honest". If you spot any in the copy, flag them.

### What is locked and what is negotiable

- **LOCKED:** Slogan ("The Sharpest Way to Ship Your Car" / "Sharp on every detail."), color palette (hex values in `tailwind.config.ts`), font stack (Inter + Inter Tight), brand voice rules (no self-claims, no em-dashes).
- **Negotiable:** Everything else — section copy, visual treatments, layout details, motion choices, asset choices.

---

## Quick start

```bash
npm install
cp .env.example .env.local      # fill in keys as needed
npm run dev                     # http://localhost:3000
```

Available scripts:

| Script             | What it does                                        |
| ------------------ | --------------------------------------------------- |
| `npm run dev`      | Local dev server with HMR (Turbopack)               |
| `npm run build`    | Production build                                    |
| `npm run start`    | Run the production build locally                    |
| `npm run lint`     | ESLint over the whole codebase                      |
| `npm run format`   | Prettier write across all files                     |
| `npm run format:check` | Prettier check without writing                  |

---

## Tech stack

- **Framework:** Next.js 16 (App Router) + React 19
- **Language:** TypeScript strict mode
- **Styling:** Tailwind CSS v3.4
- **Forms:** React Hook Form + Zod
- **Icons:** Lucide React
- **Email:** Resend (stubbed; only fires when `RESEND_API_KEY` is set)
- **CRM webhook:** BeRocker (stubbed; activates post-FMCSA MC#)
- **Deploy target:** Vercel

**Banned at the project level:** Framer Motion, GSAP, any JS animation library. CSS transitions only. Lighthouse targets: Performance ≥90, Accessibility ≥95, Best Practices 100, SEO 100. Initial JS bundle <100KB.

---

## Project structure

```text
app/
├── layout.tsx              Root layout, metadata API, font loading
├── page.tsx                Landing page (composes all sections)
├── globals.css             Tailwind directives + base layer
├── robots.ts               robots.txt generator
├── sitemap.ts              sitemap.xml generator
├── api/quote/route.ts      POST /api/quote (Zod validate, rate limit, Resend stub)
├── privacy/page.tsx        Privacy Policy (draft, needs legal review)
└── terms/page.tsx          Terms of Service (draft, needs legal review)

components/
├── shared/
│   ├── Container.tsx       max-w-7xl wrapper, polymorphic `as` prop
│   ├── Button.tsx          Primary/secondary, md/lg, optional href
│   └── Logo.tsx            next/image over /public/logo.png
└── sections/
    ├── Navbar.tsx          Sticky top, dark, Logo + nav links + CTA
    ├── Hero.tsx            Dark, asymmetric layout, MiniQuoteForm right
    ├── MiniQuoteForm.tsx   3-field starter form, sessionStorage handoff
    ├── TrustStrip.tsx      4 mechanical chips
    ├── HowItWorks.tsx      3-step grid with Lucide icons
    ├── Comparison.tsx      Light, 5 pain-vs-mechanism pairs
    ├── Routes.tsx          Dark, 10-route card grid
    ├── About.tsx           Light, founder bio + 3 fact bullets
    ├── FAQ.tsx             Light, accordion (client component, grid-rows animation)
    ├── FinalCTA.tsx        Dark, single push CTA
    ├── QuoteForm.tsx       Light, full 9-field quote form (client component)
    └── Footer.tsx          Dark, 4-column grid + social pills + bottom strip

lib/
├── cn.ts                   clsx + tailwind-merge class merge utility
├── phone.ts                US phone format-as-typing helper
└── validation.ts           Zod schema for the quote form

public/
├── logo.png                Full logo (4096×4096 transparent PNG)
└── blade-emblem.png        Emblem-only variant (587×533 transparent PNG)
```

---

## Environment variables

| Key                       | Required for                      | Default behaviour if missing             |
| ------------------------- | --------------------------------- | ---------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`    | Canonical URLs, sitemap, robots   | Falls back to `https://bladehaul.com`    |
| `RESEND_API_KEY`          | Outbound email notification       | Notification is skipped, logged instead  |
| `BEROCKER_WEBHOOK_URL`    | CRM forwarding                    | Forward is skipped                       |
| `ADMIN_EMAIL`             | Where Resend sends notifications  | Notification is skipped if missing       |

Pre-launch, all keys can be empty and the form still works end-to-end (logs to console only).

---

## Phase status

| Phase                                                     | Status            |
| --------------------------------------------------------- | ----------------- |
| 1 — Foundation (scaffold, Tailwind, fonts, Prettier)      | ✅ Done           |
| 2 — Shared primitives (Container, Button, Logo, cn)       | ✅ Done           |
| 3 — 11 page sections                                      | ✅ Done           |
| 4 — API route, validation, email/webhook stubs            | ✅ Done           |
| 5 — Metadata, robots, sitemap, JSON-LD                    | ✅ Done           |
| 5 — OG image, favicon                                     | ⏸ Deferred (waiting for visual identity lock) |
| 6 — Privacy + Terms pages                                 | ✅ Done (draft, needs legal review) |
| 7 — Lighthouse / WCAG / responsive pass                   | 🟡 In progress    |
| 8 — Deploy to Vercel + DNS                                | ⏳ Pending        |

---

## Known limitations / open questions

- **Visual identity is not final.** Founder has flagged the design as feeling "generic" despite structurally correct. Reviewers are encouraged to suggest concrete visual polish moves.
- **Legal documents (Privacy / Terms) are starting drafts.** They have not been reviewed by a US attorney. Before production launch, both need legal review with a focus on broker-specific clauses and FMCSA compliance.
- **No real customer reviews, MC#, or USDOT number** is published yet. The site avoids claiming any of these and uses pre-launch soft trust signals instead.
- **The founder operates from Ukraine** and customer traffic is mostly US-based. The promised SLA in the success state is "within 2 hours" — realistic for US business hours, may need adjusting for off-hours coverage post-launch.

---

## License

Proprietary. © 2026 BladeHaul Auto Transport LLC.
