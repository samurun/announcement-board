import { z } from "zod"

export const createAnnouncementSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  body: z.string().min(1, { message: "Body is required" }),
  pinned: z.boolean().optional(),
})

export const updateAnnouncementSchema = z
  .object({
    title: z.string().min(1, { message: "Title is required" }).optional(),
    body: z.string().min(1, { message: "Body is required" }).optional(),
    pinned: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  })

export type CreateAnnouncementInput = z.infer<typeof createAnnouncementSchema>
export type UpdateAnnouncementInput = z.infer<typeof updateAnnouncementSchema>
