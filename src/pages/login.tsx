import { Label } from '@/components/ui/label'

export function Login() {
  return (
    <div className="flex flex-col justify-center gap-4">
      <h2 className="text-center text-lg text-muted-foreground">Login</h2>

      <Label>E-mail</Label>
    </div>
  )
}
