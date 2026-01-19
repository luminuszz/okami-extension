console.log("Okami: Content script carregado");

const refreshTokenStorageKey = "okami-extension@refreshToken";

const TokenStatus = {
  FETCHING: "FETCHING",
  SUCCESS: "SUCCESS",
  ERROR: "ERROR",
  SAVED: "SAVED",
};

function dispatchTokenStatusChange(status, data = {}) {
  const event = new CustomEvent("okami:token-status-changed", {
    detail: JSON.parse(
      JSON.stringify({
        status,
        timestamp: new Date().toISOString(),
        ...data,
      }),
    ),
    bubbles: true,
    composed: true,
  });
  document.dispatchEvent(event);
}

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

async function initializeToken() {
  chrome.storage.local.get([refreshTokenStorageKey], (result) => {
    if (result[refreshTokenStorageKey]) {
      dispatchTokenStatusChange(TokenStatus.SUCCESS, {
        message: "Token já existe no storage",
        hasToken: true,
        fromCache: true,
      });
    } else {
      fetchTokenFromBackend();
    }
  });
}

// Executa apenas nos domínios permitidos
if (["app.myokami.xyz", "localhost"].includes(window.location.hostname)) {
  initializeToken();
}
