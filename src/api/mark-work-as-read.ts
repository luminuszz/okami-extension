import {getFetchWorksWithFilterQueryKey, type WorkType} from '@/api/fetch-for-works-with-filter.ts'
import {useMarkNotificationAsRead} from '@/api/mark-notification-as-read.ts'
import {useUpdateQueryCache} from '@/hooks/useUpdateQueryCache.ts'
import {okamiHttpGateway} from '@/lib/axios'
import {useMutation, useQueryClient} from '@tanstack/react-query'
import {z} from 'zod'

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

const workListQueryKey = getFetchWorksWithFilterQueryKey()

export function useMarkWorkAsRead() {
  const { markAsRead: markNotificationAsRead } = useMarkNotificationAsRead()

  const updateQueryCache = useUpdateQueryCache<WorkType[]>(getFetchWorksWithFilterQueryKey())
  const client = useQueryClient()

  const { mutateAsync, isPending } = useMutation({
    mutationKey: ['markWorkAsRead'],
    mutationFn: markWorkAsRead,
    retry: 3,
    onMutate({ chapter, workId }) {
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
    onSuccess(_, { workId }) {
      void client.invalidateQueries({ queryKey: workListQueryKey })
      markNotificationAsRead(workId)
    },
  })

  return {
    isPending,
    markWorkAsRead: mutateAsync,
  }
}
