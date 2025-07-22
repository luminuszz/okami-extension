import {useQuery} from '@tanstack/react-query'
import {z} from 'zod'

import {okamiHttpGateway} from '@/lib/axios'
import {localStorageKeys} from '@/lib/storage.ts'

const fetchWorksWithFilterSchema = z.object({
  status: z.enum(['unread', 'read', 'dropped', 'finished']).nullable(),
  search: z.string().optional().nullable(),
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
  alternativeName: z.string().optional().nullable(),
})

const fetchWorksWithFilterOutputSchema = z.array(workSchema)

export type WorkType = z.infer<typeof workSchema>

export async function fetchWorksWithFilter(filter?: FetchWorksWithFilterInput) {
  const { data } = await okamiHttpGateway.get<WorkType[]>('/work/list', {
    params: filter,
  })

  return fetchWorksWithFilterOutputSchema.parse(data)
}

export const getFetchWorksWithFilterQueryKey = (filter?: FetchWorksWithFilterInput) =>
  filter ? ['worksWithFilter', filter] : ['worksWithFilter']

export function useFetchWorksWithFilter(filter?: FetchWorksWithFilterInput) {
  const {
    data: works = [],
    isPending,
    isLoading,
    refetch,
  } = useQuery({
    queryFn: () => fetchWorksWithFilter(filter),
    queryKey: getFetchWorksWithFilterQueryKey(filter),
    placeholderData: () => {
      const cache = localStorage.getItem(localStorageKeys.worksOnGoingCache)

      return cache ? (JSON.parse(cache) as WorkType[]) : []
    },
    select: (data) => {
      localStorage.setItem(localStorageKeys.worksOnGoingCache, JSON.stringify(data))

      return data?.filter((work) => !work.isFinished)
    },
  })

  return {
    works,
    isLoading: isLoading || isPending,
    refetch,
  }
}
