import assert from "node:assert/strict";
import test from "node:test";
import {
  ADMIN_COOKIE_MAX_AGE_SECONDS,
  createAdminSessionValue,
  verifyAdminPassword,
  verifyAdminSessionValue,
} from "../app/admin/requests/admin-session.ts";
import {
  getLoginAttemptIdentifier,
  isLoginAttemptLocked,
} from "../app/admin/requests/admin-rate-limit.ts";

test("verifies admin password without exposing raw string comparison", () => {
  assert.equal(verifyAdminPassword("correct horse", "correct horse"), true);
  assert.equal(verifyAdminPassword("wrong horse", "correct horse"), false);
  assert.equal(verifyAdminPassword("", "correct horse"), false);
});

test("creates timestamped admin sessions and rejects expired or tampered values", () => {
  const issuedAt = Date.parse("2026-07-15T12:00:00.000Z");
  const password = "admin-secret";
  const sessionValue = createAdminSessionValue(password, issuedAt);
  const tamperedValue = `${sessionValue.slice(0, -1)}${
    sessionValue.endsWith("a") ? "b" : "a"
  }`;

  assert.equal(verifyAdminSessionValue(sessionValue, password, issuedAt + 60_000), true);
  assert.equal(
    verifyAdminSessionValue(
      sessionValue,
      password,
      issuedAt + (ADMIN_COOKIE_MAX_AGE_SECONDS + 1) * 1000,
    ),
    false,
  );
  assert.equal(verifyAdminSessionValue(tamperedValue, password, issuedAt), false);
  assert.equal(verifyAdminSessionValue(sessionValue, "different-secret", issuedAt), false);
});

test("uses forwarding headers as the stable admin login rate-limit key", () => {
  const forwardedRequest = new Request("https://tokenapi.biz/admin/requests/login", {
    headers: {
      "x-forwarded-for": "203.0.113.1, 198.51.100.9",
    },
  });
  const fallbackRequest = new Request("https://tokenapi.biz/admin/requests/login");

  assert.equal(getLoginAttemptIdentifier(forwardedRequest), "ip:203.0.113.1");
  assert.equal(getLoginAttemptIdentifier(fallbackRequest), "ip:unknown");
});

test("treats future locked_until timestamps as active login lockouts", () => {
  assert.equal(
    isLoginAttemptLocked(
      {
        attempt_count: 8,
        window_started_at: "2026-07-15T12:00:00.000Z",
        locked_until: "2026-07-15T12:15:00.000Z",
      },
      Date.parse("2026-07-15T12:01:00.000Z"),
    ),
    true,
  );
  assert.equal(
    isLoginAttemptLocked(
      {
        attempt_count: 8,
        window_started_at: "2026-07-15T12:00:00.000Z",
        locked_until: "2026-07-15T12:15:00.000Z",
      },
      Date.parse("2026-07-15T12:16:00.000Z"),
    ),
    false,
  );
});
