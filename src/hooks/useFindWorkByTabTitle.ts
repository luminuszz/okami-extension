import {WorkForExtensionType} from '@/api/fetch-work-list.ts'
import {useGetCurrentTabTitle} from '@/hooks/useGetCurrentWorkByTabTitle.ts'
import {search} from '@/lib/utils.ts'
import {find, flatMap} from 'lodash'
import {useEffect, useState} from 'react'

export function useFindWorkByTabTitle(works: WorkForExtensionType[]) {
  const [work, setWork] = useState<WorkForExtensionType | null>(null)
  const currentTabTitle = useGetCurrentTabTitle()

  useEffect(() => {
    if (!currentTabTitle) return

    const allWorksNameAndAlternativeNames = flatMap(works, (work) => [
      work.name,
      work.alternativeName ?? '',
    ])

    const firstWorkMatchToTitle = search(allWorksNameAndAlternativeNames, currentTabTitle)

    if (!firstWorkMatchToTitle) {
      setWork(null)
      return
    }

    const foundWork = find(works, (work) =>
      [work.name, work.alternativeName].includes(firstWorkMatchToTitle),
    )

    setWork(foundWork ?? null)
  }, [currentTabTitle, works])

  return work
}
