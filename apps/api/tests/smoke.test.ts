import { afterAll, describe, expect, it } from "vitest"
import request from "supertest"
import { buildApp } from "../src/app.js"
import { disconnectDb } from "./setup.js"

describe("smoke: app boots", () => {
  const app = buildApp()

  afterAll(async () => {
    await disconnectDb()
  })

  it("GET /health returns 200 when db is up", async () => {
    const res = await request(app).get("/health")
    expect(res.status).toBe(200)
    expect(res.body.status).toBe("ok")
    expect(res.body.db).toBe("up")
  })
})
