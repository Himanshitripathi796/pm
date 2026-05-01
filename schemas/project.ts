import { z } from "zod";

export const createProjectSchema = z.object({
  name: z.string().min(2).max(120),
  description: z.string().min(1).max(4000),
  members: z.array(z.string().length(24)).optional().default([]),
});

export const updateProjectSchema = z
  .object({
    name: z.string().min(2).max(120).optional(),
    description: z.string().min(1).max(4000).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required.",
  });

export const memberSchema = z.object({
  userId: z.string().length(24),
});
