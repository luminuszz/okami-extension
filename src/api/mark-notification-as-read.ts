import { okamiHttpGateway } from '@/lib/axios'

export async function markNotificationAsRead(notificationId: string) {
  await okamiHttpGateway.post(`/notification/mark-read/${notificationId}`)
}
