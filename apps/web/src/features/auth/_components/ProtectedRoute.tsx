import type { ReactNode } from "react"
import { Navigate } from "react-router"
import { useAuth } from "../hooks/useAuth"
import { LoaderIcon } from "lucide-react"

interface ProtectedRouteProps {
  children: ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth()

  if (isLoading)
    return (
      <div className="grid h-svh place-content-center">
        <LoaderIcon className="animate-spin" />
      </div>
    )

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
