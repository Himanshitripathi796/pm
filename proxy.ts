import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { AUTH_COOKIE_NAME, verifySessionToken } from "@/lib/session";

const protectedPrefixes = ["/dashboard", "/projects"];
const authPrefixes = ["/login", "/signup"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const hasValidSession = token ? Boolean(await verifySessionToken(token)) : false;

  if (protectedPrefixes.some((prefix) => pathname.startsWith(prefix)) && !hasValidSession) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (authPrefixes.some((prefix) => pathname.startsWith(prefix)) && hasValidSession) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/projects/:path*", "/login", "/signup"],
};
