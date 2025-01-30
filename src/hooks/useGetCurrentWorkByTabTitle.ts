import { useEffect, useState } from 'react'

import { getCurrentTab } from '@/lib/utils'

export function useGetCurrentTabTitle() {
  const [tabTitle, setTabTitle] = useState<string | null>(null)

  useEffect(() => {
    getCurrentTab().then((tabTitle) => setTabTitle(tabTitle))
  }, [])

  return tabTitle
}
