export const localStorageKeys = {
  token: 'okami-extension@authToken',
  refreshToken: 'okami-extension@refreshToken',
  worksOnGoingCache: 'okami-extension@worksOnGoingCache',
} as const

export const useLocalStorage = <T>(
  keyName: keyof typeof localStorageKeys,
  initialValue: T,
) => {
  const key = localStorageKeys[keyName]

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

export interface GetTokensFromStorageResult {
  refreshToken: string | null
  token: string | null
}

export const getTokensByExtensionStorage = (): GetTokensFromStorageResult => {
  return {
    refreshToken: localStorage.getItem(localStorageKeys.refreshToken) || null,
    token: localStorage.getItem(localStorageKeys.token) || null,
  }
}
export const getTokenFormOkamiIntegrationStorage =
  async (): Promise<string> => {
    return new Promise((resolve) => {
      chrome.storage.local.get(
        localStorageKeys.refreshToken,
        (result: { [key: string]: string }) => {
          resolve(result[localStorageKeys.refreshToken] || '')
        },
      )
    })
  }

export const deleteTokensFromStorage = () => {
  localStorage.removeItem(localStorageKeys.refreshToken)
}

export const setTokensInStorage = (refreshToken: string) => {
  localStorage.setItem(localStorageKeys.refreshToken, refreshToken)
}

export const setJwtTokenInStorage = (token: string) => {
  localStorage.setItem(localStorageKeys.token, token)
}
