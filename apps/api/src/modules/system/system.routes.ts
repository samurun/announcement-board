import { Router } from "express"
import type { Request, Response, Router as RouterType } from "express"
import { db } from "@workspace/db"

export const systemRoutes: RouterType = Router()

systemRoutes.get("/", (_req: Request, res: Response) => {
  res.send(
    'Welcome to the Announcement Board API! Visit <a href="/docs">/docs</a> for API documentation.'
  )
})

/**
 * @openapi
 * /health:
 *   get:
 *     summary: Liveness + DB connectivity check
 *     tags: [System]
 *     responses:
 *       200:
 *         description: Service and DB are up
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Health' }
 *       503:
 *         description: DB is unreachable
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Health' }
 */
systemRoutes.get("/health", async (_req: Request, res: Response) => {
  const timestamp = new Date().toISOString()
  try {
    await db.$queryRaw`SELECT 1`
    res.json({ status: "ok", db: "up", timestamp })
  } catch (err) {
    res.status(503).json({
      status: "error",
      db: "down",
      timestamp,
      error: err instanceof Error ? err.message : "unknown",
    })
  }
})
