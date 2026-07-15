import { NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME } from "../admin-auth";

export async function POST(request: Request) {
  const response = NextResponse.redirect(new URL("/admin/requests", request.url), 303);

  response.cookies.set(ADMIN_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/admin/requests",
    maxAge: 0,
  });

  return response;
}
