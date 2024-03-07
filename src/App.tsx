import { useEffect, useState } from 'react'

import { isUnauthorizedError, okamiHttpGateway } from './lib/axios'
import { MarkWorkRead } from './pages/mark-work-read'

export function App() {
  const [isLogged, setIsLogged] = useState(false)

  useEffect(() => {
    const root = window.document.documentElement

    root.classList.add('dark')

    const interceptorId = okamiHttpGateway.interceptors.response.use(
      (response) => response,
      (error) => {
        const canRedirectToLogin = isUnauthorizedError(error)

        if (canRedirectToLogin) {
          setIsLogged(false)
        }

        return Promise.reject(error)
      },
    )

    return () => {
      okamiHttpGateway.interceptors.response.eject(interceptorId)
    }
  }, [])

  return isLogged ? <MarkWorkRead /> : <h1>Not logged in</h1>
}
