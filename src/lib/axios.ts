import axios, { AxiosError } from 'axios'

export const okamiHttpGateway = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
})

export const isUnauthorizedError = (error: AxiosError): boolean =>
  [401, 403].includes(error.response?.status || 0)
