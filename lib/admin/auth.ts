import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE_MAX_AGE_SECONDS, createAdminSessionValue, verifyAdminPassword, verifyAdminSessionValue } from "./session";

export const ADMIN_COOKIE_NAME = "tokenapi_admin_session";

function adminPassword() {
  return process.env.ADMIN_PASSWORD;
}

export function checkAdminPassword(password: string) {
  return verifyAdminPassword(password, adminPassword());
}

export async function startAdminSession() {
  const configured = adminPassword();
  if (!configured) throw new Error("ADMIN_PASSWORD is not configured.");
  const store = await cookies();
  store.set(ADMIN_COOKIE_NAME, createAdminSessionValue(configured), {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/admin",
    maxAge: ADMIN_COOKIE_MAX_AGE_SECONDS,
  });
}

export async function endAdminSession() {
  (await cookies()).delete({ name: ADMIN_COOKIE_NAME, path: "/admin" });
}

export async function isAdminAuthenticated() {
  const configured = adminPassword();
  if (!configured) return false;
  const value = (await cookies()).get(ADMIN_COOKIE_NAME)?.value;
  return Boolean(value && verifyAdminSessionValue(value, configured));
}

/** Call at the top of every admin page AND every server action (actions are public endpoints). */
export async function requireAdmin() {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");
  return "admin";
}
