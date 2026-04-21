import { Router } from "express"
import type { Router as RouterType } from "express"
import { requireAuth } from "../auth/middleware.js"
import { createAnnouncementSchema, updateAnnouncementSchema } from "./schema.js"
import {
  createAnnouncement,
  deleteAnnouncement,
  getAnnouncementById,
  listAnnouncements,
  listAnnouncementsByAuthor,
  updateAnnouncement,
} from "./service.js"

export const announcementsRoutes: RouterType = Router()

announcementsRoutes.use(requireAuth)

/**
 * @openapi
 * /announcements:
 *   get:
 *     summary: List announcements (pinned first, then newest)
 *     tags: [Announcements]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of announcements
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/AnnouncementsResponse' }
 *       401:
 *         description: Missing, invalid, or expired token
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
announcementsRoutes.get("/", async (_req, res, next) => {
  try {
    const announcements = await listAnnouncements()
    res.json({ announcements })
  } catch (err) {
    next(err)
  }
})

/**
 * @openapi
 * /announcements/my-announcements:
 *   get:
 *     summary: List announcements created by the current user
 *     tags: [Announcements]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of the current user's announcements
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/AnnouncementsResponse' }
 *       401:
 *         description: Missing, invalid, or expired token
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
announcementsRoutes.get("/my-announcements", async (req, res, next) => {
  try {
    const announcements = await listAnnouncementsByAuthor(req.user!.id)
    res.json({ announcements })
  } catch (err) {
    next(err)
  }
})

/**
 * @openapi
 * /announcements/{id}:
 *   get:
 *     summary: Get a single announcement by id
 *     tags: [Announcements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Announcement
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/AnnouncementResponse' }
 *       401:
 *         description: Missing, invalid, or expired token
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       404:
 *         description: Announcement not found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
announcementsRoutes.get("/:id", async (req, res, next) => {
  try {
    const announcement = await getAnnouncementById(req.params.id)
    res.json({ announcement })
  } catch (err) {
    next(err)
  }
})

/**
 * @openapi
 * /announcements:
 *   post:
 *     summary: Create a new announcement (author = current user)
 *     tags: [Announcements]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, body]
 *             properties:
 *               title: { type: string }
 *               body: { type: string }
 *               pinned: { type: boolean }
 *     responses:
 *       201:
 *         description: Created announcement
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/AnnouncementResponse' }
 *       400:
 *         description: Validation failed
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ValidationError' }
 *       401:
 *         description: Missing, invalid, or expired token
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
announcementsRoutes.post("/", async (req, res, next) => {
  try {
    const input = createAnnouncementSchema.parse(req.body)
    const announcement = await createAnnouncement(req.user!.id, input)
    res.status(201).json({ announcement })
  } catch (err) {
    next(err)
  }
})

/**
 * @openapi
 * /announcements/{id}:
 *   put:
 *     summary: Update an announcement (author only)
 *     tags: [Announcements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title: { type: string }
 *               body: { type: string }
 *               pinned: { type: boolean }
 *     responses:
 *       200:
 *         description: Updated announcement
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/AnnouncementResponse' }
 *       400:
 *         description: Validation failed
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ValidationError' }
 *       401:
 *         description: Missing, invalid, or expired token
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       403:
 *         description: Not the author
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       404:
 *         description: Announcement not found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
announcementsRoutes.put("/:id", async (req, res, next) => {
  try {
    const input = updateAnnouncementSchema.parse(req.body)
    const announcement = await updateAnnouncement(
      req.params.id,
      req.user!.id,
      input
    )
    res.json({ announcement })
  } catch (err) {
    next(err)
  }
})

/**
 * @openapi
 * /announcements/{id}:
 *   delete:
 *     summary: Delete an announcement (author only)
 *     tags: [Announcements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204:
 *         description: Deleted
 *       401:
 *         description: Missing, invalid, or expired token
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       403:
 *         description: Not the author
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       404:
 *         description: Announcement not found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
announcementsRoutes.delete("/:id", async (req, res, next) => {
  try {
    await deleteAnnouncement(req.params.id, req.user!.id)
    res.status(204).end()
  } catch (err) {
    next(err)
  }
})
