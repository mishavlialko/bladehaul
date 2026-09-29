# BladeHaul website

Next.js website for BladeHaul Auto Transport LLC, a Texas company.

## Stack

Node.js 24, npm, Next.js 16, React 19, TypeScript and Tailwind CSS 3.
The repository includes the homepage, Privacy Policy, Website Terms, quote
validation, and a separately enabled temporary quote-delivery service.

## Local development

```sh
npm ci
npm run dev
```

For a production-render preview:

```sh
npm run build
npm start
```

## Checks

```sh
npm run lint
npm exec -- tsc --noEmit
npm run format:check
npm test
npm run build
```

Tests use synthetic requests and mocked providers. They do not establish
successful live email delivery or configured cloud services.

## Deployment

Deploy on Vercel with the Next.js preset, Node 24, `npm ci` and `npm run build`.
The canonical site origin is configured through `NEXT_PUBLIC_SITE_URL`.
`.vercelignore` restricts uploaded files to runtime source and build settings.

The quote API is disabled by default. Setting provider credentials alone does
not activate it. Keep `QUOTE_INTAKE_ENABLED=false` until the authorized release
and actual storage, email, abuse-control and retention checks are complete.
The website does not process payments or create paid transport orders.

`.env.example` documents placeholders. Never commit actual credentials,
customer records, private business documents or deployment access tokens.
Use separate private storage and credentials for production and test previews.

## Source scope

This repository contains application source, tests and build configuration.
Business records, internal research, operational evidence and received company
documents are maintained separately. The old static landing page is a separate
repository and is not the source of this application.
