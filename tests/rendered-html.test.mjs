import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const templateRoot = new URL("../", import.meta.url);

test("contains the production TokenAPI content-site sections", async () => {
  const [layout, page] = await Promise.all([
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
  ]);

  assert.match(layout, /TokenAPI \| Token data API for global products/);
  assert.match(
    page,
    /Token data infrastructure for products that need trusted market context\./,
  );
  assert.match(page, /API capabilities/);
  assert.match(page, /Token profiles/);
  assert.match(page, /Wallets and portfolio apps/);
  assert.match(page, /Developer/);
  assert.match(page, /Enterprise/);
  assert.match(page, /English/);
  assert.match(page, /简体中文/);
  assert.match(page, /Español/);
  assert.match(page, /常见问题/);
  assert.match(page, /Lista de espera/);
  assert.match(page, /GitHub/);
  assert.match(page, /Vercel/);
});

test("contains developer docs and access request flow", async () => {
  const [page, docs] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/docs/page.tsx", import.meta.url), "utf8"),
  ]);

  assert.match(page, /Request API Access/);
  assert.match(page, /name="email"/);
  assert.match(page, /name="use_case"/);
  assert.match(page, /\/docs/);

  assert.match(docs, /TokenAPI Developer Docs/);
  assert.match(docs, /Authorization: Bearer tk_live_/);
  assert.match(docs, /GET \/v1\/tokens\/\{chain\}\/\{address\}/);
  assert.match(docs, /Rate limits/);
  assert.match(docs, /Error responses/);
});

test("wires access requests to a Neon-backed route", async () => {
  const [page, route, setupScript, successPage] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/api/access-requests/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../scripts/setup-access-requests-db.mjs", import.meta.url), "utf8"),
    readFile(new URL("../app/request-sent/page.tsx", import.meta.url), "utf8"),
  ]);

  assert.match(page, /action="\/api\/access-requests"/);
  assert.match(page, /method="post"/);
  assert.match(route, /export async function POST/);
  assert.match(route, /DATABASE_URL/);
  assert.match(route, /MAX_FIELD_LENGTHS/);
  assert.match(route, /invalid email address/i);
  assert.match(route, /access_requests/);
  assert.match(route, /NextResponse.redirect/);
  assert.doesNotMatch(route, /INSERT INTO access_requests \$\{/);
  assert.match(setupScript, /CREATE TABLE IF NOT EXISTS access_requests/);
  assert.match(setupScript, /submitted_at TIMESTAMPTZ NOT NULL DEFAULT now\(\)/);
  assert.match(successPage, /Access request received/);
});

test("adds a password-protected admin request list", async () => {
  const [
    loginPage,
    authHelper,
    adminSession,
    rateLimit,
    loginRoute,
    logoutRoute,
    listPage,
    setupScript,
  ] = await Promise.all([
    readFile(new URL("../app/admin/requests/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/admin/requests/admin-auth.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/admin/requests/admin-session.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/admin/requests/admin-rate-limit.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/admin/requests/login/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/admin/requests/logout/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/admin/requests/list/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../scripts/setup-admin-auth-db.mjs", import.meta.url), "utf8"),
  ]);

  assert.match(loginPage, /Admin password/);
  assert.match(loginPage, /action="\/admin\/requests\/login"/);
  assert.match(loginPage, /name="password"/);

  assert.match(authHelper, /ADMIN_PASSWORD/);
  assert.match(authHelper, /tokenapi_admin_session/);
  assert.match(authHelper, /verifyAdminSessionValue/);

  assert.match(adminSession, /createHmac/);
  assert.match(adminSession, /timingSafeEqual/);
  assert.match(adminSession, /ADMIN_COOKIE_MAX_AGE_SECONDS/);
  assert.match(adminSession, /issuedAt/);

  assert.match(rateLimit, /ADMIN_LOGIN_MAX_ATTEMPTS/);
  assert.match(rateLimit, /admin_login_attempts/);
  assert.match(rateLimit, /x-forwarded-for/);

  assert.match(loginRoute, /export async function POST/);
  assert.match(loginRoute, /assertAdminLoginIsAllowed/);
  assert.match(loginRoute, /recordFailedAdminLogin/);
  assert.match(loginRoute, /recordSuccessfulAdminLogin/);
  assert.match(loginRoute, /httpOnly: true/);
  assert.match(loginRoute, /sameSite: "strict"/);
  assert.match(loginRoute, /secure: process\.env\.NODE_ENV === "production"/);
  assert.match(loginRoute, /NextResponse\.redirect/);

  assert.match(logoutRoute, /export async function POST/);
  assert.match(logoutRoute, /ADMIN_COOKIE_NAME/);
  assert.match(logoutRoute, /maxAge: 0/);

  assert.match(listPage, /Admin requests/);
  assert.match(listPage, /redirect\("\/admin\/requests"\)/);
  assert.match(listPage, /access_requests/);
  assert.match(listPage, /ORDER BY submitted_at DESC/);
  assert.match(listPage, /use_case/);

  assert.match(setupScript, /CREATE TABLE IF NOT EXISTS admin_login_attempts/);
});

test("removes the preview shell and loading dependency", async () => {
  const [page, packageJson] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);

  assert.doesNotMatch(page, /_sites-preview|SkeletonPreview|codex-preview/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);

  await assert.rejects(access(new URL("../app/_sites-preview/", templateRoot)));
});
