console.log("Okami: Content script carregado");

const refreshTokenStorageKey = "okami-extension@refreshToken";

const TokenStatus = {
  FETCHING: "FETCHING",
  SUCCESS: "SUCCESS",
  ERROR: "ERROR",
  SAVED: "SAVED",
};

let lastStatus = null;

function dispatchTokenStatusChange(status, data = {}) {
  lastStatus = {
    okami: true,
    status,
    timestamp: new Date().toISOString(),
    ...data,
  };
  window.postMessage(lastStatus, window.location.origin);
}

// The page posts READY once its listener is mounted; replay the last status
// so early messages (FETCHING) are not lost to the mount race.
window.addEventListener("message", (event) => {
  if (event.source !== window) return;
  if (event.origin !== window.location.origin) return;
  if (event.data?.okami && event.data.status === "READY" && lastStatus) {
    window.postMessage(lastStatus, window.location.origin);
  }
});

async function fetchTokenFromBackend() {
  try {
    dispatchTokenStatusChange(TokenStatus.FETCHING, {
      message: "Iniciando busca do token...",
    });

    const response = await fetch(
      "https://api.myokami.xyz/auth/v2/extension/refresh-token",
      {
        method: "POST",
        credentials: "include",
      },
    );

    if (response.ok) {
      const data = await response.json();

      if (data.refreshToken) {
        dispatchTokenStatusChange(TokenStatus.SUCCESS, {
          message: "Token recuperado via Cookie Session",
          hasToken: true,
        });

        saveTokenToLocalStorage(data.refreshToken);
      } else {
        dispatchTokenStatusChange(TokenStatus.ERROR, {
          message: "Token não encontrado na resposta",
          error: "NO_TOKEN",
        });
      }
    } else {
      dispatchTokenStatusChange(TokenStatus.ERROR, {
        message: "Falha na requisição",
        statusCode: response.status,
        error: "REQUEST_FAILED",
      });
    }
  } catch (error) {
    dispatchTokenStatusChange(TokenStatus.ERROR, {
      message: "Falha ao sincronizar token",
      error: error.message,
    });
  }
}

function saveTokenToLocalStorage(token) {
  chrome.storage.local.set({ [refreshTokenStorageKey]: token }, () => {
    dispatchTokenStatusChange(TokenStatus.SAVED, {
      message: "Token salvo no storage da extensão",
      success: true,
    });
  });
}

// Executa apenas nos domínios permitidos (alinhado ao manifest content_scripts.matches)
if (
  ["app.myokami.xyz", "localhost", "127.0.0.1"].includes(
    window.location.hostname,
  )
) {
  fetchTokenFromBackend();
}
