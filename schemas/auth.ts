import { z } from "zod";

export const signupSchema = z.object({
  name: z.string().min(2).max(80),
  email: z
    .string()
    .email()
    .max(254)
    .transform((value) => value.toLowerCase().trim()),
  password: z.string().min(8).max(128),
  role: z.enum(["admin", "member"]).optional(),
});

export const loginSchema = z.object({
  email: z
    .string()
    .email()
    .max(254)
    .transform((value) => value.toLowerCase().trim()),
  password: z.string().min(8).max(128),
});
