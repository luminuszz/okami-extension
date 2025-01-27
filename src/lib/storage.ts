export const useLocalStorage = <T>(
  keyName: keyof typeof localStorageTokens,
  initialValue: T,
) => {
  const key = localStorageTokens[keyName]

  const get = () => {
    const value = localStorage.getItem(key)
    if (value) {
      return JSON.parse(value) as T
    }
    return initialValue
  }

  const set = (value: T) => {
    localStorage.setItem(key, JSON.stringify(value))
  }

  const remove = () => {
    localStorage.removeItem(key)
  }

  return {
    get,
    set,
    remove,
  }
}

export const localStorageTokens = {
  token: 'okami-extension@authToken',
  refreshToken: 'okami-extension@refreshToken',
} as const

export interface GetTokensFromStorageResult {
  refreshToken: string | null
}

export const getTokensByExtensionStorage = (): GetTokensFromStorageResult => {
  return {
    refreshToken: localStorage.getItem(localStorageTokens.refreshToken) || null,
  }
}

export const deleteTokensFromStorage = () => {
  localStorage.removeItem(localStorageTokens.refreshToken)
}

export const setTokensInStorage = (refreshToken: string) => {
  localStorage.setItem(localStorageTokens.refreshToken, refreshToken)
}
