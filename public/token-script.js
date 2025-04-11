const sendRefreshTokenEventName = 'SEND_OKAMI_REFRESH_TOKEN'
const injectSriptTokenLoaderEventName = 'INJECT_OKAMI_TOKEN_LOADED'
const refreshTokenStorageKey = 'okami-extension@refreshToken'

console.log('Okami Platform token script loaded')

const isSendRefreshTokenEvent = (event) =>
  event?.data?.type === sendRefreshTokenEventName

function saveTokenToLocalStorage(token) {
  // eslint-disable-next-line no-undef
  chrome.storage.local.set({ [refreshTokenStorageKey]: token }, (error) => {
    console.log('Token saved to local storage', JSON.stringify(error))
  })
}

function listenForRefreshTokenByOkamiPlatform() {
  window.addEventListener('message', (event) => {
    if (isSendRefreshTokenEvent(event)) {
      const { refreshToken } = event.data

      console.log(`Received refresh token from Okami Platform: ${refreshToken}`)

      saveTokenToLocalStorage(refreshToken)
    }
  })

  console.log('Listening for refresh token from Okami Platform...')
}

listenForRefreshTokenByOkamiPlatform()

window.postMessage(
  {
    type: injectSriptTokenLoaderEventName,
  },
  '*',
)
