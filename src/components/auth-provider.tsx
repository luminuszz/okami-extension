import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react'

import { getTokensByExtensionStorage } from '@/lib/storage'

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

export function AuthProvider({ children }: AuthProviderProps) {
  const [token, setToken] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const isLogged = !!token

  useEffect(() => {
    setIsLoading(true)

    getTokensByExtensionStorage()
      .then(({ token, refreshToken }) => {
        const canSetToken = token && refreshToken

        setToken(canSetToken ? token : '')
      })
      .catch(() => {
        setToken('')
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [])

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
