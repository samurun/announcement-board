import { describe, expect, it } from "vitest"
import {
  hashPassword,
  signToken,
  verifyPassword,
  verifyToken,
} from "../../src/modules/auth/crypto.js"

describe("auth/crypto: password hashing", () => {
  it("hashes a password to a non-plain argon2id string", async () => {
    const hash = await hashPassword("secret-pass")
    expect(hash).not.toBe("secret-pass")
    expect(hash.startsWith("$argon2id$")).toBe(true)
  })

  it("verifies the correct password", async () => {
    const hash = await hashPassword("hunter2")
    await expect(verifyPassword("hunter2", hash)).resolves.toBe(true)
  })

  it("rejects an incorrect password", async () => {
    const hash = await hashPassword("hunter2")
    await expect(verifyPassword("wrong", hash)).resolves.toBe(false)
  })

  it("produces different hashes for the same input (unique salt)", async () => {
    const a = await hashPassword("same")
    const b = await hashPassword("same")
    expect(a).not.toBe(b)
  })
})

describe("auth/crypto: JWT sign/verify", () => {
  it("round-trips a payload through sign and verify", async () => {
    const token = await signToken({ sub: "user-1", email: "a@b.com" })
    const payload = await verifyToken(token)
    expect(payload.sub).toBe("user-1")
    expect(payload.email).toBe("a@b.com")
  })

  it("rejects a tampered token", async () => {
    const token = await signToken({ sub: "u", email: "a@b.com" })
    const tampered = token.slice(0, -2) + (token.endsWith("A") ? "B" : "A")
    await expect(verifyToken(tampered)).rejects.toThrow()
  })

  it("rejects a malformed token", async () => {
    await expect(verifyToken("not-a-jwt")).rejects.toThrow()
  })
})
