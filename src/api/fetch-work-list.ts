import { okamiHttpGateway } from '@/lib/axios.ts'
import { useQuery } from '@tanstack/react-query'
import { z } from 'zod'

const workForExtensionSchema = z.object({
  id: z.string(),
  name: z.string(),
  imageId: z.string().nullable(),
  chapter: z.number(),
  nextChapter: z.number().nullable(),
  hasNewChapter: z.boolean(),
  createdAt: z.coerce.date(),
  category: z.string(),
  alternativeName: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  slug: z.string(),
})

const workListSchema = z.array(workForExtensionSchema)

export type WorkForExtensionType = z.infer<typeof workForExtensionSchema>

export async function fetchWorkList() {
  const { data } = await okamiHttpGateway.get<WorkForExtensionType[]>('/work/list/extension')

  return workListSchema.parse(data)
}

export const getFetchWorkListQueryKey = () => ['workList']

export function useFetchWorkList() {
  const query = useQuery({
    queryFn: fetchWorkList,
    queryKey: getFetchWorkListQueryKey(),
  })

  return {
    ...query,
    data: query.data ?? [],
    isLoading: query.isLoading || query.isPending,
  }
}
