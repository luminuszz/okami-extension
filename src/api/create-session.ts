import { z } from 'zod'

import { okamiHttpGateway } from '@/lib/axios'

const createSessionInputSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

export type CreateSessionInput = z.infer<typeof createSessionInputSchema>

export interface CreateSessionResponse {
  token: string
  refreshToken: string
}

export async function createSession(payload: CreateSessionInput) {
  const parsed = createSessionInputSchema.parse(payload)

  const response = await okamiHttpGateway.post<CreateSessionResponse>(
    '/auth/v2/login',
    parsed,
  )

  const { token, refreshToken } = response.data

  return {
    token,
    refreshToken,
  }
}
