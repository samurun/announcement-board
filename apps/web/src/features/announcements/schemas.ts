import { z } from "zod/v4"

export const createAnnouncementSchema = z.object({
  title: z
    .string({ error: "Title is required" })
    .min(1, { error: "Title is required" }),
  body: z
    .string({ error: "Body is required" })
    .min(1, { error: "Body is required" }),
  pinned: z.boolean().optional(),
})

export const updateAnnouncementSchema = createAnnouncementSchema.partial()

export type CreateAnnouncementInput = z.infer<typeof createAnnouncementSchema>
export type UpdateAnnouncementInput = z.infer<typeof updateAnnouncementSchema>
