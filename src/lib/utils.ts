import { type ClassValue, clsx } from 'clsx' // eslint-disable-line
import { twMerge } from 'tailwind-merge'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment, @typescript-eslint/no-var-requires

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getCurrentTab = async (): Promise<string> => {
  return new Promise((resolve) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length > 0) {
        const tabTitle = tabs[0].title ?? ''

        resolve(tabTitle)
      }

      resolve('')
    })
  })
}

function levenshtein(str1: string, str2: string) {
  const len1 = str1.length
  const len2 = str2.length

  const dp = new Array(len1 + 1)
    .fill(null)
    .map(() => new Array(len2 + 1).fill(0))

  for (let i = 0; i <= len1; i++) {
    dp[i][0] = i
  }
  for (let j = 0; j <= len2; j++) {
    dp[0][j] = j
  }

  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost,
      )
    }
  }

  return dp[len1][len2]
}

interface DataItem {
  id: string
  name: string
}

export function search(
  array: DataItem[],
  nomeParametro: string,
): string | null {
  // Converte a lista de objetos em um array de strings com os nomes
  const nomes = array.map((item) => item.name)

  // Calcula a distância de Levenshtein entre cada nome e o nome do parâmetro
  const distancias = nomes.map((nome) => {
    const distancia = levenshtein(
      nome.toLowerCase(),
      nomeParametro.toLowerCase(),
    )
    return { nome, distancia }
  })

  // Ordena os resultados por distância, com menor distância primeiro
  distancias.sort((a, b) => a.distancia - b.distancia)

  // Retorna o nome com a menor distância
  return distancias[0].nome
}
