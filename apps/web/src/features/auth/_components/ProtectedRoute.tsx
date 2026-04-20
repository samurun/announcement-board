import type { ReactNode } from "react"
import { Navigate } from "react-router"
import { useAuth } from "../context/AuthContext.js"

interface ProtectedRouteProps {
  children: ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { token } = useAuth()

  if (!token) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
