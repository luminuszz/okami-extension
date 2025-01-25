import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'

import { createSession } from '@/api/create-session'
import { eventBridge } from '@/lib/events.ts'
import {
  deleteTokensFromStorage,
  getTokensByExtensionStorage,
  setTokensInStorage,
} from '@/lib/storage'

export interface MarkLoginInput {
  email: string
  password: string
}

interface AuthContextProps {
  token: string
  setToken: (token: string) => void
  isLogged: boolean
  isLoading: boolean
  setIsLogged: (isLogged: boolean) => void
  makeLogin: (values: MarkLoginInput) => void
}

const AuthContext = createContext({} as AuthContextProps)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [token, setToken] = useState('')
  const [refreshToken, setRefreshToken] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isLogged, setIsLogged] = useState(!!refreshToken)

  useEffect(() => {
    setIsLoading(true)
    getTokensByExtensionStorage()
      .then(({ token, refreshToken }) => {
        console.log({ token, refreshToken })

        setToken(token)
        setRefreshToken(refreshToken)

        setIsLogged(true)
      })
      .catch(() => {
        setToken('')
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [])

  useEffect(() => {
    const unsubscribe = eventBridge.subscribe('user.isUnauthenticated', () => {
      deleteTokensFromStorage()
      setToken('')
    })

    return () => {
      unsubscribe()
    }
  }, [])

  const makeLogin = useCallback(async (values: MarkLoginInput) => {
    try {
      setIsLoading(true)

      const { refreshToken, token } = await createSession({
        email: values.email,
        password: values.password,
      })

      await setTokensInStorage(token, refreshToken)

      setRefreshToken(refreshToken)
      setToken(token)

      setIsLogged(true)
    } catch {
      alert('Erro ao fazer login')
    } finally {
      setIsLoading(false)
    }
  }, [])

  return (
    <AuthContext.Provider
      value={{ token, setToken, isLogged, isLoading, setIsLogged, makeLogin }}
    >
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
