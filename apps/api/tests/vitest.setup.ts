// Load root .env before any test code imports Prisma or env.ts.
import path from "node:path"
import { fileURLToPath } from "node:url"
import { config as loadEnv } from "dotenv"

const here = path.dirname(fileURLToPath(import.meta.url))
loadEnv({ path: path.resolve(here, "../../../.env") })
