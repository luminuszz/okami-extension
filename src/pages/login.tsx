import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

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
  const { makeLogin } = useAuth()

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

  return (
    <Container>
      <form onSubmit={handleSubmit(makeLogin)} className="flex flex-col gap-4">
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
