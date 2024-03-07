import axios, { AxiosError } from 'axios'

export const okamiHttpGateway = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
})

const getToKenByExtensionStorage = async () => {
  return await new Promise((resolve) => {
    chrome.storage.local.get('token', ({ token }) => {
      resolve(token)
    })
  })
}

okamiHttpGateway.interceptors.request.use(
  async (requestConfig) => {
    const token = await getToKenByExtensionStorage()

    if (token) {
      requestConfig.headers.Authorization = `Bearer ${token}`
    }

    return requestConfig
  },
  (error) => Promise.reject(error),
)

export const isUnauthorizedError = (error: AxiosError): boolean =>
  [401, 403].includes(error.response?.status || 0)
