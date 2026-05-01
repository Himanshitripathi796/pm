import { z } from "zod";

const statusEnum = z.enum(["todo", "in-progress", "done"]);

export const createTaskSchema = z.object({
  projectId: z.string().length(24),
  title: z.string().min(1).max(200),
  description: z.string().max(5000).optional(),
  assignedTo: z.string().length(24),
  status: statusEnum.default("todo"),
  dueDate: z.coerce.date().optional(),
});

export const updateTaskSchema = z
  .object({
    title: z.string().min(1).max(200).optional(),
    description: z.string().max(5000).optional(),
    assignedTo: z.string().length(24).optional(),
    status: statusEnum.optional(),
    dueDate: z.coerce.date().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required.",
  });

export const updateTaskStatusSchema = z.object({
  status: statusEnum,
});
