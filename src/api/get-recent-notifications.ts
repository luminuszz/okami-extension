import {useQuery} from '@tanstack/react-query'
import {z} from 'zod'

import {okamiHttpGateway} from '@/lib/axios'

export const notificationSchema = z.object({
  content: z.object({
    chapter: z.number(),
    imageUrl: z.string(),
    message: z.string(),
    name: z.string(),
    url: z.string(),
    nextChapter: z.number(),
    workId: z.string().optional(),
  }),
  createdAt: z.string(),
  id: z.string(),
  readAt: z.string().nullable(),
})

export type NotificationType = z.infer<typeof notificationSchema>

const responseSchema = z.array(notificationSchema)

export async function getRecentNotifications() {
  const response = await okamiHttpGateway.get('notification/recent')

  return responseSchema.parse(response.data)
}

export const getRecentNotificationsQueryKey = () => ['recentNotifications']

export function useGetRecentNotifications() {
  const queryKey = getRecentNotificationsQueryKey()

  const { data: notifications, isPending: isLoading } = useQuery({
    queryKey,
    queryFn: getRecentNotifications,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  return {
    notifications,
    isLoading,
  }
}
