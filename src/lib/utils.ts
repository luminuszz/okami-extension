import { type ClassValue, clsx } from 'clsx'
import Levenshtein from 'fast-levenshtein'
import { map, reduce } from 'lodash'
import { twMerge } from 'tailwind-merge'

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
