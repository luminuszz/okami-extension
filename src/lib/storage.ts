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
  authToken: 'okami@authToken',
} as const

export interface GetTokensFromStorageResult {
  token: string
  refreshToken: string
}

export const getTokensByExtensionStorage =
  async (): Promise<GetTokensFromStorageResult> => {
    return await new Promise((resolve) => {
      chrome.storage.local.get(
        ['token', 'refreshToken'],
        ({ token, refreshToken }) => {
          resolve({ token, refreshToken })
        },
      )
    })
  }



  export const deleteTokensFromStorage = async () => {
    return await new Promise((resolve) => {
      chrome.storage.local.remove(['token', 'refreshToken'], () =>  resolve)
    })
  }
