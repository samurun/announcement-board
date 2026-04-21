import express from "express"
import type { Express } from "express"
import cors from "cors"
import swaggerUi from "swagger-ui-express"
import { env } from "./env.js"
import { swaggerSpec } from "./docs/swagger.js"
import { errorHandler } from "./middleware/error-handler.js"
import { systemRoutes } from "./modules/system/system.routes.js"
import { authRoutes } from "./modules/auth/router.js"

export function buildApp(): Express {
  const app = express()

  app.use(express.json())
  app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }))

  // Swagger UI + raw spec
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec))
  app.get("/docs.json", (_req, res) => {
    res.json(swaggerSpec)
  })

  // Routes
  app.use("/", systemRoutes)
  app.use("/auth", authRoutes)

  // Error handling
  app.use(errorHandler)

  return app
}
