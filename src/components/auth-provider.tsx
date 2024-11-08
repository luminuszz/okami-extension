import { AxiosError } from 'axios'
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react'

import { refreshTokenCall } from '@/api/refresh-token'
import { isUnauthorizedError, okamiHttpGateway } from '@/lib/axios'

interface AuthContextProps {
  token: string
  setToken: (token: string) => void
  isLogged: boolean
  isLoading: boolean
}

const AuthContext = createContext({} as AuthContextProps)

interface AuthProviderProps {
  children: ReactNode
}

let isRefreshing = false

type FailRequestQueue = {
  onSuccess: (newToken: string) => void
  onFailure: (error: AxiosError) => void
}[]

const failRequestQueue: FailRequestQueue = []

export function AuthProvider({ children }: AuthProviderProps) {
  const [token, setToken] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [refreshToken, setRefreshToken] = useState('')

  const isLogged = !!token

  useEffect(() => {
    setIsLoading(true)
    chrome.storage.local.get('token', ({ token, refreshToken }) => {
      setToken(token)
      setRefreshToken(refreshToken)
      setIsLoading(false)
    })
  }, [])

  useEffect(() => {
    const interceptorId = okamiHttpGateway.interceptors.response.use(
      (response) => response,
      (exception: AxiosError) => {
        if (isUnauthorizedError(exception) && refreshToken) {
          if (!isRefreshing) {
            isRefreshing = true

            refreshTokenCall(refreshToken)
              .then(({ token }) => {
                failRequestQueue.forEach((request) => {
                  request.onSuccess(token)
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
          }

          return new Promise((resolve, reject) => {
            failRequestQueue.push({
              onFailure: (error) => reject(error),
              onSuccess: (token: string) => {
                if (!exception.config?.headers) return

                exception.config.headers.Authorization = `Bearer ${token}`

                resolve(okamiHttpGateway(exception.config))
              },
            })
          })
        }

        return Promise.reject(exception)
      },
    )

    return () => {
      okamiHttpGateway.interceptors.response.eject(interceptorId)
    }
  }, [refreshToken, setToken])

  return (
    <AuthContext.Provider value={{ token, setToken, isLogged, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return context
}
