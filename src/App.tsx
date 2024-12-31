import { X } from 'lucide-react'
import { useEffect } from 'react'

import { AuthProvider } from './components/auth-provider'
import { Button } from './components/ui/button'
import { Router } from './Router'


export function App() {
  useEffect(() => {
    const root = window.document.documentElement
    root.classList.add('dark')
  }, [])

  return (
    <AuthProvider>
      <div className="flex items-start justify-end">
        <Button variant="ghost" size="icon">
          <X onClick={() => window.close()} />
        </Button>
      </div>
      <Router />
    </AuthProvider>
  )
}
