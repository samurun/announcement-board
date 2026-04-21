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

const {
  AppError,
  getUserById,
  loginUser,
  registerUser,
} = await import("../../src/modules/auth/service.js")
const { hashPassword, verifyToken } = await import(
  "../../src/modules/auth/crypto.js"
)

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

describe("auth/service: registerUser", () => {
  it("creates a user, returns public user + valid token", async () => {
    userFindUnique.mockResolvedValueOnce(null)
    userCreate.mockImplementationOnce(async ({ data }) => ({
      ...baseUser,
      email: data.email,
      name: data.name,
      passwordHash: data.passwordHash,
    }))

    const result = await registerUser({
      email: "new@example.com",
      password: "secret6",
      name: "New",
    })

    expect(userFindUnique).toHaveBeenCalledWith({
      where: { email: "new@example.com" },
    })
    expect(userCreate).toHaveBeenCalledOnce()
    const createArgs = userCreate.mock.calls[0][0]
    expect(createArgs.data.email).toBe("new@example.com")
    expect(createArgs.data.name).toBe("New")
    expect(createArgs.data.passwordHash).not.toBe("secret6")
    expect(createArgs.data.passwordHash.startsWith("$argon2id$")).toBe(true)

    expect(result.user).not.toHaveProperty("passwordHash")
    expect(result.user.email).toBe("new@example.com")

    const payload = await verifyToken(result.token)
    expect(payload.sub).toBe(baseUser.id)
    expect(payload.email).toBe("new@example.com")
  })

  it("throws 409 when email already exists", async () => {
    userFindUnique.mockResolvedValueOnce({ ...baseUser, passwordHash: "x" })

    await expect(
      registerUser({
        email: "user@example.com",
        password: "secret6",
        name: "User",
      })
    ).rejects.toMatchObject({
      name: "AppError",
      statusCode: 409,
      message: "Email already in use",
    })
    expect(userCreate).not.toHaveBeenCalled()
  })
})

describe("auth/service: loginUser", () => {
  it("returns public user + token on valid credentials", async () => {
    const passwordHash = await hashPassword("secret6")
    userFindUnique.mockResolvedValueOnce({ ...baseUser, passwordHash })

    const result = await loginUser({
      email: baseUser.email,
      password: "secret6",
    })

    expect(result.user).not.toHaveProperty("passwordHash")
    expect(result.user.id).toBe(baseUser.id)

    const payload = await verifyToken(result.token)
    expect(payload.sub).toBe(baseUser.id)
  })

  it("throws 401 when user not found", async () => {
    userFindUnique.mockResolvedValueOnce(null)

    await expect(
      loginUser({ email: "missing@example.com", password: "x" })
    ).rejects.toMatchObject({
      statusCode: 401,
      message: "Invalid email or password",
    })
  })

  it("throws 401 on wrong password", async () => {
    const passwordHash = await hashPassword("correct-password")
    userFindUnique.mockResolvedValueOnce({ ...baseUser, passwordHash })

    await expect(
      loginUser({ email: baseUser.email, password: "wrong" })
    ).rejects.toMatchObject({
      statusCode: 401,
      message: "Invalid email or password",
    })
  })
})

describe("auth/service: getUserById", () => {
  it("returns a public user when found", async () => {
    userFindUnique.mockResolvedValueOnce({ ...baseUser, passwordHash: "x" })

    const user = await getUserById(baseUser.id)
    expect(user).not.toBeNull()
    expect(user).not.toHaveProperty("passwordHash")
    expect(user?.id).toBe(baseUser.id)
  })

  it("returns null when not found", async () => {
    userFindUnique.mockResolvedValueOnce(null)
    const user = await getUserById("missing")
    expect(user).toBeNull()
  })
})

describe("auth/service: AppError", () => {
  it("carries statusCode and name", () => {
    const err = new AppError(418, "teapot")
    expect(err.statusCode).toBe(418)
    expect(err.message).toBe("teapot")
    expect(err.name).toBe("AppError")
    expect(err).toBeInstanceOf(Error)
  })
})
