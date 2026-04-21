import express from "express"
import request from "supertest"
import { beforeEach, describe, expect, it, vi } from "vitest"

const userFindUnique = vi.fn()
const announcementCreate = vi.fn()
const announcementFindMany = vi.fn()
const announcementFindUnique = vi.fn()
const announcementUpdate = vi.fn()
const announcementDelete = vi.fn()

vi.mock("@workspace/db", () => ({
  db: {
    user: { findUnique: userFindUnique },
    announcement: {
      create: announcementCreate,
      findMany: announcementFindMany,
      findUnique: announcementFindUnique,
      update: announcementUpdate,
      delete: announcementDelete,
    },
  },
}))

const { announcementsRoutes } = await import(
  "../../src/modules/announcements/router.js"
)
const { errorHandler } = await import(
  "../../src/middleware/error-handler.js"
)
const { signToken } = await import("../../src/modules/auth/crypto.js")

function makeApp() {
  const app = express()
  app.use(express.json())
  app.use("/announcements", announcementsRoutes)
  app.use(errorHandler)
  return app
}

const author = { id: "user-1", email: "alice@example.com", name: "Alice" }
const other = { id: "user-2", email: "bob@example.com", name: "Bob" }

async function authHeader(user: { id: string; email: string }) {
  const token = await signToken({ sub: user.id, email: user.email })
  return `Bearer ${token}`
}

const sampleAnnouncement = {
  id: "a-1",
  title: "Welcome",
  body: "Hello world",
  author: author.name,
  authorId: author.id,
  pinned: false,
  createdAt: new Date("2026-01-01"),
  updatedAt: new Date("2026-01-01"),
}

beforeEach(() => {
  userFindUnique.mockReset()
  announcementCreate.mockReset()
  announcementFindMany.mockReset()
  announcementFindUnique.mockReset()
  announcementUpdate.mockReset()
  announcementDelete.mockReset()
})

describe("auth gate", () => {
  it("returns 401 on all routes without a token", async () => {
    const app = makeApp()
    const routes = [
      ["get", "/announcements"],
      ["get", "/announcements/my-announcements"],
      ["get", "/announcements/a-1"],
      ["post", "/announcements"],
      ["put", "/announcements/a-1"],
      ["delete", "/announcements/a-1"],
    ] as const

    for (const [method, path] of routes) {
      const res = await request(app)[method](path)
      expect(res.status, `${method} ${path}`).toBe(401)
    }
  })
})

describe("GET /announcements", () => {
  it("returns pinned items before non-pinned regardless of createdAt", async () => {
    const now = new Date("2026-03-01")
    const older = new Date("2026-01-01")
    announcementFindMany.mockResolvedValueOnce([
      { ...sampleAnnouncement, id: "pinned-old", pinned: true, createdAt: older },
      { ...sampleAnnouncement, id: "unpinned-new", pinned: false, createdAt: now },
    ])

    const res = await request(makeApp())
      .get("/announcements")
      .set("Authorization", await authHeader(author))

    expect(res.status).toBe(200)
    expect(res.body.announcements.map((a: { id: string }) => a.id)).toEqual([
      "pinned-old",
      "unpinned-new",
    ])
    expect(announcementFindMany).toHaveBeenCalledWith({
      orderBy: [{ pinned: "desc" }, { createdAt: "desc" }],
    })
  })
})

describe("GET /announcements/my-announcements", () => {
  it("filters by the authenticated user's id", async () => {
    announcementFindMany.mockResolvedValueOnce([])

    await request(makeApp())
      .get("/announcements/my-announcements")
      .set("Authorization", await authHeader(author))

    expect(announcementFindMany).toHaveBeenCalledWith({
      where: { authorId: author.id },
      orderBy: [{ pinned: "desc" }, { createdAt: "desc" }],
    })
  })
})

