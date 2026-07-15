# TokenAPI Admin Requests Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a password-protected admin page for viewing recent TokenAPI access requests.

**Architecture:** Use a simple server-only password check backed by `ADMIN_PASSWORD`, then set an httpOnly admin cookie containing a derived HMAC session value. The protected list page re-checks the cookie before querying Neon for recent `access_requests` rows.

**Tech Stack:** Next.js App Router route handlers, Server Components, Neon serverless SQL, Vercel environment variables.

---

### Task 1: Lock Admin Behavior With Tests

**Files:**
- Modify: `tests/rendered-html.test.mjs`

- [x] **Step 1: Write failing tests**

Add assertions that require the login page, login route, logout route, auth helper, and protected list page.

- [ ] **Step 2: Run test to verify it fails**

Run: `cmd /c npm test`

Expected: FAIL because the admin files do not exist yet.

### Task 2: Implement Password-Protected Admin

**Files:**
- Create: `app/admin/requests/admin-auth.ts`
- Create: `app/admin/requests/page.tsx`
- Create: `app/admin/requests/login/route.ts`
- Create: `app/admin/requests/logout/route.ts`
- Create: `app/admin/requests/list/page.tsx`
- Modify: `app/globals.css`

- [ ] **Step 1: Add auth helper**

Use `ADMIN_PASSWORD`, `node:crypto`, and an httpOnly cookie value derived from HMAC.

- [ ] **Step 2: Add login and logout routes**

Login accepts form data and sets the admin cookie only when the password matches. Logout clears the cookie.

- [ ] **Step 3: Add protected list page**

Redirect unauthenticated users to `/admin/requests`; authenticated users can see the latest rows from `access_requests`.

- [ ] **Step 4: Add admin styling**

Reuse the site's visual language while making the admin table readable on desktop and mobile.

### Task 3: Configure, Deploy, Verify

**Files:**
- Vercel project environment: `ADMIN_PASSWORD`

- [ ] **Step 1: Set Vercel env var**

Run `vercel env add ADMIN_PASSWORD production preview development`, then pull `.env.local`.

- [ ] **Step 2: Verify locally**

Run `cmd /c npm test`, `cmd /c npm run lint`, and `cmd /c npm run build`.

- [ ] **Step 3: Commit, push, deploy**

Commit the admin feature, push to GitHub, and deploy production to Vercel.

- [ ] **Step 4: Smoke test production**

Confirm `/admin/requests/list` redirects while logged out, login accepts the configured password, and the list shows stored requests.
