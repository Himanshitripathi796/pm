import { NextRequest } from "next/server";
import { isValidObjectId } from "mongoose";

import { errorResponse, handleApiError, successResponse } from "@/lib/api-response";
import { requireAuth } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { requireRole } from "@/lib/rbac";
import Project from "@/models/Project";

type RouteParams = { params: Promise<{ projectId: string; userId: string }> };

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  await connectToDatabase();
  try {
    const user = await requireAuth();
    requireRole(user, "admin");

    const { projectId, userId } = await params;
    if (!isValidObjectId(projectId) || !isValidObjectId(userId)) {
      return errorResponse("Invalid ids.", 400);
    }

    const project = await Project.findByIdAndUpdate(
      projectId,
      { $pull: { members: userId } },
      { new: true }
    ).lean();

    if (!project) {
      return errorResponse("Project not found.", 404);
    }

    return successResponse({ project });
  } catch (error) {
    return handleApiError(error, "Failed to remove member.");
  }
}
