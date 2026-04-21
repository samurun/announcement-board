import { api } from "@/lib/axios"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { announcementKeys } from "../queryKeys"

export function useDeleteAnnouncement() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/announcements/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: announcementKeys.all })
      queryClient.invalidateQueries({ queryKey: announcementKeys.mine })
    },
  })
}
