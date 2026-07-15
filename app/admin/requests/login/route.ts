import { NextResponse } from "next/server";
import {
  ADMIN_COOKIE_MAX_AGE,
  ADMIN_COOKIE_NAME,
  createAdminSessionValue,
  verifyAdminPassword,
} from "../admin-auth";
import {
  assertAdminLoginIsAllowed,
  getLoginAttemptIdentifier,
  recordFailedAdminLogin,
  recordSuccessfulAdminLogin,
} from "../admin-rate-limit";

function readPassword(formData: FormData) {
  const value = formData.get("password");
  return typeof value === "string" ? value : "";
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const password = readPassword(formData);
  const identifier = getLoginAttemptIdentifier(request);

  if (!(await assertAdminLoginIsAllowed(identifier))) {
    return NextResponse.redirect(new URL("/admin/requests?error=locked", request.url), 303);
  }

  if (!verifyAdminPassword(password)) {
    await recordFailedAdminLogin(identifier);
    return NextResponse.redirect(new URL("/admin/requests?error=invalid", request.url), 303);
  }

  await recordSuccessfulAdminLogin(identifier);

  const response = NextResponse.redirect(new URL("/admin/requests/list", request.url), 303);

  response.cookies.set(ADMIN_COOKIE_NAME, createAdminSessionValue(), {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/admin/requests",
    maxAge: ADMIN_COOKIE_MAX_AGE,
  });

  return response;
}
