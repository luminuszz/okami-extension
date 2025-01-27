import axios, { AxiosError } from 'axios'

import { refreshTokenCall } from '@/api/refresh-token'
import {
  deleteTokensFromStorage,
  getTokensByExtensionStorage,
} from '@/lib/storage.ts'

import { eventBridge } from './events'

export const okamiHttpGateway = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
})

let isRefreshing = false

type FailRequestQueue = {
  onSuccess: (newToken: string) => void
  onFailure: (error: AxiosError) => void
}[]

let failRequestQueue: FailRequestQueue = []

export const isUnauthorizedError = (error: AxiosError): boolean =>
  [401, 403].includes(error.response?.status || 0)

export const isExpiredTokenError = (
  error: AxiosError<{ message: string }>,
): boolean => {
  console.log(error.response?.data)

  return (
    isUnauthorizedError(error) &&
    error.response?.data?.message === 'token expired'
  )
}

okamiHttpGateway.interceptors.response.use(
  (response) => response,
  (exception: AxiosError<{ message: string }>) => {
    if (isExpiredTokenError(exception)) {
      const { refreshToken } = getTokensByExtensionStorage()

      const canStartRefreshTokenFlow = refreshToken && !isRefreshing

      if (canStartRefreshTokenFlow) {
        isRefreshing = true

        refreshTokenCall(refreshToken)
          .then(({ token }) => {
            failRequestQueue.forEach((request) => {
              request.onSuccess(token)
            })
          })
          .catch((error) => {
            deleteTokensFromStorage()

            failRequestQueue.forEach((request) => {
              request.onFailure(error)
            })
          })
          .finally(() => {
            isRefreshing = false
            failRequestQueue = []
          })
      }
    } else {
      eventBridge.emit('user.isUnauthenticated')

      return Promise.reject(exception)
    }

    return new Promise((resolve, reject) => {
      failRequestQueue.push({
        onFailure: (error) => reject(error),
        onSuccess: async () => {
          if (!exception.config?.headers) return

          return resolve(okamiHttpGateway(exception.config))
        },
      })
    })
  },
)
