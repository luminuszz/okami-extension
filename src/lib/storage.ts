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

// ponytail: two-tier on purpose. chrome.storage.local is the durable store the
// content script writes cross-context; localStorage is the sync cache the axios
// request interceptor reads. Collapse to one source only if axios goes async.
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

// Must clear every store that holds a token. Leaving the chrome.storage.local
// copy behind makes the popup re-read the dead token on reopen and log back in,
// 401, log out again — a loop the user cannot escape.
export const deleteTokensFromStorage = () => {
  localStorage.removeItem(localStorageKeys.refreshToken)
  localStorage.removeItem(localStorageKeys.token)

  if (typeof chrome !== 'undefined' && chrome.storage?.local) {
    chrome.storage.local.remove(localStorageKeys.refreshToken)
  }
}

export const setTokensInStorage = (refreshToken: string) => {
  localStorage.setItem(localStorageKeys.refreshToken, refreshToken)
}

export const setJwtTokenInStorage = (token: string) => {
  localStorage.setItem(localStorageKeys.token, token)
}
