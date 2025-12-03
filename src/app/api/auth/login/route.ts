import { NextRequest, NextResponse } from 'next/server'
import {
  DUMMY_JSON_URL,
  COOKIE_OPTIONS,
  ACCESS_TOKEN_MAX_AGE,
  REFRESH_TOKEN_MAX_AGE,
} from '@/lib/constants'
import type { AuthResponse, LoginCredentials } from '@/types/auth'

export async function POST(request: NextRequest) {
  try {
    const body: LoginCredentials = await request.json()

    const res = await fetch(`${DUMMY_JSON_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: body.username,
        password: body.password,
        expiresInMins: 30,
      }),
    })

    if (!res.ok) {
      const error = await res.json()
      return NextResponse.json(
        { error: error.message || 'Invalid credentials' },
        { status: res.status }
      )
    }

    const data: AuthResponse = await res.json()

    const response = NextResponse.json({
      id: data.id,
      username: data.username,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      gender: data.gender,
      image: data.image,
    })

    response.cookies.set('accessToken', data.accessToken, {
      ...COOKIE_OPTIONS,
      maxAge: ACCESS_TOKEN_MAX_AGE,
    })
    response.cookies.set('refreshToken', data.refreshToken, {
      ...COOKIE_OPTIONS,
      maxAge: REFRESH_TOKEN_MAX_AGE,
    })

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
