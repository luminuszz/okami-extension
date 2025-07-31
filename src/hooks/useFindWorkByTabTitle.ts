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
    ;(async () => {
      const allWorksNameAndAlternativeNames = flatMap(works, (work) => [
        work.name,
        work.alternativeName ?? '',
      ])

      const firsTWorkMatchToTitle = search(allWorksNameAndAlternativeNames, currentTabTitle)

      const foundWork = find(works, (work) =>
        [work.name, work.alternativeName].includes(firsTWorkMatchToTitle),
      )

      if (!foundWork) {
        console.warn(`No work found for the current tab title: "${currentTabTitle}"`)
        return
      }

      setWork(foundWork)
    })()
  }, [currentTabTitle, works])

  return work
}
