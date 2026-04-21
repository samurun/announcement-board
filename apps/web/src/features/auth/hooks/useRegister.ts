import { useMutation } from "@tanstack/react-query"
import { registerRequest, type AuthResponse } from "../api"
import { useAuth } from "./useAuth"

export function useRegister() {
  const { setSession } = useAuth()
  return useMutation({
    mutationFn: registerRequest,
    onSuccess: (data: AuthResponse) => {
      setSession(data.token, data.user)
    },
  })
}
