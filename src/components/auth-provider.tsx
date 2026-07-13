import {createContext, ReactNode, useCallback, useContext, useEffect, useState} from 'react'

import {eventBridge} from '@/lib/events'
import {queryClient, queryClientPersister} from '@/lib/react-query'
import {deleteTokensFromStorage, getTokenFormOkamiIntegrationStorage, getTokensByExtensionStorage, localStorageKeys, setTokensInStorage,} from '@/lib/storage'

interface AuthContextProps {
  isLogged: boolean
  isLoading: boolean
  setIsLogged: (isLogged: boolean) => void
  logout: () => Promise<void>
  checksTokenFromChromeStorage: () => Promise<void>
}

const AuthContext = createContext({} as AuthContextProps)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isLogged, setIsLogged] = useState(false)

  const checksTokenFromChromeStorage = useCallback(async () => {
    try {
      setIsLoading(true)

      const { refreshToken } = getTokensByExtensionStorage()

      if (refreshToken) {
        setIsLogged(true)
        return
      }

      const refreshTokenFromStorage = await getTokenFormOkamiIntegrationStorage()

      if (refreshTokenFromStorage) {
        setTokensInStorage(refreshTokenFromStorage)
        setIsLogged(true)
      }
    } catch {
      setIsLogged(false)
    } finally {
      setIsLoading(false)
    }
  }, [setIsLoading, setIsLogged])

  // The cache is persisted to localStorage, so it has to be dropped too —
  // otherwise the next account to open the popup sees the previous one's works.
  const logout = useCallback(async () => {
    deleteTokensFromStorage()
    setIsLogged(false)

    queryClient.clear()
    await queryClientPersister.removeClient()
  }, [setIsLogged])

  useEffect(() => {
    const unsubscribe = eventBridge.subscribe('user.isUnauthenticated', () => {
      setIsLogged(false)
    })

    return () => {
      unsubscribe()
    }
  }, [])

  // Content script writes the token to chrome.storage.local from the web page;
  // react to it so an already-open popup logs in without being reopened.
  useEffect(() => {
    const onChanged = (
      changes: { [key: string]: chrome.storage.StorageChange },
      areaName: string,
    ) => {
      if (areaName === 'local' && changes[localStorageKeys.refreshToken]) {
        checksTokenFromChromeStorage()
      }
    }

    chrome.storage.onChanged.addListener(onChanged)

    return () => {
      chrome.storage.onChanged.removeListener(onChanged)
    }
  }, [checksTokenFromChromeStorage])

  return (
    <AuthContext.Provider
      value={{
        isLogged,
        isLoading,
        setIsLogged,
        logout,
        checksTokenFromChromeStorage,
      }}
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
