import express from "express"
import request from "supertest"
import { beforeEach, describe, expect, it, vi } from "vitest"

const userFindUnique = vi.fn()
const userCreate = vi.fn()

vi.mock("@workspace/db", () => ({
  db: {
    user: {
      findUnique: userFindUnique,
      create: userCreate,
    },
  },
}))

const { authRoutes } = await import("../../src/modules/auth/router.js")
const { errorHandler } = await import(
  "../../src/middleware/error-handler.js"
)
const { hashPassword, signToken } =
  await import("../../src/modules/auth/crypto.js")

function makeApp() {
  const app = express()
  app.use(express.json())
  app.use("/auth", authRoutes)
  app.use(errorHandler)
  return app
}

const baseUser = {
  id: "user-1",
  email: "user@example.com",
  name: "User",
  createdAt: new Date("2026-01-01"),
  updatedAt: new Date("2026-01-02"),
}

beforeEach(() => {
  userFindUnique.mockReset()
  userCreate.mockReset()
})

describe("POST /auth/register", () => {
  it("returns 201 with user + token on success", async () => {
    userFindUnique.mockResolvedValueOnce(null)
    userCreate.mockImplementationOnce(async ({ data }) => ({
      ...baseUser,
      email: data.email,
      name: data.name,
      passwordHash: data.passwordHash,
    }))

    const res = await request(makeApp())
      .post("/auth/register")
      .send({ email: "new@example.com", password: "secret6", name: "New" })

    expect(res.status).toBe(201)
    expect(res.body.user.email).toBe("new@example.com")
    expect(res.body.user).not.toHaveProperty("passwordHash")
    expect(typeof res.body.token).toBe("string")
  })

  it("returns 400 with field errors on invalid input", async () => {
    const res = await request(makeApp())
      .post("/auth/register")
      .send({ email: "bad", password: "x", name: "J" })

    expect(res.status).toBe(400)
    expect(res.body.message).toBe("Validation failed")
    expect(res.body.errors).toMatchObject({
      email: expect.any(Array),
      password: expect.any(Array),
      name: expect.any(Array),
    })
    expect(userCreate).not.toHaveBeenCalled()
  })

  it("returns 409 when email already exists", async () => {
    userFindUnique.mockResolvedValueOnce({ ...baseUser, passwordHash: "x" })

    const res = await request(makeApp()).post("/auth/register").send({
      email: baseUser.email,
      password: "secret6",
      name: baseUser.name,
    })

    expect(res.status).toBe(409)
    expect(res.body.message).toBe("Email already in use")
  })
})

describe("POST /auth/login", () => {
  it("returns 200 with user + token on valid credentials", async () => {
    const passwordHash = await hashPassword("secret6")
    userFindUnique.mockResolvedValueOnce({ ...baseUser, passwordHash })

    const res = await request(makeApp())
      .post("/auth/login")
      .send({ email: baseUser.email, password: "secret6" })

    expect(res.status).toBe(200)
    expect(res.body.user.id).toBe(baseUser.id)
    expect(res.body.user).not.toHaveProperty("passwordHash")
    expect(typeof res.body.token).toBe("string")
  })

  it("returns 400 on invalid input", async () => {
    const res = await request(makeApp())
      .post("/auth/login")
      .send({ email: "nope", password: "" })

    expect(res.status).toBe(400)
    expect(res.body.message).toBe("Validation failed")
  })

  it("returns 401 when user not found", async () => {
    userFindUnique.mockResolvedValueOnce(null)

    const res = await request(makeApp())
      .post("/auth/login")
      .send({ email: "missing@example.com", password: "secret6" })

    expect(res.status).toBe(401)
    expect(res.body.message).toBe("Invalid email or password")
  })

  it("returns 401 on wrong password", async () => {
    const passwordHash = await hashPassword("correct")
    userFindUnique.mockResolvedValueOnce({ ...baseUser, passwordHash })

    const res = await request(makeApp())
      .post("/auth/login")
      .send({ email: baseUser.email, password: "wrong" })

    expect(res.status).toBe(401)
    expect(res.body.message).toBe("Invalid email or password")
  })
})

describe("GET /auth/me", () => {
  it("returns 200 with current user on valid token", async () => {
    userFindUnique.mockResolvedValueOnce({ ...baseUser, passwordHash: "x" })
    const token = await signToken({ sub: baseUser.id, email: baseUser.email })

    const res = await request(makeApp())
      .get("/auth/me")
      .set("Authorization", `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body.user.id).toBe(baseUser.id)
    expect(res.body.user).not.toHaveProperty("passwordHash")
  })

  it("returns 401 without Authorization header", async () => {
    const res = await request(makeApp()).get("/auth/me")
    expect(res.status).toBe(401)
    expect(res.body.message).toBe("Missing or invalid Authorization header")
  })

  it("returns 401 with invalid token", async () => {
    const res = await request(makeApp())
      .get("/auth/me")
      .set("Authorization", "Bearer garbage")

    expect(res.status).toBe(401)
    expect(res.body.message).toBe("Invalid or expired token")
  })

  it("returns 404 when token valid but user missing", async () => {
    userFindUnique.mockResolvedValueOnce(null)
    const token = await signToken({ sub: "ghost", email: "ghost@example.com" })

    const res = await request(makeApp())
      .get("/auth/me")
      .set("Authorization", `Bearer ${token}`)

    expect(res.status).toBe(404)
    expect(res.body.message).toBe("User not found")
  })
})
