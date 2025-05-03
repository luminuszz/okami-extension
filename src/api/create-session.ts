import { z } from 'zod'

import { okamiHttpGateway } from '@/lib/axios'
import { setJwtTokenInStorage, setTokensInStorage } from '@/lib/storage'

const createSessionInputSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

export type CreateSessionInput = z.infer<typeof createSessionInputSchema>

export interface CreateSessionResponse {
  refreshToken: string
  token: string
}

export async function createSession(payload: CreateSessionInput) {
  const parsed = createSessionInputSchema.parse(payload)

  const response = await okamiHttpGateway.post<CreateSessionResponse>(
    '/auth/v2/login',
    parsed,
  )

  const { refreshToken, token } = response.data

  setTokensInStorage(refreshToken)
  setJwtTokenInStorage(token)

  return {
    refreshToken,
  }
}
