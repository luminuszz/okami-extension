import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'

import { createSession } from '@/api/create-session'
import { eventBridge } from '@/lib/events'
import { getTokensByExtensionStorage } from '@/lib/storage'

export interface MarkLoginInput {
  email: string
  password: string
}

interface AuthContextProps {
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
  const [isLoading, setIsLoading] = useState(false)
  const [isLogged, setIsLogged] = useState(false)

  useEffect(() => {
    setIsLoading(true)

    const { refreshToken } = getTokensByExtensionStorage()

    setIsLogged(!!refreshToken)

    setIsLoading(false)
  }, [])

  const makeLogin = useCallback(
    async (values: MarkLoginInput) => {
      try {
        setIsLoading(true)

        await createSession({
          email: values.email,
          password: values.password,
        })

        setIsLogged(true)
      } catch (e) {
        console.log({ e })

        alert('Erro ao fazer login')
      } finally {
        setIsLoading(false)
      }
    },

    [setIsLoading, setIsLogged],
  )

  useEffect(() => {
    const unsubscribe = eventBridge.subscribe('user.isUnauthenticated', () => {
      setIsLogged(false)
    })

    return () => {
      unsubscribe()
    }
  }, [])

  return (
    <AuthContext.Provider
      value={{ isLogged, isLoading, setIsLogged, makeLogin }}
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
