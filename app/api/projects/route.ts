import { NextRequest } from "next/server";
import { ZodError } from "zod";

import { errorResponse, handleApiError, successResponse } from "@/lib/api-response";
import { requireAuth } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { isAdmin, requireRole } from "@/lib/rbac";
import Project from "@/models/Project";
import { createProjectSchema } from "@/schemas/project";

export async function GET() {
  try {
    await connectToDatabase();
    const user = await requireAuth();

    const query = isAdmin(user.role) ? {} : { members: user.userId };
    const projects = await Project.find(query).sort({ createdAt: -1 }).lean();

    return successResponse({ projects });
  } catch (error) {
    return handleApiError(error, "Failed to fetch projects.");
  }
}

export async function POST(request: NextRequest) {
  await connectToDatabase();

  try {
    const user = await requireAuth();
    requireRole(user, "admin");

    const payload = createProjectSchema.parse(await request.json());
    const uniqueMembers = new Set(payload.members ?? []);
    uniqueMembers.add(user.userId);

    const project = await Project.create({
      name: payload.name,
      description: payload.description,
      createdBy: user.userId,
      members: Array.from(uniqueMembers),
    });

    return successResponse({ project }, 201);
  } catch (error) {
    if (error instanceof ZodError) {
      return errorResponse("Validation failed.", 422, error.flatten());
    }

    return handleApiError(error, "Failed to create project.");
  }
}
