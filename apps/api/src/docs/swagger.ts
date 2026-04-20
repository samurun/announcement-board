import path from "node:path"
import swaggerJsdoc from "swagger-jsdoc"
import { env } from "../env.js"

const srcDir = path.resolve(import.meta.dirname, "..")

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Announcement Board API",
      version: "1.0.0",
      description: "Internal news feed — CRUD announcements with JWT auth.",
    },
    servers: [
      { url: `http://localhost:${env.API_PORT}`, description: "Local dev" },
    ],
    components: {
      schemas: {
        Health: {
          type: "object",
          required: ["status", "db", "timestamp"],
          properties: {
            status: { type: "string", enum: ["ok", "error"] },
            db: { type: "string", enum: ["up", "down"] },
            timestamp: { type: "string", format: "date-time" },
            error: { type: "string" },
          },
        },
      },
    },
  },
  apis: [path.join(srcDir, "**/*.ts"), path.join(srcDir, "**/*.js")],
}

export const swaggerSpec = swaggerJsdoc(options)
