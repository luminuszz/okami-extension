import { type ClassValue, clsx } from 'clsx'
import Levenshtein from 'fast-levenshtein'
import { map, reduce } from 'lodash'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function isRunningAsExtension(): boolean {
  return typeof chrome !== 'undefined' && typeof chrome.runtime !== 'undefined'
}

export const getCurrentTab = async (): Promise<string> => {
  return new Promise((resolve) => {
    if (!isRunningAsExtension()) {
      return resolve('')
    }

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length > 0 && tabs[0].title) {
        resolve(tabs[0].title)
      } else {
        resolve('')
      }
    })
  })
}

type ListValue = {
  parsedName: string
  originalName: string
}

export function search(listObj: string[], nameRef: string) {
  const list = map(listObj, (name) => ({
    originalName: name,
    parsedName: name.toLowerCase().replace(/[^a-zA-Z0-9]/g, ''),
  }))

  const results = reduce<ListValue, ListValue>(
    list,
    (closestName, currentName) => {
      const currentDistance = Levenshtein.get(nameRef, currentName.parsedName)
      const closestDistance = Levenshtein.get(nameRef, closestName.parsedName)

      closestName =
        currentDistance < closestDistance ? currentName : closestName

      return closestName
    },
    { parsedName: '', originalName: '' },
  )

  return results.originalName
}

export function hasExceededMaxFractionDigits(
  num: number,
  maxFractionDigits: number,
): boolean {
  const fractionPart = num.toString().split('.')[1]

  return !!fractionPart && fractionPart.length > maxFractionDigits
}
