import axios, { AxiosError } from 'axios'

import { refreshTokenCall } from '@/api/refresh-token'
import { eventBridge } from '@/lib/events.ts'
import {
  deleteTokensFromStorage,
  getTokensByExtensionStorage,
  setJwtTokenInStorage,
} from '@/lib/storage.ts'

export const okamiHttpGateway = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
})

okamiHttpGateway.interceptors.request.use((req) => {
  const { token } = getTokensByExtensionStorage()

  if (req.headers && token) {
    req.headers.Authorization = `Bearer ${token}`
  }

  return req
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
  return isUnauthorizedError(error)
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
            setJwtTokenInStorage(token)
            okamiHttpGateway.defaults.headers.Authorization = `Bearer ${token}`

            failRequestQueue.forEach((request) => {
              request.onSuccess(token)
            })
          })
          .catch((error) => {
            deleteTokensFromStorage()

            failRequestQueue.forEach((request) => {
              request.onFailure(error)
            })

            eventBridge.emit('user.isUnauthenticated')
          })
          .finally(() => {
            isRefreshing = false
            failRequestQueue = []
          })
      }
    } else {
      return Promise.reject(exception)
    }

    return new Promise((resolve, reject) => {
      failRequestQueue.push({
        onFailure: (error) => reject(error),
        onSuccess: async (token) => {
          if (!exception.config?.headers) return

          exception.config.headers.Authorization = `Bearer ${token}`

          return resolve(okamiHttpGateway(exception.config))
        },
      })
    })
  },
)
