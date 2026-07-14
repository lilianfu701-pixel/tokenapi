# TokenAPI

TokenAPI is a multilingual marketing site concept for API and developer-tool
brands. The first version includes English, Simplified Chinese, and Spanish
sections, plus a GitHub-to-Vercel publishing narrative that matches the
workflow you asked for.

## Prerequisites

- Node.js `>=22.13.0`

## Local Development

```bash
npm install
npm run dev
```

## Validation

```bash
npm run build
npm test
```

## Project Shape

- `app/page.tsx` contains the full homepage experience
- `app/layout.tsx` defines the site metadata and shared fonts
- `app/globals.css` holds the visual system and responsive layout
- `public/favicon.svg` provides the site icon

## Deployment

The site is designed to live in GitHub and publish through Vercel once your
GitHub connection is refreshed.
