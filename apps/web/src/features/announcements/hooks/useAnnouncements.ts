import { api } from "@/lib/axios"
import { useQuery } from "@tanstack/react-query"
import { announcementKeys } from "../queryKeys"
import type { Announcement } from "../types"

export function useAnnouncements() {
  return useQuery({
    queryKey: announcementKeys.all,
    queryFn: async () => {
      const { data } = await api.get<{ announcements: Announcement[] }>(
        "/announcements"
      )
      return data.announcements
    },
  })
}
