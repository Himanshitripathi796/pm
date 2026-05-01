import { NextRequest } from "next/server";
import { ZodError } from "zod";

import { errorResponse, successResponse } from "@/lib/api-response";
import { setAuthCookie, verifyPassword } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";
import { loginSchema } from "@/schemas/auth";

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const payload = loginSchema.parse(await request.json());

    const user = await User.findOne({ email: payload.email });
    if (!user || !verifyPassword(payload.password, user.passwordHash)) {
      return errorResponse("Invalid email or password.", 401);
    }

    await setAuthCookie({
      userId: user._id.toString(),
      role: user.role,
    });

    return successResponse({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return errorResponse("Validation failed.", 422, error.flatten());
    }

    return errorResponse("Failed to log in.", 500);
  }
}
