import { isValidObjectId } from "mongoose";

import { HttpError } from "@/lib/api-response";
import Project from "@/models/Project";
import Task from "@/models/Task";
import type { UserRole } from "@/types";

export function isAdmin(role: UserRole) {
  return role === "admin";
}

type UserWithRole = { role: UserRole; _id?: string | { toString(): string }; userId?: string };
type ProjectLike = { members: Array<string | { toString(): string }> };
type TaskLike = { assignedTo: string | { toString(): string } };

function getUserId(user: UserWithRole) {
  if (typeof user.userId === "string") {
    return user.userId;
  }

  if (user._id && typeof user._id === "object" && "toString" in user._id) {
    return user._id.toString();
  }

  if (typeof user._id === "string") {
    return user._id;
  }

  return "";
}

export function requireRole(user: UserWithRole, role: UserRole) {
  if (user.role !== role) {
    throw new HttpError("Forbidden.", 403);
  }
}

export function canAccessProject(user: UserWithRole, project: ProjectLike) {
  if (isAdmin(user.role)) {
    return true;
  }

  const userId = getUserId(user);
  return project.members.some((member) => member.toString() === userId);
}

export function canAccessTask(user: UserWithRole, task: TaskLike) {
  if (isAdmin(user.role)) {
    return true;
  }

  const userId = getUserId(user);
  return task.assignedTo.toString() === userId;
}

export async function isProjectMember(projectId: string, userId: string) {
  if (!isValidObjectId(projectId) || !isValidObjectId(userId)) {
    return false;
  }

  const project = await Project.findOne({
    _id: projectId,
    members: userId,
  })
    .select("_id")
    .lean();

  return Boolean(project);
}

export async function isTaskAssignee(taskId: string, userId: string) {
  if (!isValidObjectId(taskId) || !isValidObjectId(userId)) {
    return false;
  }

  const task = await Task.findOne({
    _id: taskId,
    assignedTo: userId,
  })
    .select("_id")
    .lean();

  return Boolean(task);
}
