# TokenAPI Admin Workflow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let the admin manage access requests with review status and private notes.

**Architecture:** Extend `access_requests` with `review_status`, `admin_notes`, and `reviewed_at`. Render a small per-row admin form on the protected list page, and process updates through a protected route handler that validates status and note length before parameterized Neon updates.

**Tech Stack:** Next.js App Router, Neon serverless SQL, Node test runner, Vercel deployment.

---

### Task 1: Test The Admin Workflow

**Files:**
- Modify: `tests/rendered-html.test.mjs`
- Modify: `tests/admin-auth.test.ts`

- [x] **Step 1: Write failing tests**

Require editable status and notes fields in the list page, an authenticated update route, validation helpers, and database migration columns.

- [ ] **Step 2: Run tests and verify failure**

Run `cmd /c npm test`.

Expected: FAIL because workflow fields and route do not exist yet.

### Task 2: Add Status And Notes

**Files:**
- Create: `app/admin/requests/[id]/route.ts`
- Create: `app/admin/requests/request-review.ts`
- Modify: `app/admin/requests/list/page.tsx`
- Modify: `scripts/setup-access-requests-db.mjs`
- Modify: `package.json`
- Modify: `app/globals.css`

- [ ] **Step 1: Add validation helper**

Expose allowed statuses and note normalization so tests and route handler share the same behavior.

- [ ] **Step 2: Add protected update route**

Reject unauthenticated requests, validate `status` and `admin_notes`, update only the selected row, then redirect back to `/admin/requests/list`.

- [ ] **Step 3: Update list page**

Select `review_status`, `admin_notes`, and `reviewed_at`; render status select, notes textarea, and save button per row.

- [ ] **Step 4: Add migration columns**

Add `review_status`, `admin_notes`, `reviewed_at`, and a review status index to the access request setup script.

### Task 3: Verify And Deploy

**Files:**
- Git repository and Vercel production deployment

- [ ] **Step 1: Run local verification**

Run `cmd /c npm test`, `cmd /c npm run lint`, `cmd /c npm run build`.

- [ ] **Step 2: Run Neon migration**

Run `cmd /c npm run db:setup:access-requests`.

- [ ] **Step 3: Commit, push, deploy**

Commit the workflow feature, push to `main`, deploy to Vercel production.

- [ ] **Step 4: Smoke test production**

Log in, update a request status and note, confirm the saved values appear on the admin list.
