# Website contributor guide

- Use Node 24 and npm with the committed lockfile. Read the relevant installed
  Next.js documentation before changing framework behavior.
- Preserve unrelated work. Do not add dependencies without approval.
- Use the existing components, brand colors and Tailwind 3 configuration.
  Keep the headline and tagline unless a change is specifically requested.
- Check mobile layouts at 390 px and test production builds, not only dev mode.
  Maintain keyboard navigation, visible focus and reduced-motion support.
- Shared quote validation lives in `lib/validation.ts`. Keep client/server
  fields, consent, notification content and privacy disclosures consistent.
- Keep real credentials, customer data and internal business notes out of Git.
  Only placeholder environment values belong in `.env.example`.
- Do not invent reviews, authority status, pricing, insurance or delivery claims.
  Website Terms do not replace a separately accepted transport agreement.
- A passing build does not authorize enabling real intake or payments.
- Run lint, standalone TypeScript, formatting, tests and production build.
  Format only changed files and preserve the package lockfile.
