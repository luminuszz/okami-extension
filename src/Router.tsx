import { Loader } from 'lucide-react'
import { useEffect } from 'react'

import { Login } from '@/pages/login.tsx'

import { useAuth } from './components/auth-provider'
import { Container } from './components/container'
import { MarkWorkRead } from './pages/mark-work-read'

export function Router() {
  const { isLoading, isLogged, checksTokenFromChromeStorage } = useAuth()

  useEffect(() => {
    checksTokenFromChromeStorage().then()
  }, [checksTokenFromChromeStorage])

  if (isLoading) {
    return (
      <Container className="flex">
        <div className="flex items-center justify-center">
          <Loader className="size-40 animate-spin text-muted-foreground" />
        </div>
      </Container>
    )
  }

  return isLogged ? <MarkWorkRead /> : <Login />
}
