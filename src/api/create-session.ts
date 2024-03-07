import { z } from 'zod'

import { okamiHttpGateway } from '@/lib/axios'

const createSessionInputSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

export type CreateSessionInput = z.infer<typeof createSessionInputSchema>

export async function createSession(payload: CreateSessionInput) {
  const parsed = createSessionInputSchema.parse(payload)

  await okamiHttpGateway.post<{ token: string }>('/auth/login-mobile', parsed)
}
