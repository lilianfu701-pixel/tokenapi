# TokenAPI Admin Search Export Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add admin search, status filtering, and protected CSV export for access requests.

**Architecture:** Share query normalization and CSV formatting helpers between the list page and export route. The list page reads `q` and `status` query params, uses parameterized Neon queries, and renders a filter form. The CSV export route verifies the admin session before returning filtered request data as a downloadable CSV.

**Tech Stack:** Next.js App Router Server Components and Route Handlers, Neon serverless SQL, Node test runner.

---

### Task 1: Test Search And Export

**Files:**
- Modify: `tests/rendered-html.test.mjs`
- Modify: `tests/admin-auth.test.ts`

- [x] **Step 1: Write failing tests**

Require search/filter UI, shared query normalization, CSV escaping, and protected export route.

- [ ] **Step 2: Run tests and verify failure**

Run `cmd /c npm test`.

Expected: FAIL because query/export modules do not exist yet.

### Task 2: Implement Query And CSV Helpers

**Files:**
- Create: `app/admin/requests/request-query.ts`

- [ ] **Step 1: Normalize search query**

Trim user query, clamp to 120 chars, and preserve only valid review statuses.

- [ ] **Step 2: Format CSV safely**

Escape commas, quotes, newlines, and spreadsheet formula prefixes.

### Task 3: Wire List And Export

**Files:**
- Modify: `app/admin/requests/list/page.tsx`
- Create: `app/admin/requests/export/route.ts`
- Modify: `app/globals.css`

- [ ] **Step 1: Add filter form**

Render search input, status select, apply button, clear link, and CSV export link.

- [ ] **Step 2: Add filtered Neon queries**

Use parameterized SQL branches for no filter, status-only, query-only, and combined filters.

- [ ] **Step 3: Add protected export route**

Verify admin auth, run the same filtered query, and return `text/csv` with attachment headers.

### Task 4: Verify And Deploy

**Files:**
- Git repository and Vercel production deployment

- [ ] **Step 1: Run local verification**

Run `cmd /c npm test`, `cmd /c npm run lint`, and `cmd /c npm run build`.

- [ ] **Step 2: Commit, push, deploy**

Commit to `main`, push to GitHub, deploy to Vercel production.

- [ ] **Step 3: Smoke test production read-only**

Log in, confirm search/filter UI and CSV export endpoint respond without modifying data.
