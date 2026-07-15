# TokenAPI Neon Access Requests Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Store TokenAPI API access requests in the Neon Postgres database connected through Vercel.

**Architecture:** Keep the marketing pages static, add one server-only Next.js Route Handler at `app/api/access-requests/route.ts`, validate form submissions before insertion, create the `access_requests` table with a small setup script, and redirect successful submissions to `/request-sent`.

**Tech Stack:** Next.js 16 App Router, Neon serverless Postgres driver, Node test runner, Vercel Marketplace Neon integration.

---

### Task 1: Coverage Tests

**Files:**
- Modify: `tests/rendered-html.test.mjs`

- [ ] **Step 1: Assert real submission route**

Check that homepage form posts to `/api/access-requests` and the route file exists.

- [ ] **Step 2: Assert validation and schema**

Read route and setup script source. Assert required fields, max lengths, parameterized inserts, and `access_requests` table creation.

- [ ] **Step 3: Assert success page**

Read `app/request-sent/page.tsx` and check for confirmation copy.

### Task 2: Database Setup

**Files:**
- Create: `scripts/setup-access-requests-db.mjs`
- Modify: `package.json`

- [ ] **Step 1: Install Neon driver**

Run `cmd /c npm install @neondatabase/serverless`.

- [ ] **Step 2: Add setup script**

Load `.env.local`, connect with `DATABASE_URL`, and run `CREATE TABLE IF NOT EXISTS access_requests`.

- [ ] **Step 3: Add npm script**

Add `db:setup:access-requests`.

### Task 3: API Route

**Files:**
- Create: `app/api/access-requests/route.ts`

- [ ] **Step 1: Validate form fields**

Require `name`, `email`, and `use_case`; trim input; cap lengths; validate email format.

- [ ] **Step 2: Insert safely**

Use `@neondatabase/serverless` tagged template parameters, not string concatenation.

- [ ] **Step 3: Redirect**

Return `303` redirect to `/request-sent` on success and JSON errors on validation failure.

### Task 4: Pages

**Files:**
- Modify: `app/page.tsx`
- Create: `app/request-sent/page.tsx`

- [ ] **Step 1: Update form**

Set `action="/api/access-requests"` and `method="post"`.

- [ ] **Step 2: Add success page**

Add a short page confirming the request was received and linking back to docs/home.

### Task 5: Verify And Deploy

**Files:**
- Test: `tests/rendered-html.test.mjs`
- Build: project root

- [ ] **Step 1: Run setup**

Run `cmd /c npm run db:setup:access-requests`.

- [ ] **Step 2: Verify**

Run `cmd /c npm test`, `cmd /c npm run lint`, and `cmd /c npm run build`.

- [ ] **Step 3: Publish**

Commit, push, deploy with `cmd /c npx vercel --prod --yes --scope lilianfu701-pixels-projects`.
