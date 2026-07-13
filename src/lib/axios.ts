import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'

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

// Bare instance used only by refreshTokenCall. It must NOT carry the response
// interceptor below: a 401 on the refresh call itself would re-enter it and
// deadlock the queue (the refresh promise would queue on its own result).
export const okamiRefreshGateway = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
})

type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean }

okamiHttpGateway.interceptors.request.use((req) => {
  const { token } = getTokensByExtensionStorage()

  if (req.headers && token) {
    req.headers.Authorization = `Bearer ${token}`
  }

  return req
})

// 403 means "authenticated but not allowed" — refreshing the token cannot fix
// it, and retrying would loop. Only 401 is a token problem.
export const isUnauthorizedError = (error: AxiosError): boolean =>
  error.response?.status === 401

let isRefreshing = false

type FailRequestQueue = {
  onSuccess: (newToken: string) => void
  onFailure: (error: AxiosError) => void
}[]

let failRequestQueue: FailRequestQueue = []

function endSession(error: AxiosError) {
  const queue = failRequestQueue

  failRequestQueue = []
  isRefreshing = false

  deleteTokensFromStorage()
  queue.forEach((request) => request.onFailure(error))
  eventBridge.emit('user.isUnauthenticated')
}

okamiHttpGateway.interceptors.response.use(
  (response) => response,
  (exception: AxiosError<{ message: string }>) => {
    const originalRequest = exception.config as RetriableConfig | undefined

    if (!isUnauthorizedError(exception) || !originalRequest) {
      return Promise.reject(exception)
    }

    // Already replayed once with a fresh token and still 401 -> the session is
    // dead. Without this the retry would trigger another refresh, forever.
    if (originalRequest._retry) {
      endSession(exception)
      return Promise.reject(exception)
    }

    const { refreshToken } = getTokensByExtensionStorage()

    if (!refreshToken) {
      endSession(exception)
      return Promise.reject(exception)
    }

    const retryOriginalRequest = new Promise((resolve, reject) => {
      failRequestQueue.push({
        onSuccess: (token) => {
          originalRequest._retry = true
          originalRequest.headers.Authorization = `Bearer ${token}`

          resolve(okamiHttpGateway(originalRequest))
        },
        onFailure: (error) => reject(error),
      })
    })

    if (!isRefreshing) {
      isRefreshing = true

      refreshTokenCall(refreshToken)
        .then(({ token }) => {
          setJwtTokenInStorage(token)

          const queue = failRequestQueue

          failRequestQueue = []
          isRefreshing = false

          queue.forEach((request) => request.onSuccess(token))
        })
        .catch(() => {
          endSession(exception)
        })
    }

    return retryOriginalRequest
  },
)
