import { useMutation } from '@tanstack/react-query'
import { z } from 'zod'

import { useMarkNotificationAsRead } from '@/api/mark-notification-as-read.ts'
import { okamiHttpGateway } from '@/lib/axios'

const markWorkAsReadInputSchema = z.object({
  workId: z.string(),
  chapter: z.number(),
})

type MarkWorkAsReadInput = z.infer<typeof markWorkAsReadInputSchema>

export async function markWorkAsRead(params: MarkWorkAsReadInput) {
  const { chapter, workId } = markWorkAsReadInputSchema.parse(params)

  await okamiHttpGateway.patch(`/work/${workId}/update-chapter`, {
    chapter,
  })
}

export function useMarkWorkAsRead() {
  const { markAsRead } = useMarkNotificationAsRead()

  const { mutateAsync, isPending } = useMutation({
    mutationKey: ['markWorkAsRead'],
    mutationFn: markWorkAsRead,
    retry: 3,
    onSuccess(_, { workId }) {
      markAsRead(workId)
    },
  })

  return {
    isPending,
    markWorkAsRead: mutateAsync,
  }
}
