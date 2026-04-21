import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter } from "react-router"

import "@workspace/ui/globals.css"
import { App } from "./App"
import { ThemeProvider } from "@/components/theme-provider.tsx"
import { hydrateAuthCache } from "./features/auth/hydrate"
import Providers from "./providers"

hydrateAuthCache()

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <Providers>
          <App />
        </Providers>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>
)
