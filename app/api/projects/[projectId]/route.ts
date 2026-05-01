import { NextRequest } from "next/server";
import { isValidObjectId } from "mongoose";
import { ZodError } from "zod";

import { errorResponse, handleApiError, successResponse } from "@/lib/api-response";
import { requireAuth } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { canAccessProject, requireRole } from "@/lib/rbac";
import Project from "@/models/Project";
import { updateProjectSchema } from "@/schemas/project";

type RouteParams = { params: Promise<{ projectId: string }> };

export async function GET(_request: NextRequest, { params }: RouteParams) {
  await connectToDatabase();

  try {
    const user = await requireAuth();
    const { projectId } = await params;
    if (!isValidObjectId(projectId)) {
      return errorResponse("Invalid project id.", 400);
    }

    const project = await Project.findById(projectId).lean();
    if (!project) {
      return errorResponse("Project not found.", 404);
    }

    if (!canAccessProject(user, project)) {
      return errorResponse("Forbidden.", 403);
    }

    return successResponse({ project });
  } catch (error) {
    return handleApiError(error, "Failed to fetch project.");
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  await connectToDatabase();

  try {
    const user = await requireAuth();
    requireRole(user, "admin");
    const { projectId } = await params;
    if (!isValidObjectId(projectId)) {
      return errorResponse("Invalid project id.", 400);
    }

    const payload = updateProjectSchema.parse(await request.json());
    const project = await Project.findByIdAndUpdate(projectId, payload, {
      new: true,
    }).lean();

    if (!project) {
      return errorResponse("Project not found.", 404);
    }

    return successResponse({ project });
  } catch (error) {
    if (error instanceof ZodError) {
      return errorResponse("Validation failed.", 422, error.flatten());
    }

    return handleApiError(error, "Failed to update project.");
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  await connectToDatabase();
  try {
    const user = await requireAuth();
    requireRole(user, "admin");

    const { projectId } = await params;
    if (!isValidObjectId(projectId)) {
      return errorResponse("Invalid project id.", 400);
    }

    const project = await Project.findByIdAndDelete(projectId).lean();
    if (!project) {
      return errorResponse("Project not found.", 404);
    }

    return successResponse({ deleted: true });
  } catch (error) {
    return handleApiError(error, "Failed to delete project.");
  }
}
