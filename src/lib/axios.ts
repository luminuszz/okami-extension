import axios, { AxiosError } from 'axios'

import { refreshTokenCall } from '@/api/refresh-token.ts'
import { eventBridge } from '@/lib/events.ts'
import {
  deleteTokensFromStorage,
  getTokensByExtensionStorage,
} from '@/lib/storage.ts'

export const okamiHttpGateway = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
})

let isRefreshing = false

type FailRequestQueue = {
  onSuccess: (newToken: string) => void
  onFailure: (error: AxiosError) => void
}[]

let failRequestQueue: FailRequestQueue = []

export const isUnauthorizedError = (error: AxiosError): boolean =>
  [401, 403].includes(error.response?.status || 0)

export const isExpiredTokenError = (error: AxiosError): boolean => {
  return isUnauthorizedError(error) && error.message === 'token expired'
}

okamiHttpGateway.interceptors.request.use(
  async (requestConfig) => {
    const { token } = await getTokensByExtensionStorage()

    eventBridge.emit('axios.makeRequest')

    if (token) {
      requestConfig.headers.Authorization = `Bearer ${token}`
    }

    return requestConfig
  },
  (error) => {
    return Promise.reject(error)
  },
)

okamiHttpGateway.interceptors.response.use(
  (response) => response,
  async (exception: AxiosError) => {
    if (isExpiredTokenError(exception)) {
      getTokensByExtensionStorage().then(({ refreshToken }) => {
        const canStartRefreshTokenFlow = refreshToken && !isRefreshing

        if (canStartRefreshTokenFlow) {
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
                eventBridge.emit('user.isUnauthenticated')
                deleteTokensFromStorage()
                request.onFailure(error)
              })
            })
            .finally(() => {
              isRefreshing = false
              failRequestQueue = []
            })
        }
      })
    }

    return new Promise((resolve, reject) => {
      failRequestQueue.push({
        onFailure: (error) => reject(error),
        onSuccess: async (token: string) => {
          if (!exception.config?.headers) return

          exception.config.headers.Authorization = `Bearer ${token}`

          return resolve(okamiHttpGateway(exception.config))
        },
      })
    })
  },
)
