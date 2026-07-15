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

test("removes the preview shell and loading dependency", async () => {
  const [page, packageJson] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);

  assert.doesNotMatch(page, /_sites-preview|SkeletonPreview|codex-preview/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);

  await assert.rejects(access(new URL("../app/_sites-preview/", templateRoot)));
});
