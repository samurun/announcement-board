import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog"
import { useState } from "react"
import { Link } from "react-router"
import { useAuth } from "../../auth/hooks/useAuth"
import { AnnouncementForm } from "../_components/AnnouncementForm"
import { AnnouncementList } from "../_components/AnnouncementList"
import { useCreateAnnouncement } from "../hooks/useCreateAnnouncement"
import { useMyAnnouncements } from "../hooks/useMyAnnouncements"

export function AnnouncementsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { user, logout } = useAuth()
  const { data: myAnnouncements, isLoading, error } = useMyAnnouncements()
  const createAnnouncement = useCreateAnnouncement()

  return (
    <div className="min-h-svh p-4">
      <div className="mx-auto max-w-2xl space-y-4">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">My announcements</h1>
            <p className="text-sm text-muted-foreground">
              Posts by {user?.name}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link to="/">Board</Link>
            </Button>
            <Button variant="outline" size="sm" onClick={logout}>
              Logout
            </Button>
          </div>
        </div>
        <div className="flex items-center justify-end">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>Create Announcement</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Announcement</DialogTitle>
              </DialogHeader>
              <AnnouncementForm
                isLoading={createAnnouncement.isPending}
                onSubmit={(data) =>
                  createAnnouncement.mutate(data, {
                    onSuccess: () => setIsDialogOpen(false),
                  })
                }
              />
            </DialogContent>
          </Dialog>
        </div>
        <AnnouncementList
          announcements={myAnnouncements}
          isLoading={isLoading}
          error={error}
          emptyMessage="You haven't posted any announcements yet."
        />
      </div>
    </div>
  )
}
