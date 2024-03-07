import { z } from 'zod'

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
