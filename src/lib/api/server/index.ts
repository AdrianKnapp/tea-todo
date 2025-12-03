import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import {
  DUMMY_JSON_URL,
  COOKIE_OPTIONS,
  ACCESS_TOKEN_MAX_AGE,
  REFRESH_TOKEN_MAX_AGE,
} from '@/lib/constants'
import type { TokenPair } from '@/types/auth'

interface FetchWithAuthResult<T> {
  data: T | null
  error: string | null
  status: number
  newTokens: TokenPair | null
}

export async function getTokensFromCookies(): Promise<{
  accessToken: string | undefined
  refreshToken: string | undefined
}> {
  const cookieStore = await cookies()
  return {
    accessToken: cookieStore.get('accessToken')?.value,
    refreshToken: cookieStore.get('refreshToken')?.value,
  }
}

export async function refreshTokens(
  refreshToken: string
): Promise<TokenPair | null> {
  try {
    const res = await fetch(`${DUMMY_JSON_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken, expiresInMins: 30 }),
    })

    if (!res.ok) {
      return null
    }

    return res.json()
  } catch {
    return null
  }
}

export async function fetchWithAuth<T>(
  url: string,
  options: RequestInit = {}
): Promise<FetchWithAuthResult<T>> {
  const { accessToken, refreshToken } = await getTokensFromCookies()

  if (!accessToken) {
    return { data: null, error: 'No access token', status: 401, newTokens: null }
  }

  // First attempt with current accessToken
  let res = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  })

  // If 401 and we have refreshToken, try to refresh
  if (res.status === 401 && refreshToken) {
    const newTokens = await refreshTokens(refreshToken)

    if (newTokens) {
      // Retry original request with new token
      res = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${newTokens.accessToken}`,
          'Content-Type': 'application/json',
        },
      })

      if (res.ok) {
        const data = await res.json()
        return { data, error: null, status: res.status, newTokens }
      }
    }

    // Refresh failed = session expired
    return { data: null, error: 'Session expired', status: 401, newTokens: null }
  }

  if (!res.ok) {
    const errorText = await res.text()
    return { data: null, error: errorText, status: res.status, newTokens: null }
  }

  const data = await res.json()
  return { data, error: null, status: res.status, newTokens: null }
}

export function setTokenCookies(
  response: NextResponse,
  tokens: TokenPair
): void {
  response.cookies.set('accessToken', tokens.accessToken, {
    ...COOKIE_OPTIONS,
    maxAge: ACCESS_TOKEN_MAX_AGE,
  })
  response.cookies.set('refreshToken', tokens.refreshToken, {
    ...COOKIE_OPTIONS,
    maxAge: REFRESH_TOKEN_MAX_AGE,
  })
}

export function clearTokenCookies(response: NextResponse): void {
  response.cookies.delete('accessToken')
  response.cookies.delete('refreshToken')
}

export function buildResponse<T>(
  data: T,
  status: number,
  newTokens: TokenPair | null
): NextResponse {
  const response = NextResponse.json(data, { status })

  if (newTokens) {
    setTokenCookies(response, newTokens)
  }

  return response
}

export function buildErrorResponse(
  error: string,
  status: number
): NextResponse {
  return NextResponse.json({ error }, { status })
}
