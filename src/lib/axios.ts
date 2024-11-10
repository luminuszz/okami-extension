import axios, { AxiosError } from 'axios'

import {
  injectAuthTokenRequestInterceptor,
  refreshTokenResponseInterceptor,
} from './axios-interceptors'

export const okamiHttpGateway = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
})

okamiHttpGateway.interceptors.request.use(
  injectAuthTokenRequestInterceptor.onRequest,
  injectAuthTokenRequestInterceptor.onError,
)
okamiHttpGateway.interceptors.response.use(
  refreshTokenResponseInterceptor.onResponse,
  refreshTokenResponseInterceptor.onError,
)

export const isUnauthorizedError = (error: AxiosError): boolean =>
  [401, 403].includes(error.response?.status || 0)
