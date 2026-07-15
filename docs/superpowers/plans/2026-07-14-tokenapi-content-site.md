# TokenAPI Content Site Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade TokenAPI from a placeholder landing page into a credible multilingual API content site with product, documentation, use-case, pricing, FAQ, and contact sections.

**Architecture:** Keep the app as a static Next.js App Router page so Vercel can build and serve it reliably. Store section content in typed arrays inside `app/page.tsx`, style the site in `app/globals.css`, and verify important copy through the existing Node test.

**Tech Stack:** Next.js 16 App Router, React Server Components, Tailwind CSS v4 global stylesheet, Node test runner, Vercel.

---

### Task 1: Expand Content Coverage Test

**Files:**
- Modify: `tests/rendered-html.test.mjs`

- [ ] **Step 1: Replace placeholder assertions**

Update the test to assert real product sections:

```js
assert.match(page, /Token data infrastructure for products that need trusted market context\./);
assert.match(page, /API capabilities/);
assert.match(page, /Token profiles/);
assert.match(page, /Wallets and portfolio apps/);
assert.match(page, /Developer/);
assert.match(page, /常见问题/);
assert.match(page, /Lista de espera/);
```

- [ ] **Step 2: Run the test and verify it fails**

Run: `npm test`

Expected: FAIL because the current page still contains the placeholder homepage.

### Task 2: Replace Homepage Content

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Create structured content arrays**

Define arrays for navigation, stats, API capabilities, use cases, language panels, pricing tiers, FAQ items, and integration steps.

- [ ] **Step 2: Render production-ready sections**

Render a full single-page site with anchors:

```text
#product
#api
#use-cases
#languages
#pricing
#faq
#contact
```

- [ ] **Step 3: Preserve static rendering**

Avoid client-only hooks, browser APIs, runtime data fetching, or environment variables.

### Task 3: Refresh Visual System

**Files:**
- Modify: `app/globals.css`

- [ ] **Step 1: Replace placeholder styles**

Use a crisp product-site visual direction with light surfaces, high-contrast text, restrained dark panels, code samples, tables, and responsive grids.

- [ ] **Step 2: Fix mobile layout**

Ensure all sections collapse to single-column grids below tablet width and navigation wraps cleanly.

### Task 4: Update Metadata

**Files:**
- Modify: `app/layout.tsx`

- [ ] **Step 1: Update title and description**

Set metadata to describe TokenAPI as a multilingual token data API website.

### Task 5: Verify, Publish, Deploy

**Files:**
- Test: `tests/rendered-html.test.mjs`
- Build: project root

- [ ] **Step 1: Run tests**

Run: `npm test`

Expected: PASS.

- [ ] **Step 2: Run production build**

Run: `npm run build`

Expected: PASS.

- [ ] **Step 3: Commit and push**

Run:

```bash
git add app/page.tsx app/globals.css app/layout.tsx tests/rendered-html.test.mjs docs/superpowers/plans/2026-07-14-tokenapi-content-site.md
git commit -m "Expand TokenAPI into content-rich multilingual site"
git push origin main
```

- [ ] **Step 4: Deploy to Vercel**

Run: `npx vercel --prod --yes --scope lilianfu701-pixels-projects`

Expected: production deployment succeeds and updates `tokenapi-iota.vercel.app`.
