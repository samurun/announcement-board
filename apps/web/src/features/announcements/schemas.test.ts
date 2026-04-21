import { describe, expect, it } from "vitest"
import { createAnnouncementSchema, updateAnnouncementSchema } from "./schemas"

describe("createAnnouncementSchema", () => {
  it("accepts valid input with pinned", () => {
    const result = createAnnouncementSchema.safeParse({
      title: "Welcome",
      body: "Hello",
      pinned: true,
    })
    expect(result.success).toBe(true)
  })

  it("accepts input without pinned (optional)", () => {
    const result = createAnnouncementSchema.safeParse({
      title: "Welcome",
      body: "Hello",
    })
    expect(result.success).toBe(true)
  })

  it("rejects empty title with field-level error", () => {
    const result = createAnnouncementSchema.safeParse({
      title: "",
      body: "Hello",
    })
    expect(result.success).toBe(false)
    expect(result.error?.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: ["title"],
          message: "Title is required",
        }),
      ])
    )
  })

  it("rejects empty body with field-level error", () => {
    const result = createAnnouncementSchema.safeParse({
      title: "T",
      body: "",
    })
    expect(result.success).toBe(false)
    expect(result.error?.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: ["body"],
          message: "Body is required",
        }),
      ])
    )
  })

  it("reports both field errors when both are missing", () => {
    const result = createAnnouncementSchema.safeParse({})
    expect(result.success).toBe(false)
    const paths = result.error?.issues.map((i) => i.path[0])
    expect(paths).toEqual(expect.arrayContaining(["title", "body"]))
  })

  it("rejects non-boolean pinned", () => {
    const result = createAnnouncementSchema.safeParse({
      title: "T",
      body: "B",
      pinned: "yes",
    })
    expect(result.success).toBe(false)
  })
})

describe("updateAnnouncementSchema", () => {
  it("accepts an empty object (all fields optional)", () => {
    const result = updateAnnouncementSchema.safeParse({})
    expect(result.success).toBe(true)
  })

  it("accepts a single field", () => {
    const result = updateAnnouncementSchema.safeParse({ pinned: true })
    expect(result.success).toBe(true)
  })

  it("still rejects empty title when provided", () => {
    const result = updateAnnouncementSchema.safeParse({ title: "" })
    expect(result.success).toBe(false)
    expect(result.error?.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: ["title"] }),
      ])
    )
  })
})
