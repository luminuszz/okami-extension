import { createContext, useContext, useEffect, useState } from 'react'

import { isUnauthorizedError, okamiHttpGateway } from '@/lib/axios'

interface AuthContextProps {
  token: string
  setToken: (token: string) => void
  isLogged: boolean
  isLoading: boolean
}

const AuthContext = createContext({} as AuthContextProps)

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [token, setToken] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const isLogged = !!token

  useEffect(() => {
    setIsLoading(true)
    chrome.storage.local.get('token', ({ token }) => {
      setToken(token)
      setIsLoading(false)
    })
  }, [])

  useEffect(() => {
    const interceptorId = okamiHttpGateway.interceptors.response.use(
      (response) => response,
      (error) => {
        const canRedirectToLogin = isUnauthorizedError(error)

        if (canRedirectToLogin) {
          setToken('')
        }

        return Promise.reject(error)
      },
    )

    return () => {
      okamiHttpGateway.interceptors.response.eject(interceptorId)
    }
  }, [setToken])

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
