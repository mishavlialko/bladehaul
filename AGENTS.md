<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

---

## BladeHaul — Agent Operating Context

**Master spec:** `CLAUDE.md` (project + voice + visual system), `PRODUCT.md` (positioning), `DESIGN.md` (token-level visual rules). Read those before any non-trivial change.

This file is the **delta** — what's true today that the master files don't capture, or that a new agent would otherwise miss.

### Stack reality

- **Next.js 16.2**. App Router. Turbopack-default dev server.
- **CRITICAL — Turbopack dev mode breaks hydration on mobile clients.** Client-component `useEffect` never fires on iPhone Safari and Xiaomi Chrome in dev. Discovered 2026-05-22 while debugging the auto-hide navbar. When debugging ANY mobile rendering bug, FIRST test against `npm run build && npm start -- -H 0.0.0.0`. Do NOT rewrite code based on dev-server mobile behavior — verify on prod build.
- React 19. TypeScript strict.
- Tailwind v3 (config in `tailwind.config.ts`). v4 is NOT in use — do not use v4 syntax (`@import "tailwindcss"`, etc).
- LAN dev URL for mobile testing: `http://192.168.50.253:3000` (Misha's machine).

### Hard bans

- **No animation libraries.** Framer Motion, GSAP, AOS, lottie-react — all banned for bundle-size reasons. CSS transitions only.
- **No new dependencies without asking Misha first.** Justify the need; check `package.json` before assuming a lib exists.
- **No `git commit` / `git push` unless Misha explicitly asks.** Edit files freely. Leaving the working tree uncommitted is the default state. He says "сохрани" / "залей на гитхаб" / "push" when he wants it committed.
- **No emojis** in copy or code (one per page max, only if explicitly intentional). Replace symbol-emojis with Phosphor / Heroicons / inline SVG.
- **No phrases banned by CLAUDE.md voice section** — "premium", "family-owned", "hassle-free", "your trusted partner", "fixed pricing", "bait-and-switch", "world-class", "we pride ourselves", etc. Read the full list in CLAUDE.md section "Brand Voice".
- **No published prices.** No ballpark ranges, no "average cost" figures, anywhere. Misha's call (2026-06-10): carrier prices move daily, so a published number is a promise we can't keep. The message is always "individual live market check for your exact route", never a number. Quote SLA wording: "within 2 business hours".
- **"The Written Price Rule"** is the official brand name for the price-change mechanism (written notice + two options). Used in Comparison (mono tag) and FAQ. Don't rename, don't translate into "Promise"/"Lock" language.

### Layout invariants (don't break these)

- **Navbar is `position: fixed` with auto-hide on scroll-down, show on scroll-up.** It's not in the document flow. Heights: 80px mobile, 160px sm, 200px md+ (160 main row + 40 utility strip).
- **Hero `pt-` must include `env(safe-area-inset-top)`** to handle iOS standalone mode. Current values: `pt-[calc(8rem+env(safe-area-inset-top))] sm:pt-[calc(12rem+env(safe-area-inset-top))] md:pt-[calc(15rem+env(safe-area-inset-top))]`.
- **All anchorable sections use `scroll-mt-28 sm:scroll-mt-48 md:scroll-mt-60`** so anchor links don't land hidden behind the navbar.
- **Mobile-first verification at 390px viewport (iPhone 14 Pro) is required** before any UI change is "done". Mobile is the dominant traffic.

### Conventions

- **Reuse shared primitives:** `components/shared/{Container, Button, Logo}`. Don't inline `max-w-7xl mx-auto` — use `<Container>`. Don't write raw `<a>` styled like a button — use `<Button>`.
- One component per file. Default export. Types in same file unless reused across files.
- Tap targets ≥ 44×44px (Apple HIG). Body text ≥ 14px on mobile.
- No `h-screen` for full-height sections — use `min-h-[100dvh]` (iOS Safari viewport bug).
- Animate only `transform` and `opacity`. Never `width`, `height`, `top`, `left`.

### Design rule — industrial as ambient flavor

The BladeHaul aesthetic blends **Swiss Industrial Print** (light substrate `bg-paper #F4F4F0`, heavy condensed display type) with **tactical-telemetry micro-typography** (JetBrains Mono, ASCII brackets, coordinate-style metadata).

**Key rule:** industrial/tactical elements stay **decoration** — bg grids, hairlines, mono micro-copy, status strips. They never become foreground or compete with primary CTAs. Secondary visual proof (shipment cards, telemetry strips, dispatch-log mocks) NEVER outweighs the "Get a Real Quote" button.

### Pre-deploy security checklist (REQUIRED before any prod deploy)

Surface this list whenever Misha mentions "deploy", "DNS", "go-live", or "Vercel":

1. Rate limit `/api/quote` (5 req per IP per minute, in-memory or Upstash)
2. Honeypot field in `QuoteForm` (hidden `<input>` that bots fill; reject if non-empty)
3. Security headers — CSP, X-Frame-Options: DENY, Referrer-Policy: strict-origin-when-cross-origin, Permissions-Policy
4. Email sanitization — no raw user input in subject/body of admin notification email
5. `public/.well-known/security.txt` with `Contact: misha@bladehaul.com`
6. Footer scam-warning microcopy — "BladeHaul will never call you asking for wire transfer or gift cards. Report fraud to FMCSA."

### Team and stakeholders (for context, not collaboration)

- **Misha (Mykhailo Vlialko)** — sole owner, in Odesa Ukraine, 5y broker experience, NOT a programmer. Bilingual EN/RU. Explain tech in plain language; no jargon without unpacking it.
- **Lera** — SEO partner. Will hand off keyword targets and route-page content later. Routes section is currently hardcoded; awaiting her data.
- **Denis** — JS dev (Lera's brother), running a *parallel* site as comparison. NOT collaborating on this codebase.
- **Ivan** — ops manager partner.
- **Sasha** — $15K investor, deal under restructuring.

### Recently shipped (2026-06)

- **Mobile hamburger menu** — full-screen dark overlay (numbered `[01]`–`[04]` links + CTA + contact strip), body-scroll lock, focus trap, focus restore to trigger, auto-close on sm-breakpoint resize, closes on link / backdrop / X / ESC.
- **HowItWorks** redesigned as a step-rail — connected orange nodes, mono `[01]`–`[03]` labels.
- **Routes** redesigned as a dispatch-manifest table — `[R-001]` IDs, ORIGIN → DESTINATION columns.
- **Logo** now `public/logo.svg` (3.3 KB); old 3.3 MB `logo.png` deleted. Favicon at `app/icon.svg` (emblem only). Logo click on home scrolls to top.
- **Audit fixes (Day 1 + full Fable pass)** — `text-faint` token now `#68707E` (WCAG AA on paper/white, fixed 25+ spots in one line); Hero bg → `next/image` `priority` (LCP); ZIP lookup single-effect + ref-dedup; shared `QuoteField.tsx` (killed 3 copies of Field/inputClass); MiniQuoteForm label semantics; ShipmentCascade static picks (no hydration repaint); vehicle-make `<datalist>` wired from `lib/makes.ts`; dead `lib/zips.ts` deleted; skip-to-content link + `main#main`; `motion-safe:scroll-smooth`; phone placeholder/helper copy; 44×44 tap targets.

### Open audit items (next up)

- **Rate limit** — `/api/quote` has an in-memory limiter (5/IP/min) that will NOT survive Vercel serverless cold starts; swap to Upstash / Vercel KV before relying on it in prod (pre-deploy cluster).
- **OG image (1200×630)** — `metadata.openGraph` has NO image yet; link shares render bare. Produce from logo + slogan on brand background.
- **`public/blade-emblem.png`** (129 KB) — unused by code; keep only if needed as an OG-image source.

### MC#-activation day content (pre-written, DO NOT publish before MC# is active)

The site goes live before FMCSA broker authority. The moment MC#/DOT# become active, ship this content same-day (customers use MC# lookup as their #1 scam filter, per Reddit/X research 2026-06):

1. **New FAQ entry** (insert near "How is my price determined?"):
   - q: `How do I verify you're a licensed broker?`
   - a: `Our MC and DOT numbers are in the footer. Look us up on the FMCSA SAFER system, the same way we check every carrier we work with.`
2. **Footer bottom strip** — add real MC# / USDOT numbers (placeholder slot already planned per CLAUDE.md).
3. **TrustStrip** — swap soft signals per CLAUDE.md: MC# number, insurance status, reviews badge (when reviews exist).

### Content decisions log (so agents don't re-litigate)

- **Double-brokering Comparison pair** — proposed by Grok (2026-06), Misha declined for now. Don't re-propose unless he raises it.
- **"Daily updates... Even when nothing changes"** — overpromising concern raised (solo founder, UA timezone); Misha decided to KEEP as is (2026-06). Don't water it down.
- **Relative price words ("cheaper", "runs lower", "pricing is different")** — allowed; the hard ban covers FIGURES (ranges, percentages, dollar amounts), not direction. The "30 to 50% cheaper" figure was removed from FAQ accordingly.
- **TCPA/consent legal text in QuoteStepContact** — do not soften/reword without a lawyer.

### Pending / known gaps

- **BeRocker CRM webhook** — pending MC# activation. Email + webhook logic is inline in `/api/quote/route.ts` (the `notify()` fn, uses Resend); there is no `lib/email.ts`. Both are gated on env vars (`RESEND_API_KEY`, `ADMIN_EMAIL`, `BEROCKER_WEBHOOK_URL`) and fall back to `console.log` when unset.
- **Real customer reviews** — none yet. No fake testimonials anywhere.
- **OpenPhone number** — not activated. Footer phone is placeholder.
- **MC# / DOT#** — pending FMCSA approval. Footer / trust strip uses soft signals until then.

### When in doubt — stop and ask

For any non-programming judgment call (library versions, brand/copy/voice, scope, business positioning, pricing model), **stop and ask Misha**. Do not improvise on slogan, banned phrases, pricing structure, or competitive positioning — these are non-negotiable.

Three AI agents work on this project and all read this file: **Claude Code** (VS Code; has a Chrome DevTools MCP for live browser + screenshot checks), **Gemini** (in Antigravity IDE), and **Grok Build** (terminal CLI). For a second opinion, Misha relays between them. Grok also covers research / legal / docs.
