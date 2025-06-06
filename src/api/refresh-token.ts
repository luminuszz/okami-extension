import { okamiHttpGateway } from '@/lib/axios'

export interface RefreshTokenCallResponse {
  token: string
}

export async function refreshTokenCall(refreshToken: string) {
  const response = await okamiHttpGateway.post<RefreshTokenCallResponse>(
    '/auth/v2/refresh-token/mobile',
    {
      refreshToken,
    },
  )

  const { token } = response.data

  return {
    token,
  }
}
