import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const publicRoutes = ['/auth']
const protectedRoutes = ['/todos']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const accessToken = request.cookies.get('accessToken')?.value

  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  )

  if (isProtectedRoute && !accessToken) {
    const authUrl = new URL('/auth', request.url)
    authUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(authUrl)
  }

  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route))

  if (isPublicRoute && accessToken) {
    return NextResponse.redirect(new URL('/todos', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/auth', '/todos/:path*'],
}