describe("POST /announcements", () => {
  it("creates with author derived from the token, not the body", async () => {
    userFindUnique.mockResolvedValueOnce(author)
    announcementCreate.mockImplementationOnce(async ({ data }) => ({
      ...sampleAnnouncement,
      ...data,
      id: "a-new",
    }))

    const res = await request(makeApp())
      .post("/announcements")
      .set("Authorization", await authHeader(author))
      .send({
        title: "Hi",
        body: "body",
        pinned: true,
        author: "spoofed",
        authorId: other.id,
      })

    expect(res.status).toBe(201)
    expect(res.body.announcement.author).toBe(author.name)
    expect(res.body.announcement.authorId).toBe(author.id)
    expect(announcementCreate).toHaveBeenCalledWith({
      data: {
        title: "Hi",
        body: "body",
        pinned: true,
        author: author.name,
        authorId: author.id,
      },
    })
  })

  it("returns 400 with field errors on missing title/body", async () => {
    const res = await request(makeApp())
      .post("/announcements")
      .set("Authorization", await authHeader(author))
      .send({ title: "", body: "" })

    expect(res.status).toBe(400)
    expect(res.body.message).toBe("Validation failed")
    expect(res.body.errors).toMatchObject({
      title: expect.any(Array),
      body: expect.any(Array),
    })
    expect(announcementCreate).not.toHaveBeenCalled()
  })

  it("defaults pinned to false when omitted", async () => {
    userFindUnique.mockResolvedValueOnce(author)
    announcementCreate.mockImplementationOnce(async ({ data }) => ({
      ...sampleAnnouncement,
      ...data,
    }))

    await request(makeApp())
      .post("/announcements")
      .set("Authorization", await authHeader(author))
      .send({ title: "T", body: "B" })

    expect(announcementCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({ pinned: false }),
    })
  })
})

describe("PUT /announcements/:id", () => {
  it("returns 403 when the caller is not the author", async () => {
    announcementFindUnique.mockResolvedValueOnce({
      ...sampleAnnouncement,
      authorId: other.id,
    })

    const res = await request(makeApp())
      .put("/announcements/a-1")
      .set("Authorization", await authHeader(author))
      .send({ title: "new" })

    expect(res.status).toBe(403)
    expect(announcementUpdate).not.toHaveBeenCalled()
  })

  it("returns 404 when the announcement does not exist", async () => {
    announcementFindUnique.mockResolvedValueOnce(null)

    const res = await request(makeApp())
      .put("/announcements/missing")
      .set("Authorization", await authHeader(author))
      .send({ title: "new" })

    expect(res.status).toBe(404)
  })

  it("returns 400 when body has no fields", async () => {
    const res = await request(makeApp())
      .put("/announcements/a-1")
      .set("Authorization", await authHeader(author))
      .send({})

    expect(res.status).toBe(400)
    expect(res.body.message).toBe("Validation failed")
  })

  it("updates when the caller is the author", async () => {
    announcementFindUnique.mockResolvedValueOnce(sampleAnnouncement)
    announcementUpdate.mockImplementationOnce(async ({ data }) => ({
      ...sampleAnnouncement,
      ...data,
    }))

    const res = await request(makeApp())
      .put("/announcements/a-1")
      .set("Authorization", await authHeader(author))
      .send({ pinned: true })

    expect(res.status).toBe(200)
    expect(res.body.announcement.pinned).toBe(true)
    expect(announcementUpdate).toHaveBeenCalledWith({
      where: { id: "a-1" },
      data: { pinned: true },
    })
  })
})

describe("DELETE /announcements/:id", () => {
  it("returns 403 when the caller is not the author", async () => {
    announcementFindUnique.mockResolvedValueOnce({
      ...sampleAnnouncement,
      authorId: other.id,
    })

    const res = await request(makeApp())
      .delete("/announcements/a-1")
      .set("Authorization", await authHeader(author))

    expect(res.status).toBe(403)
    expect(announcementDelete).not.toHaveBeenCalled()
  })

  it("returns 204 when the author deletes their own", async () => {
    announcementFindUnique.mockResolvedValueOnce(sampleAnnouncement)
    announcementDelete.mockResolvedValueOnce(sampleAnnouncement)

    const res = await request(makeApp())
      .delete("/announcements/a-1")
      .set("Authorization", await authHeader(author))

    expect(res.status).toBe(204)
    expect(announcementDelete).toHaveBeenCalledWith({ where: { id: "a-1" } })
  })
})
