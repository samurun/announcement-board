import { describe, expect, it } from "vitest"
import {
  jwtPayloadSchema,
  loginSchema,
  registerSchema,
} from "../../src/modules/auth/schema.js"

describe("auth/schema: registerSchema", () => {
  it("accepts a valid input", () => {
    const result = registerSchema.safeParse({
      email: "user@example.com",
      password: "secret6",
      name: "Jane",
    })
    expect(result.success).toBe(true)
  })

  it("rejects invalid email", () => {
    const result = registerSchema.safeParse({
      email: "nope",
      password: "secret6",
      name: "Jane",
    })
    expect(result.success).toBe(false)
  })

  it("rejects short password", () => {
    const result = registerSchema.safeParse({
      email: "user@example.com",
      password: "abc",
      name: "Jane",
    })
    expect(result.success).toBe(false)
  })

  it("rejects short name", () => {
    const result = registerSchema.safeParse({
      email: "user@example.com",
      password: "secret6",
      name: "J",
    })
    expect(result.success).toBe(false)
  })
})

describe("auth/schema: loginSchema", () => {
  it("accepts valid input", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
      password: "anything",
    })
    expect(result.success).toBe(true)
  })

  it("rejects empty password", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
      password: "",
    })
    expect(result.success).toBe(false)
  })

  it("rejects invalid email", () => {
    const result = loginSchema.safeParse({
      email: "bad",
      password: "x",
    })
    expect(result.success).toBe(false)
  })
})

describe("auth/schema: jwtPayloadSchema", () => {
  it("accepts valid payload", () => {
    const result = jwtPayloadSchema.safeParse({
      sub: "abc",
      email: "a@b.com",
    })
    expect(result.success).toBe(true)
  })

  it("rejects missing sub", () => {
    const result = jwtPayloadSchema.safeParse({ email: "a@b.com" })
    expect(result.success).toBe(false)
  })
})
