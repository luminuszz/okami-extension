import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { createSession } from '@/api/create-session'
import { useAuth } from '@/components/auth-provider'
import { Container } from '@/components/container'
import { Logo } from '@/components/logo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const formSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string({ required_error: 'Campo obrigatório' }),
})

type FormSchema = z.infer<typeof formSchema>

export function Login() {
  const { setToken } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    values: {
      email: '',
      password: '',
    },
  })

  async function handleLogin({ email, password }: FormSchema) {
    try {
      alert('Fazendo login ')
      const { token } = await createSession({ email, password })

      await chrome.storage.local.set({ token })

      setToken(token)
    } catch (error) {
      alert('Erro ao fazer login ' + JSON.stringify(error))
    }
  }

  return (
    <Container>
      <form
        onSubmit={handleSubmit(handleLogin)}
        className="flex flex-col gap-4"
      >
        <picture className="flex justify-center">
          <Logo className="size-28" />
        </picture>

        <Input placeholder="E-mail" {...register('email')} />
        <Input
          placeholder="Password"
          type="password"
          {...register('password')}
        />

        <Button type="submit" disabled={isSubmitting}>
          Login
        </Button>
      </form>
    </Container>
  )
}
