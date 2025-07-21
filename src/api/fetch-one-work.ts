import type {WorkType} from '@/api/fetch-for-works-with-filter.ts'
import {okamiHttpGateway} from '@/lib/axios.ts'
import {useQuery} from '@tanstack/react-query'

export async function fetchOneWork(workId: string) {
  const results = await okamiHttpGateway.get<WorkType>(`/work/${workId}`)

  return results.data
}

export const getFetchOneWorkQueryKey = (workId: string) => ['work', workId]

export function useFetchOneWork(workId: string) {
  return useQuery({
    enabled: !!workId,
    queryFn: () => fetchOneWork(workId),
    queryKey: getFetchOneWorkQueryKey(workId),
  })
}
