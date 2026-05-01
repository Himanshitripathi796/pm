import { SignJWT, jwtVerify } from "jose";

import type { AuthSessionPayload, UserRole } from "@/types";

export const AUTH_COOKIE_NAME = "token";
const AUTH_SECRET = process.env.AUTH_SECRET || "change-this-in-production";
const JWT_ALGORITHM = "HS256";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

const secretKey = new TextEncoder().encode(AUTH_SECRET);

function isUserRole(value: unknown): value is UserRole {
  return value === "admin" || value === "member";
}

export async function createSessionToken(payload: AuthSessionPayload) {
  return new SignJWT({
    userId: payload.userId,
    role: payload.role,
  })
    .setProtectedHeader({ alg: JWT_ALGORITHM })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .sign(secretKey);
}

export async function verifySessionToken(token: string): Promise<AuthSessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey, {
      algorithms: [JWT_ALGORITHM],
    });

    const userId = typeof payload.userId === "string" ? payload.userId : null;
    const role = payload.role;

    if (!userId || !isUserRole(role)) {
      return null;
    }

    return { userId, role };
  } catch {
    return null;
  }
}
