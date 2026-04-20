import { z } from "zod/v4"

export const loginSchema = z.object({
  email: z.email({ error: "Invalid email address" }),
  password: z
    .string({ error: "Password is required" })
    .min(6, { error: "Password must be at least 6 characters" }),
})

export const registerSchema = z.object({
  email: z.email({ error: "Invalid email address" }),
  name: z
    .string({ error: "Name is required" })
    .min(2, { error: "Name must be at least 2 characters" }),
  password: z
    .string({ error: "Password is required" })
    .min(6, { error: "Password must be at least 6 characters" }),
})

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
