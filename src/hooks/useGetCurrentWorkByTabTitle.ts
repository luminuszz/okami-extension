import { useEffect, useState } from 'react'

export function useGetCurrentTabTitle() {
  const [tabTitle, setTabTitle] = useState<string | null>(null)

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length > 0 && tabs[0].title) {
        setTabTitle(tabs[0].title)
      }
    })
  }, [])

  return tabTitle
}
