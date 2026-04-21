import type { NextFunction, Request, Response } from "express"
import { describe, expect, it, vi } from "vitest"
import { signToken } from "../../src/modules/auth/crypto.js"
import { requireAuth } from "../../src/modules/auth/middleware.js"

function makeReq(headers: Record<string, string> = {}): Request {
  return { headers } as unknown as Request
}

describe("auth/middleware: requireAuth", () => {
  it("calls next() with no error and sets req.user on valid token", async () => {
    const token = await signToken({ sub: "user-1", email: "a@b.com" })
    const req = makeReq({ authorization: `Bearer ${token}` })
    const next = vi.fn() as unknown as NextFunction

    await requireAuth(req, {} as Response, next)

    expect(next).toHaveBeenCalledOnce()
    expect((next as unknown as ReturnType<typeof vi.fn>).mock.calls[0][0]).toBeUndefined()
    expect(req.user).toEqual({ id: "user-1", email: "a@b.com" })
  })

  it("rejects missing Authorization header with 401", async () => {
    const req = makeReq()
    const next = vi.fn() as unknown as NextFunction

    await requireAuth(req, {} as Response, next)

    const err = (next as unknown as ReturnType<typeof vi.fn>).mock.calls[0][0]
    expect(err).toMatchObject({
      statusCode: 401,
      message: "Missing or invalid Authorization header",
    })
    expect(req.user).toBeUndefined()
  })

  it("rejects non-Bearer scheme with 401", async () => {
    const req = makeReq({ authorization: "Basic abc" })
    const next = vi.fn() as unknown as NextFunction

    await requireAuth(req, {} as Response, next)

    const err = (next as unknown as ReturnType<typeof vi.fn>).mock.calls[0][0]
    expect(err).toMatchObject({
      statusCode: 401,
      message: "Missing or invalid Authorization header",
    })
  })

  it("rejects invalid / malformed token with 401", async () => {
    const req = makeReq({ authorization: "Bearer not.a.jwt" })
    const next = vi.fn() as unknown as NextFunction

    await requireAuth(req, {} as Response, next)

    const err = (next as unknown as ReturnType<typeof vi.fn>).mock.calls[0][0]
    expect(err).toMatchObject({
      statusCode: 401,
      message: "Invalid or expired token",
    })
  })

  it("rejects a tampered token with 401", async () => {
    const token = await signToken({ sub: "user-1", email: "a@b.com" })
    const tampered = token.slice(0, -2) + (token.endsWith("A") ? "B" : "A")
    const req = makeReq({ authorization: `Bearer ${tampered}` })
    const next = vi.fn() as unknown as NextFunction

    await requireAuth(req, {} as Response, next)

    const err = (next as unknown as ReturnType<typeof vi.fn>).mock.calls[0][0]
    expect(err).toMatchObject({ statusCode: 401 })
  })
})
