import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";

import User from "@/models/User";
import { connectToDatabase } from "@/lib/db";
import { HttpError } from "@/lib/api-response";
import {
  AUTH_COOKIE_NAME,
  createSessionToken,
  SESSION_MAX_AGE_SECONDS,
  verifySessionToken,
} from "@/lib/session";
import type { AuthSessionPayload } from "@/types";

export function hashPassword(password: string) {
  return bcrypt.hashSync(password, 12);
}

export function verifyPassword(password: string, passwordHash: string) {
  return bcrypt.compareSync(password, passwordHash);
}

export async function setAuthCookie(payload: AuthSessionPayload) {
  const store = await cookies();
  const token = await createSessionToken(payload);

  store.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export async function clearAuthCookie() {
  const store = await cookies();
  store.delete(AUTH_COOKIE_NAME);
}

export async function getAuthSession(request?: NextRequest): Promise<AuthSessionPayload | null> {
  const token = request
    ? request.cookies.get(AUTH_COOKIE_NAME)?.value
    : (await cookies()).get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }
  return await verifySessionToken(token);
}

export async function getCurrentUser(request?: NextRequest) {
  const session = await getAuthSession(request);
  if (!session) {
    return null;
  }

  await connectToDatabase();
  const user = await User.findById(session.userId).select("-passwordHash").lean();
  if (!user) {
    return null;
  }

  return {
    ...user,
    userId: user._id.toString(),
  };
}

export async function requireAuth(request?: NextRequest) {
  const user = await getCurrentUser(request);
  if (!user) {
    throw new HttpError("Unauthorized.", 401);
  }

  return user;
}
