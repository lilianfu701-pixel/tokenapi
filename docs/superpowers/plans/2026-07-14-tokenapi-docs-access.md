# TokenAPI Docs And Access Request Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a developer documentation page and a static API access request path so TokenAPI feels closer to a real API product.

**Architecture:** Keep the site static in Next.js App Router. Add `app/docs/page.tsx` for public developer documentation, update `app/page.tsx` navigation and contact section, extend `app/globals.css` with reusable doc/form styles, and verify content with the existing Node test runner.

**Tech Stack:** Next.js 16 App Router, React Server Components, Tailwind CSS v4 global stylesheet, Node test runner, Vercel.

---

### Task 1: Add Failing Coverage Tests

**Files:**
- Modify: `tests/rendered-html.test.mjs`

- [ ] **Step 1: Add docs route assertions**

Read `app/docs/page.tsx` and assert it contains:

```js
assert.match(docs, /TokenAPI Developer Docs/);
assert.match(docs, /Authorization: Bearer tk_live_/);
assert.match(docs, /GET \/v1\/tokens\/\{chain\}\/\{address\}/);
assert.match(docs, /Rate limits/);
assert.match(docs, /Error responses/);
```

- [ ] **Step 2: Add homepage access assertions**

Assert `app/page.tsx` contains:

```js
assert.match(page, /Request API Access/);
assert.match(page, /name="email"/);
assert.match(page, /name="use_case"/);
assert.match(page, /\/docs/);
```

- [ ] **Step 3: Run tests**

Run: `cmd /c npm test`

Expected: FAIL because `app/docs/page.tsx` does not exist yet and the homepage has not been updated.

### Task 2: Implement Static Docs Page

**Files:**
- Create: `app/docs/page.tsx`

- [ ] **Step 1: Export route metadata**

Use a route-level `metadata` export with the title `TokenAPI Developer Docs`.

- [ ] **Step 2: Render documentation sections**

Include sections for Overview, Authentication, Core endpoints, Example request, Example response, Rate limits, Error responses, and Launch status.

- [ ] **Step 3: Keep docs static**

Do not add client hooks, runtime fetches, or environment variable reads.

### Task 3: Update Homepage Access Flow

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Add Docs navigation**

Add a `/docs` navigation link and change CTA wording to `Request API Access`.

- [ ] **Step 2: Add static access form**

Replace the contact-only block with a static form using `action="mailto:hello@tokenapi.biz"`, `method="post"`, and fields for name, email, company, and use case.

- [ ] **Step 3: Fix multilingual copy**

Ensure Chinese and Spanish strings are valid UTF-8 in source.

### Task 4: Extend Styles

**Files:**
- Modify: `app/globals.css`

- [ ] **Step 1: Add form styles**

Style labels, inputs, textarea, helper text, and the access section grid.

- [ ] **Step 2: Add docs styles**

Style docs shell, side navigation, code blocks, endpoint rows, response grids, and mobile collapse.

### Task 5: Verify And Deploy

**Files:**
- Test: `tests/rendered-html.test.mjs`
- Build: project root

- [ ] **Step 1: Run tests**

Run: `cmd /c npm test`

Expected: PASS.

- [ ] **Step 2: Run lint**

Run: `cmd /c npm run lint`

Expected: PASS.

- [ ] **Step 3: Run production build**

Run: `cmd /c npm run build`

Expected: PASS. If Google Fonts are blocked locally, rerun with network approval.

- [ ] **Step 4: Commit, push, deploy**

Run:

```bash
git add app/page.tsx app/globals.css app/docs/page.tsx tests/rendered-html.test.mjs docs/superpowers/plans/2026-07-14-tokenapi-docs-access.md
git commit -m "Add TokenAPI docs and access request flow"
git push origin main
cmd /c npx vercel --prod --yes --scope lilianfu701-pixels-projects
```
