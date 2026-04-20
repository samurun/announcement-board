import { env } from "./env.js"
import { buildApp } from "./app.js"

const app = buildApp()

app.listen(env.API_PORT, () => {
  console.log(`API server listening on http://localhost:${env.API_PORT}`)
  console.log(`Docs available at http://localhost:${env.API_PORT}/docs`)
})
