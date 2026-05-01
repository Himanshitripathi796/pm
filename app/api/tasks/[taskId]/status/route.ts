import { NextRequest } from "next/server";
import { isValidObjectId } from "mongoose";
import { ZodError } from "zod";

import { errorResponse, handleApiError, successResponse } from "@/lib/api-response";
import { requireAuth } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { canAccessTask } from "@/lib/rbac";
import Task from "@/models/Task";
import { updateTaskStatusSchema } from "@/schemas/task";

type RouteParams = { params: Promise<{ taskId: string }> };

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

    if (!canAccessTask(user, task)) {
      return errorResponse("Forbidden.", 403);
    }

    const payload = updateTaskStatusSchema.parse(await request.json());
    task.status = payload.status;
    await task.save();

    return successResponse({ task });
  } catch (error) {
    if (error instanceof ZodError) {
      return errorResponse("Validation failed.", 422, error.flatten());
    }
    return handleApiError(error, "Failed to update status.");
  }
}
