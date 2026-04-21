import { useQueryClient } from "@tanstack/react-query"
import { useCallback } from "react"
import type { User } from "../api"
import { TOKEN_KEY, USER_KEY, authKeys } from "./keys"
import { useMe } from "./useMe"

export function useAuth() {
  const queryClient = useQueryClient()
  const { data: user, isLoading, isFetching } = useMe()

  const setSession = useCallback(
    (token: string, nextUser: User) => {
      localStorage.setItem(TOKEN_KEY, token)
      localStorage.setItem(USER_KEY, JSON.stringify(nextUser))
      queryClient.setQueryData(authKeys.me, nextUser)
    },
    [queryClient]
  )

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    queryClient.removeQueries({ queryKey: authKeys.all })
  }, [queryClient])

  return { user: user ?? null, isLoading, isFetching, setSession, logout }
}
