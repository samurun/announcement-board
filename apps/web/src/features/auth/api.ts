import { api } from "../../lib/axios"
import type { LoginInput, RegisterInput } from "./schemas"

export interface User {
  id: string
  email: string
  name: string
  createdAt: string
  updatedAt: string
}

export interface AuthResponse {
  user: User
  token: string
}

export const loginRequest = (input: LoginInput) =>
  api.post<AuthResponse>("/auth/login", input).then((r) => r.data)

export const registerRequest = (input: RegisterInput) =>
  api.post<AuthResponse>("/auth/register", input).then((r) => r.data)

export const getMe = () =>
  api.get<{ user: User }>("/auth/me").then((r) => r.data.user)
