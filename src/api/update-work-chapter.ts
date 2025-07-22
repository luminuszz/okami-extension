import {getFetchWorksWithFilterQueryKey, type WorkType} from '@/api/fetch-for-works-with-filter.ts'
import {useUpdateQueryCache} from '@/hooks/useUpdateQueryCache.ts'
import {okamiHttpGateway} from '@/lib/axios'
import {useMutation, useQueryClient} from '@tanstack/react-query'

interface UpdateWorkInput {
  workId: string
  chapter: number
}

export async function updateWorkChapterCall({ chapter, workId }: UpdateWorkInput) {
  await okamiHttpGateway.put(`/work/update-work/${workId}`, {
    chapter,
  })
}

const workListQueryKey = getFetchWorksWithFilterQueryKey()

export function useUpdateWorkChapter() {
  const updateQueryCache = useUpdateQueryCache<WorkType[]>(workListQueryKey)
  const client = useQueryClient()

  const { isPending, mutateAsync } = useMutation({
    mutationKey: ['updateWorkChapter'],
    mutationFn: updateWorkChapterCall,
    retry: 3,
    onMutate({ workId, chapter }) {
      void client.cancelQueries({ queryKey: workListQueryKey })
      return updateQueryCache(
        (cache) => {
          return cache?.map((item) =>
            item.id === workId ? { ...item, chapter, hasNewChapter: false } : item,
          )
        },
        { useImmer: false },
      )
    },
    onError(_, __, cache) {
      updateQueryCache(cache)
    },
    async onSuccess() {
      await client.invalidateQueries({ queryKey: workListQueryKey })
    },
  })

  return {
    isPending,
    updateWorkChapter: mutateAsync,
  }
}
