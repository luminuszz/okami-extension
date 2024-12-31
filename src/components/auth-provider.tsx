import {
  createContext,
  ReactNode,
  useContext,
  useEffect, useMemo,
  useState,
} from 'react'

import { deleteTokensFromStorage, getTokensByExtensionStorage } from '@/lib/storage'
import { eventBridge } from '@/lib/events.ts'


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
  const [refreshToken, setRefreshToken] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const isLogged = useMemo(() =>  !!refreshToken , [refreshToken])

  useEffect(() => {
    setIsLoading(true)
    getTokensByExtensionStorage()
      .then(({ token, refreshToken }) => {
        setToken(token ?? "")
        setRefreshToken(refreshToken ?? "")
      })
      .catch(() => {
        setToken('')
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [])


  useEffect(() => {
  const unsubscribe =  eventBridge.subscribe("user.isUnauthenticated", () => {
    void deleteTokensFromStorage()
    setToken("");
    })


    return () => {
      unsubscribe()
    }
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
