import { Button } from "@workspace/ui/components/button"
import { Link } from "react-router"
import { useAuth } from "../../auth/hooks/useAuth"
import { AnnouncementList } from "../../announcements/_components/AnnouncementList"
import { useAnnouncements } from "@/features/announcements/hooks/useAnnouncements"

export function BoardPage() {
  const { user, logout } = useAuth()
  const { data: announcements, isLoading, error } = useAnnouncements()

  return (
    <div className="min-h-svh bg-background p-4">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Board</h1>
            <p className="text-sm text-muted-foreground">
              Welcome, {user?.name}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link to="/announcements">My announcements</Link>
            </Button>
            <Button variant="outline" size="sm" onClick={logout}>
              Logout
            </Button>
          </div>
        </div>
        <AnnouncementList
          announcements={announcements}
          isLoading={isLoading}
          error={error}
        />
      </div>
    </div>
  )
}
