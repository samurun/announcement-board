import { useAuth } from "../../auth/context/AuthContext"
import { Button } from "@workspace/ui/components/button"

export function AnnouncementsPage() {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-svh bg-background p-4">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Announcements</h1>
            <p className="text-sm text-muted-foreground">
              Welcome, {user?.name}
            </p>
          </div>
          <Button variant="outline" onClick={logout}>
            Logout
          </Button>
        </div>
      </div>
    </div>
  )
}
