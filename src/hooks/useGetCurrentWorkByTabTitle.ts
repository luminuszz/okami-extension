import {useEffect, useState} from 'react'

export function useGetCurrentTabTitle() {
    const [tabTitle, setTabTitle] = useState<string | null>(null)

    useEffect(() => {
        if (typeof chrome === 'undefined' || !chrome.tabs) {
            console.warn(
                'Chrome API is not available. This hook should be used in a Chrome extension context.',
            )
            return
        }

        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
            if (tabs.length > 0 && tabs[0].title) {
                setTabTitle(tabs[0].title)
            }
        })
    }, [])

    return tabTitle
}
