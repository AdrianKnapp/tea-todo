export const DUMMY_JSON_URL = 'https://dummyjson.com'

export const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
}

export const ACCESS_TOKEN_MAX_AGE = 60 * 30 // 30 minutes
export const REFRESH_TOKEN_MAX_AGE = 60 * 60 * 24 * 7 // 7 days

export const QUERY_KEYS = {
  todos: ['todos'] as const,
  todo: (id: number) => ['todos', id] as const,
  user: ['user'] as const,
}

export const DEFAULT_PAGE_SIZE = 10
