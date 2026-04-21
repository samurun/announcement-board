import { LoaderIcon } from "lucide-react"
import type { Announcement } from "../types"
import { AnnouncementCard } from "./AnnouncementCard"

interface AnnouncementListProps {
  announcements?: Announcement[]
  isLoading: boolean
  error: Error | null
  emptyMessage?: string
}

export function AnnouncementList({
  announcements,
  isLoading,
  error,
  emptyMessage = "No announcements yet.",
}: AnnouncementListProps) {
  if (isLoading) {
    return (
      <div className="grid place-content-center py-12">
        <LoaderIcon className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <div
        role="alert"
        className="rounded border border-red-200 bg-red-50 p-4 text-sm text-red-700"
      >
        Failed to load announcements. Try refreshing the page.
      </div>
    )
  }

  if (!announcements?.length) {
    return (
      <p className="py-12 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </p>
    )
  }

  return (
    <ul className="space-y-3">
      {announcements.map((announcement) => (
        <li key={announcement.id}>
          <AnnouncementCard announcement={announcement} />
        </li>
      ))}
    </ul>
  )
}
