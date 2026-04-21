import { api } from "@/lib/axios"
import { useQuery } from "@tanstack/react-query"
import { announcementKeys } from "../queryKeys"
import type { Announcement } from "../types"

export function useMyAnnouncements() {
  return useQuery({
    queryKey: announcementKeys.mine,
    queryFn: async () => {
      const { data } = await api.get<{ announcements: Announcement[] }>(
        "/announcements/my-announcements"
      )
      return data.announcements
    },
  })
}
