import { NextResponse } from 'next/server'
import { clearTokenCookies } from '@/lib/api/server'

export async function POST() {
  const response = NextResponse.json({ success: true })
  clearTokenCookies(response)
  return response
}
