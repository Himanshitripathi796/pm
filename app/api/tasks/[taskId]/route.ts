import { NextRequest } from "next/server";
import { isValidObjectId } from "mongoose";
import { ZodError } from "zod";

import { errorResponse, handleApiError, successResponse } from "@/lib/api-response";
import { requireAuth } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { canAccessTask, requireRole } from "@/lib/rbac";
import Task from "@/models/Task";
import { updateTaskSchema } from "@/schemas/task";

type RouteParams = { params: Promise<{ taskId: string }> };

export async function GET(_request: NextRequest, { params }: RouteParams) {
  await connectToDatabase();

  try {
    const user = await requireAuth();
    const { taskId } = await params;
    if (!isValidObjectId(taskId)) {
      return errorResponse("Invalid task id.", 400);
    }

    const task = await Task.findById(taskId).lean();
    if (!task) {
      return errorResponse("Task not found.", 404);
    }

    if (!canAccessTask(user, task)) {
      return errorResponse("Forbidden.", 403);
    }

    return successResponse({ task });
  } catch (error) {
    return handleApiError(error, "Failed to fetch task.");
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  await connectToDatabase();

  try {
    const user = await requireAuth();
    const { taskId } = await params;
    if (!isValidObjectId(taskId)) {
      return errorResponse("Invalid task id.", 400);
    }

    const task = await Task.findById(taskId);
    if (!task) {
      return errorResponse("Task not found.", 404);
    }

    const payload = updateTaskSchema.parse(await request.json());

    if (user.role === "member") {
      if (!canAccessTask(user, task)) {
        return errorResponse("Forbidden.", 403);
      }

      const allowedPayload = { status: payload.status };
      const filteredPayload = Object.fromEntries(
        Object.entries(allowedPayload).filter(([, value]) => value !== undefined)
      );

      if (Object.keys(filteredPayload).length === 0) {
        return errorResponse("Members can only update task status.", 403);
      }

      Object.assign(task, filteredPayload);
    } else {
      requireRole(user, "admin");
      Object.assign(task, payload);
    }

    await task.save();
    return successResponse({ task });
  } catch (error) {
    if (error instanceof ZodError) {
      return errorResponse("Validation failed.", 422, error.flatten());
    }
    return handleApiError(error, "Failed to update task.");
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  await connectToDatabase();
  try {
    const user = await requireAuth();
    requireRole(user, "admin");

    const { taskId } = await params;
    if (!isValidObjectId(taskId)) {
      return errorResponse("Invalid task id.", 400);
    }

    const task = await Task.findByIdAndDelete(taskId).lean();
    if (!task) {
      return errorResponse("Task not found.", 404);
    }

    return successResponse({ deleted: true });
  } catch (error) {
    return handleApiError(error, "Failed to delete task.");
  }
}
