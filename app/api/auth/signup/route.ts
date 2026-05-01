import { NextRequest } from "next/server";
import { ZodError } from "zod";

import { errorResponse, successResponse } from "@/lib/api-response";
import { hashPassword, setAuthCookie } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";
import { signupSchema } from "@/schemas/auth";

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const payload = signupSchema.parse(await request.json());

    const existingUser = await User.findOne({ email: payload.email }).lean();
    if (existingUser) {
      return errorResponse("Email already in use.", 409);
    }

    const user = await User.create({
      name: payload.name,
      email: payload.email,
      passwordHash: hashPassword(payload.password),
      role: payload.role ?? "member",
    });

    await setAuthCookie({
      userId: user._id.toString(),
      role: user.role,
    });

    return successResponse(
      {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      },
      201
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return errorResponse("Validation failed.", 422, error.flatten());
    }

    console.error("Signup error:", error);
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace");
    
    const message = error instanceof Error ? error.message : String(error);
    return errorResponse(message, 500);
  }
}
