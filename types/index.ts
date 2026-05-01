import type { Types } from "mongoose";

export type UserRole = "admin" | "member";
export type TaskStatus = "todo" | "in-progress" | "done";

export interface AuthSessionPayload {
  userId: string;
  role: UserRole;
}

export interface SafeUser {
  _id: Types.ObjectId | string;
  name: string;
  email: string;
  role: UserRole;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    message: string;
    details?: unknown;
  };
}

export interface ProjectEntity {
  _id: string;
  name: string;
  description: string;
  createdBy: string;
  members: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ProjectMemberEntity {
  _id: string;
  name: string;
  email: string;
}

export interface TaskEntity {
  _id: string;
  projectId: string;
  title: string;
  description?: string;
  assignedTo: string;
  status: TaskStatus;
  dueDate?: string;
  createdBy: string;
  createdAt?: string;
  updatedAt?: string;
}
