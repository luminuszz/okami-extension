import { find, flatMap } from 'lodash'
import { useEffect, useState } from 'react'

import { WorkType } from '@/api/fetch-for-works-with-filter.ts'
import { useGetCurrentTabTitle } from '@/hooks/useGetCurrentWorkByTabTitle.ts'
import { search } from '@/lib/utils.ts'

export function useFindWorkByTabTitle(works: WorkType[]) {
  const [work, setWork] = useState<WorkType | null>(null)

  const currentTabTitle = useGetCurrentTabTitle()

  useEffect(() => {
    if (!currentTabTitle) return

    const allWorksNameAndAlternativeNames = flatMap(works, (work) => [
      work.name,
      work.alternativeName ?? '',
    ])

    const firsTWorkMatchToTitle = search(
      allWorksNameAndAlternativeNames,
      currentTabTitle,
    )

    const foundWork = find(works, (work) =>
      [work.name, work.alternativeName].includes(firsTWorkMatchToTitle),
    )

    if (!foundWork) {
      console.warn(
        `No work found for the current tab title: "${currentTabTitle}"`,
      )
      return
    }

    setWork(foundWork)
  }, [currentTabTitle, works])

  return work
}
