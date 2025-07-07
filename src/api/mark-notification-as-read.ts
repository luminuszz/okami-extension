import { useMutation } from '@tanstack/react-query'
import { find } from 'lodash'
import { useCallback } from 'react'

import { useGetRecentNotifications } from '@/api/get-recent-notifications.ts'
import { okamiHttpGateway } from '@/lib/axios'

export async function markNotificationAsRead(notificationId: string) {
  await okamiHttpGateway.post(`/notification/mark-read/${notificationId}`)
}

export function useMarkNotificationAsRead() {
  const { notifications } = useGetRecentNotifications()

  const { mutate } = useMutation({
    mutationKey: ['markNotificationAsRead'],
    mutationFn: markNotificationAsRead,
    onSuccess() {
      console.log('Notification marked as read')
    },
    onError(error) {
      console.log('Error marking notification as read', error)
    },
  })

  const markAsRead = useCallback(
    (workId: string) => {
      const notification = find(
        notifications,
        ({ content }) => content.workId === workId,
      )

      if (!notification) return

      mutate(notification.id)
    },
    [mutate, notifications],
  )

  return {
    markAsRead,
  }
}
