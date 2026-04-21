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
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
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
        RegisterInput: {
          type: "object",
          required: ["email", "password", "name"],
          properties: {
            email: { type: "string", format: "email" },
            password: { type: "string", minLength: 6 },
            name: { type: "string", minLength: 2 },
          },
        },
        LoginInput: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: { type: "string", format: "email" },
            password: { type: "string", minLength: 1 },
          },
        },
        AuthResponse: {
          type: "object",
          required: ["user", "token"],
          properties: {
            user: {
              type: "object",
              required: ["id", "email", "name"],
              properties: {
                id: { type: "string" },
                email: { type: "string", format: "email" },
                name: { type: "string" },
              },
            },
            token: { type: "string" },
          },
        },
        MeResponse: {
          type: "object",
          required: ["user"],
          properties: {
            user: {
              type: "object",
              required: ["id", "email", "name"],
              properties: {
                id: { type: "string" },
                email: { type: "string", format: "email" },
                name: { type: "string" },
              },
            },
          },
        },
        Announcement: {
          type: "object",
          required: [
            "id",
            "title",
            "body",
            "author",
            "authorId",
            "pinned",
            "createdAt",
            "updatedAt",
          ],
          properties: {
            id: { type: "string" },
            title: { type: "string" },
            body: { type: "string" },
            author: { type: "string" },
            authorId: { type: "string" },
            pinned: { type: "boolean" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        AnnouncementResponse: {
          type: "object",
          required: ["announcement"],
          properties: {
            announcement: { $ref: "#/components/schemas/Announcement" },
          },
        },
        AnnouncementsResponse: {
          type: "object",
          required: ["announcements"],
          properties: {
            announcements: {
              type: "array",
              items: { $ref: "#/components/schemas/Announcement" },
            },
          },
        },
        ValidationError: {
          type: "object",
          required: ["message", "errors"],
          properties: {
            message: { type: "string", example: "Validation failed" },
            errors: {
              type: "object",
              additionalProperties: {
                type: "array",
                items: { type: "string" },
              },
              example: {
                email: ["Invalid email address"],
                password: ["Password must be at least 6 characters"],
              },
            },
          },
        },
        ErrorResponse: {
          type: "object",
          required: ["message"],
          properties: {
            message: { type: "string" },
          },
        },
      },
    },
  },
  apis: [path.join(srcDir, "**/*.ts"), path.join(srcDir, "**/*.js")],
}

export const swaggerSpec = swaggerJsdoc(options)
