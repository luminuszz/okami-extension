import {ToastProvider} from '@/components/toast-provider.tsx'
import {queryClient, queryClientPersister} from '@/lib/react-query.ts'
import {PersistQueryClientProvider} from '@tanstack/react-query-persist-client'
import {X} from 'lucide-react'
import {useEffect} from 'react'
import {Router} from './Router'
import {AuthProvider} from './components/auth-provider'
import {Button} from './components/ui/button'

export function App() {
  useEffect(() => {
    const root = window.document.documentElement

    root.classList.add('dark')
  }, [])

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister: queryClientPersister }}
    >
      <AuthProvider>
        <div className="flex items-start justify-end">
          <Button variant="ghost" size="icon">
            <X onClick={() => window.close()} />
          </Button>
        </div>
        <ToastProvider>
          <Router />
        </ToastProvider>
      </AuthProvider>
    </PersistQueryClientProvider>
  )
}
