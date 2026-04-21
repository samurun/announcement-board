import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { Pencil, Pin, Trash2 } from "lucide-react"
import { useState } from "react"
import { useAuth } from "../../auth/hooks/useAuth"
import { useDeleteAnnouncement } from "../hooks/useDeleteAnnouncement"
import { useUpdateAnnouncement } from "../hooks/useUpdateAnnouncement"
import type { Announcement } from "../types"
import { AnnouncementForm } from "./AnnouncementForm"

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
})

export function AnnouncementCard({
  announcement,
}: {
  announcement: Announcement
}) {
  const { user } = useAuth()
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const updateAnnouncement = useUpdateAnnouncement()
  const deleteAnnouncement = useDeleteAnnouncement()

  const canManage = user?.id === announcement.authorId

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{announcement.title}</CardTitle>
        <CardAction className="flex items-center gap-1">
          {announcement.pinned && (
            <Badge variant="secondary" className="shrink-0">
              <Pin className="mr-1 size-3" />
              Pinned
            </Badge>
          )}
          {canManage && (
            <>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Edit announcement"
                onClick={() => setIsEditOpen(true)}
              >
                <Pencil className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Delete announcement"
                onClick={() => setIsDeleteOpen(true)}
              >
                <Trash2 className="size-4 text-red-600" />
              </Button>
            </>
          )}
        </CardAction>
        <CardDescription>
          {announcement.author} ·{" "}
          {dateFormatter.format(new Date(announcement.createdAt))}
        </CardDescription>
      </CardHeader>
      <CardContent className="text-sm whitespace-pre-wrap">
        {announcement.body}
      </CardContent>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit announcement</DialogTitle>
          </DialogHeader>
          <AnnouncementForm
            formId={`edit-announcement-${announcement.id}`}
            defaultValues={{
              title: announcement.title,
              body: announcement.body,
              pinned: announcement.pinned,
            }}
            submitLabel="Save changes"
            isLoading={updateAnnouncement.isPending}
            onSubmit={(data) =>
              updateAnnouncement.mutate(
                { id: announcement.id, ...data },
                { onSuccess: () => setIsEditOpen(false) }
              )
            }
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete this announcement?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. &ldquo;{announcement.title}&rdquo;
              will be permanently removed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteOpen(false)}
              disabled={deleteAnnouncement.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={deleteAnnouncement.isPending}
              onClick={() =>
                deleteAnnouncement.mutate(announcement.id, {
                  onSuccess: () => setIsDeleteOpen(false),
                })
              }
            >
              {deleteAnnouncement.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
