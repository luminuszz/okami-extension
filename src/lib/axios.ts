import axios, { AxiosError } from 'axios'

import { getTokensByExtensionStorage } from '@/lib/storage.ts'
import { refreshTokenCall } from '@/api/refresh-token.ts'
import { eventBridge } from '@/lib/events.ts'

export const okamiHttpGateway = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
})

let isRefreshing = false

export type FailRequestQueue = Array<{
  onSuccess: (newToken: string) => void
  onFailure: (error: AxiosError) => void
  id: string
}>

const failRequestQueue: FailRequestQueue = []


export const isUnauthorizedError = (error: AxiosError): boolean =>
  [401, 403].includes(error.response?.status || 0)


okamiHttpGateway.interceptors.request.use(
  async  requestConfig => {
    const { token } = await getTokensByExtensionStorage()

    eventBridge.emit("axios.makeRequest")

    if (token) {
      requestConfig.headers.Authorization = `Bearer ${token}`
    }

    return requestConfig
  },
  error => {
    return Promise.reject(error)
  }
)


okamiHttpGateway.interceptors.response.use(
  (response) => response,
  async (exception:AxiosError) => {
    const { refreshToken } = await getTokensByExtensionStorage()

    const canStartRefreshTokenFlow =
      isUnauthorizedError(exception) && refreshToken && !isRefreshing

    if (!canStartRefreshTokenFlow) {
      return Promise.reject(exception)
    }

    const callInAlreadyInQueue = failRequestQueue.find(
      (item) => item.id === exception.config?.url,
    )

    if (callInAlreadyInQueue) {
      return Promise.reject(exception)
    }

    isRefreshing = true

    refreshTokenCall(refreshToken)
      .then(({ token }) => {
        failRequestQueue.forEach((request) => {
          chrome.storage.local.set({ token })
          request.onSuccess(token)
        })
      })
      .catch((error) => {
        failRequestQueue.forEach((request) => {
          eventBridge.emit("user.isUnauthenticated")
          request.onFailure(error)
        })
      })
      .finally(() => {
        isRefreshing = false
      })

    return new Promise((resolve, reject) => {
      failRequestQueue.push({
        id: exception.config?.url || '',
        onFailure: (error) => reject(error),
        onSuccess: async (token: string) => {
          if (!exception.config?.headers) return

          exception.config.headers.Authorization = `Bearer ${token}`

          resolve(okamiHttpGateway(exception.config))
        },
      })
    })
  },
)
