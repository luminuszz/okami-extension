import { useEffect, useState } from 'react'
import { z } from 'zod'

import { okamiHttpGateway } from '@/lib/axios'

export const notificationSchema = z.object({
  content: z.object({
    chapter: z.number(),
    imageUrl: z.string(),
    message: z.string(),
    name: z.string(),
    url: z.string(),
    nextChapter: z.number(),
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

export function useGetRecentNotifications() {
  const [notifications, setNotifications] = useState<NotificationType[]>([])

  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    setIsLoading(true)
    getRecentNotifications()
      .then(setNotifications)
      .catch(console.error)
      .finally(() => setIsLoading(false))
  }, [])

  return {
    notifications,
    isLoading,
  }
}
