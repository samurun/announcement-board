import { useQuery } from "@tanstack/react-query"
import { getMe } from "../api"
import { TOKEN_KEY, authKeys } from "./keys"

export function useMe() {
  const hasToken =
    typeof window !== "undefined" && !!localStorage.getItem(TOKEN_KEY)
  return useQuery({
    queryKey: authKeys.me,
    queryFn: getMe,
    enabled: hasToken,
    staleTime: 5 * 60 * 1000,
    retry: false,
  })
}
