import { api } from "@/lib/axios"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { announcementKeys } from "../queryKeys"
import type { UpdateAnnouncementInput } from "../schemas"
import type { Announcement } from "../types"

interface UpdatePayload extends UpdateAnnouncementInput {
  id: string
}

export function useUpdateAnnouncement() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...body }: UpdatePayload) => {
      const { data } = await api.put<{ announcement: Announcement }>(
        `/announcements/${id}`,
        body
      )
      return data.announcement
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: announcementKeys.all })
      queryClient.invalidateQueries({ queryKey: announcementKeys.mine })
    },
  })
}
