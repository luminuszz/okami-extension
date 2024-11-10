import { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios'

import { refreshTokenCall } from '@/api/refresh-token'

import { isUnauthorizedError, okamiHttpGateway } from './axios'
import { getTokensByExtensionStorage } from './storage'

let isRefreshing = false

export type FailRequestQueue = Array<{
  onSuccess: (newToken: string) => void
  onFailure: (error: AxiosError) => void
  id: string
}>

const failRequestQueue: FailRequestQueue = []

export const injectAuthTokenRequestInterceptor = {
  async onRequest(requestConfig: InternalAxiosRequestConfig) {
    const { token } = await getTokensByExtensionStorage()

    console.log('toke from request', token)

    if (token) {
      requestConfig.headers.Authorization = `Bearer ${token}`
    }

    return requestConfig
  },

  onError(error: unknown) {
    return Promise.reject(error)
  },
}

export const refreshTokenResponseInterceptor = {
  onResponse(response: AxiosResponse) {
    return response
  },

  async onError(exception: AxiosError) {
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
          request.onSuccess(token)
          chrome.storage.local.set({ token })
        })
      })
      .catch((error) => {
        failRequestQueue.forEach((request) => {
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
}
