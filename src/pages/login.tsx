import { zodResolver } from '@hookform/resolvers/zod'
import { AxiosError } from 'axios'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { createSession } from '@/api/create-session'
import { useAuth } from '@/components/auth-provider'
import { Container } from '@/components/container'
import { Logo } from '@/components/logo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const formSchema = z.object({
  email: z.preprocess(
    (val) => String(val).trim(),
    z
      .string({
        invalid_type_error: 'Invalido',
        required_error: 'Obrigatório',
      })
      .email("'E-mail inválido'"),
  ),
  password: z
    .string({
      required_error: 'Campo obrigatório',
      invalid_type_error: 'Invalido',
    })
    .min(8, 'Informe uma senha válida'),
})

type FormSchema = z.infer<typeof formSchema>

export function Login() {
  const { setToken } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    values: {
      email: '',
      password: '',
    },
  })

  async function handleLogin({ email, password }: FormSchema) {
    try {
      const { token, refreshToken } = await createSession({ email, password })

      await chrome.storage.local.set({ token, refreshToken })

      setToken(token)
    } catch (error) {
      if (error instanceof AxiosError) {
        console.log(
          `Houve um erro ao fazer login: ${error.response?.data?.message}`,
        )
      }
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
        {errors?.email && (
          <span className="text-sm text-red-600">{errors.email.message}</span>
        )}
        <Input
          placeholder="Password"
          type="password"
          {...register('password')}
        />

        {errors?.password && (
          <span className="text-sm text-red-600">
            {errors.password.message}
          </span>
        )}

        <Button type="submit" disabled={isSubmitting}>
          Login
        </Button>
      </form>
    </Container>
  )
}
