import { DUMMY_JSON_URL } from '@/lib/constants'
import {
  fetchWithAuth,
  buildResponse,
  buildErrorResponse,
} from '@/lib/api/server'
import type { User } from '@/types/auth'

export async function GET() {
  const result = await fetchWithAuth<User>(`${DUMMY_JSON_URL}/auth/me`)

  if (result.error) {
    return buildErrorResponse(result.error, result.status)
  }

  return buildResponse(result.data, 200, result.newTokens)
}
