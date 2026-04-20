import path from "node:path"
import { fileURLToPath } from "node:url"
import { config as loadEnv } from "dotenv"
import { z } from "zod"

// Load the monorepo root .env when running locally (not in Docker, where envs
// are injected by compose). Harmless if the file is missing — compose already
// sets everything via `environment:` or `env_file:`.
const here = path.dirname(fileURLToPath(import.meta.url))
loadEnv({ path: path.resolve(here, "../../../.env") })

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(16, "JWT_SECRET must be at least 16 chars"),
  JWT_EXPIRES_IN: z.coerce.number().int().positive().default(3600),
  API_PORT: z.coerce.number().int().positive().default(4000),
  CORS_ORIGIN: z.string().url().default("http://localhost:3000"),
})

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  console.error(
    "❌ Invalid environment variables:",
    parsed.error.flatten().fieldErrors
  )
  process.exit(1)
}

export const env = parsed.data
