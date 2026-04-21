import { db } from "@workspace/db"
import { AppError } from "../../lib/errors.js"
import type {
  CreateAnnouncementInput,
  UpdateAnnouncementInput,
} from "./schema.js"

export async function createAnnouncement(
  authorId: string,
  input: CreateAnnouncementInput
) {
  const user = await db.user.findUnique({ where: { id: authorId } })
  if (!user) throw new AppError(404, "User not found")

  return db.announcement.create({
    data: {
      title: input.title,
      body: input.body,
      pinned: input.pinned ?? false,
      author: user.name,
      authorId,
    },
  })
}

export function listAnnouncements() {
  return db.announcement.findMany({
    orderBy: [{ pinned: "desc" }, { createdAt: "desc" }],
  })
}

export function listAnnouncementsByAuthor(authorId: string) {
  return db.announcement.findMany({
    where: { authorId },
    orderBy: [{ pinned: "desc" }, { createdAt: "desc" }],
  })
}

export async function getAnnouncementById(id: string) {
  const announcement = await db.announcement.findUnique({ where: { id } })
  if (!announcement) throw new AppError(404, "Announcement not found")
  return announcement
}

async function assertAuthor(id: string, authorId: string, action: string) {
  const existing = await getAnnouncementById(id)
  if (existing.authorId !== authorId) {
    throw new AppError(403, `Cannot ${action} another user's announcement`)
  }
  return existing
}

export async function updateAnnouncement(
  id: string,
  authorId: string,
  input: UpdateAnnouncementInput
) {
  await assertAuthor(id, authorId, "edit")
  return db.announcement.update({ where: { id }, data: input })
}

export async function deleteAnnouncement(id: string, authorId: string) {
  await assertAuthor(id, authorId, "delete")
  await db.announcement.delete({ where: { id } })
}
