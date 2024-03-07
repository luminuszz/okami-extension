import { z } from 'zod'

import { okamiHttpGateway } from '@/lib/axios'

const fetchWorksWithFilterSchema = z.object({
  status: z.enum(['unread', 'read', 'dropped', 'finished']).nullable(),
})

type FetchWorksWithFilterInput = z.infer<typeof fetchWorksWithFilterSchema>

export type FilterStatus = FetchWorksWithFilterInput['status']

export const workSchema = z.object({
  id: z.string(),
  name: z.string(),
  url: z.string(),
  hasNewChapter: z.boolean(),
  chapter: z.number(),
  isFinished: z.boolean(),
  imageId: z.string().nullable(),
  imageUrl: z.string().nullable(),
  updatedAt: z.string().nullable(),
  category: z.enum(['ANIME', 'MANGA']),
  nextChapterUpdatedAt: z.string().nullable(),
  nextChapter: z.number().nullable(),
  isDropped: z.boolean(),
  createdAt: z.string(),
})

const fetchWorksWithFilterOutputSchema = z.array(workSchema)

export type WorkType = z.infer<typeof workSchema>

export async function fetchWorksWithFilter(filter?: FetchWorksWithFilterInput) {
  const { data } = await okamiHttpGateway.get('/work/list', {
    params: filter,
  })

  return fetchWorksWithFilterOutputSchema.parse(data)
}
