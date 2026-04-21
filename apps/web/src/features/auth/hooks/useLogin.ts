import { useMutation } from "@tanstack/react-query"
import { loginRequest, type AuthResponse } from "../api"
import { useAuth } from "./useAuth"

export function useLogin() {
  const { setSession } = useAuth()
  return useMutation({
    mutationFn: loginRequest,
    onSuccess: (data: AuthResponse) => {
      setSession(data.token, data.user)
    },
  })
}
