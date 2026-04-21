import { describe, expect, it } from "vitest"
import { loginSchema, registerSchema } from "./schemas"

describe("loginSchema", () => {
  it("accepts valid input", () => {
    const result = loginSchema.safeParse({
      email: "jane@example.com",
      password: "secret123",
    })
    expect(result.success).toBe(true)
  })

  it("rejects invalid email", () => {
    const result = loginSchema.safeParse({
      email: "not-an-email",
      password: "secret123",
    })
    expect(result.success).toBe(false)
    const errors = result.error?.message
    expect(errors).toContain("Invalid email address")
  })

  it("rejects password shorter than 6 chars", () => {
    const result = loginSchema.safeParse({
      email: "jane@example.com",
      password: "12345",
    })
    expect(result.success).toBe(false)
    const errors = result.error?.message
    expect(errors).toContain("Password must be at least 6 characters")
  })

  it("rejects missing fields", () => {
    const result = loginSchema.safeParse({})
    expect(result.success).toBe(false)
    expect(result.error?.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: ["email"],
          message: "Invalid email address",
        }),
        expect.objectContaining({
          path: ["password"],
          message: "Password is required",
        }),
      ])
    )
  })

  it("accepts 6-char password (boundary)", () => {
    const result = loginSchema.safeParse({
      email: "jane@example.com",
      password: "abcdef",
    })
    expect(result.success).toBe(true)
  })
})

describe("registerSchema", () => {
  it("accepts valid input", () => {
    const result = registerSchema.safeParse({
      email: "jane@example.com",
      name: "Jane",
      password: "secret123",
    })
    expect(result.success).toBe(true)
  })

  it("rejects name shorter than 2 chars", () => {
    const result = registerSchema.safeParse({
      email: "jane@example.com",
      name: "J",
      password: "secret123",
    })
    expect(result.success).toBe(false)
    const errors = result.error?.message
    expect(errors).toContain("Name must be at least 2 characters")
  })

  it("accepts 2-char name (boundary)", () => {
    const result = registerSchema.safeParse({
      email: "jane@example.com",
      name: "Jo",
      password: "secret123",
    })
    expect(result.success).toBe(true)
  })

  it("reports multiple field errors at once", () => {
    const result = registerSchema.safeParse({
      email: "nope",
      name: "",
      password: "123",
    })
    expect(result.success).toBe(false)
    const errors = result.error?.message
    expect(errors).toContain("Invalid email address")
    expect(errors).toContain("Name must be at least 2 characters")
    expect(errors).toContain("Password must be at least 6 characters")
  })

  it("rejects missing all fields", () => {
    const result = registerSchema.safeParse({})
    expect(result.success).toBe(false)
    const errors = result.error?.issues
    expect(errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: ["email"],
          message: "Invalid email address",
        }),
        expect.objectContaining({
          path: ["name"],
          message: "Name is required",
        }),
        expect.objectContaining({
          path: ["password"],
          message: "Password is required",
        }),
      ])
    )
  })
})
