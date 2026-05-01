import { NextRequest } from "next/server";
import { isValidObjectId } from "mongoose";
import { ZodError } from "zod";

import { errorResponse, handleApiError, successResponse } from "@/lib/api-response";
import { requireAuth } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { canAccessProject, requireRole } from "@/lib/rbac";
import Project from "@/models/Project";
import User from "@/models/User";
import { memberSchema } from "@/schemas/project";

type RouteParams = { params: Promise<{ projectId: string }> };

export async function GET(_request: NextRequest, { params }: RouteParams) {
  await connectToDatabase();

  try {
    const user = await requireAuth();
    const { projectId } = await params;
    if (!isValidObjectId(projectId)) {
      return errorResponse("Invalid project id.", 400);
    }

    const project = await Project.findById(projectId).select("members").lean();
    if (!project) {
      return errorResponse("Project not found.", 404);
    }

    if (!canAccessProject(user, project)) {
      return errorResponse("Forbidden.", 403);
    }

    const members = await User.find(
      { _id: { $in: project.members } },
      { name: 1, email: 1 }
    )
      .sort({ name: 1 })
      .lean();

    return successResponse({ members });
  } catch (error) {
    return handleApiError(error, "Failed to fetch members.");
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  await connectToDatabase();

  try {
    const user = await requireAuth();
    requireRole(user, "admin");

    const { projectId } = await params;
    if (!isValidObjectId(projectId)) {
      return errorResponse("Invalid project id.", 400);
    }

    const payload = memberSchema.parse(await request.json());

    const project = await Project.findByIdAndUpdate(
      projectId,
      { $addToSet: { members: payload.userId } },
      { new: true }
    ).lean();

    if (!project) {
      return errorResponse("Project not found.", 404);
    }

    return successResponse({ project });
  } catch (error) {
    if (error instanceof ZodError) {
      return errorResponse("Validation failed.", 422, error.flatten());
    }

    return handleApiError(error, "Failed to add member.");
  }
}
