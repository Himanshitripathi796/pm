import { NextRequest } from "next/server";
import { isValidObjectId } from "mongoose";
import { ZodError } from "zod";

import { errorResponse, handleApiError, successResponse } from "@/lib/api-response";
import { requireAuth } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { canAccessProject, isAdmin, requireRole } from "@/lib/rbac";
import Project from "@/models/Project";
import Task from "@/models/Task";
import { createTaskSchema } from "@/schemas/task";

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    const user = await requireAuth();

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");
    const status = searchParams.get("status");

    const query: Record<string, unknown> = {};

    if (projectId) {
      if (!isValidObjectId(projectId)) {
        return errorResponse("Invalid project id.", 400);
      }
      query.projectId = projectId;
    }

    if (status) {
      if (!["todo", "in-progress", "done"].includes(status)) {
        return errorResponse("Invalid status filter.", 400);
      }
      query.status = status;
    }

    if (!isAdmin(user.role)) {
      query.assignedTo = user.userId;

      if (projectId) {
        const project = await Project.findById(projectId).select("members").lean();
        if (!project) {
          return errorResponse("Project not found.", 404);
        }
        if (!canAccessProject(user, project)) {
          return errorResponse("Forbidden.", 403);
        }
      }
    }

    const tasks = await Task.find(query).sort({ createdAt: -1 }).lean();
    return successResponse({ tasks });
  } catch (error) {
    return handleApiError(error, "Failed to fetch tasks.");
  }
}

export async function POST(request: NextRequest) {
  await connectToDatabase();

  try {
    const user = await requireAuth();
    requireRole(user, "admin");

    const payload = createTaskSchema.parse(await request.json());
    const task = await Task.create({
      ...payload,
      createdBy: user.userId,
    });

    return successResponse({ task }, 201);
  } catch (error) {
    if (error instanceof ZodError) {
      return errorResponse("Validation failed.", 422, error.flatten());
    }
    return handleApiError(error, "Failed to create task.");
  }
}
