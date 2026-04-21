import { queryClient } from "../../providers/QueryProvider"
import type { User } from "./api"
import { TOKEN_KEY, USER_KEY, authKeys } from "./hooks/keys"

export function hydrateAuthCache() {
  if (typeof window === "undefined") return
  if (!localStorage.getItem(TOKEN_KEY)) return

  const raw = localStorage.getItem(USER_KEY)
  if (!raw) return

  try {
    const user = JSON.parse(raw) as User
    queryClient.setQueryData(authKeys.me, user)
  } catch {
    localStorage.removeItem(USER_KEY)
  }
}
