import { api } from "@/lib/axios"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { announcementKeys } from "../queryKeys"
import type { CreateAnnouncementInput } from "../schemas"
import type { Announcement } from "../types"

export function useCreateAnnouncement() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: CreateAnnouncementInput) => {
      const { data } = await api.post<{ announcement: Announcement }>(
        "/announcements",
        payload
      )
      return data.announcement
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: announcementKeys.all })
      queryClient.invalidateQueries({ queryKey: announcementKeys.mine })
    },
  })
}
