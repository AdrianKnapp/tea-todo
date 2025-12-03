import { NextRequest } from 'next/server'
import { DUMMY_JSON_URL, DEFAULT_PAGE_SIZE } from '@/lib/constants'
import {
  fetchWithAuth,
  buildResponse,
  buildErrorResponse,
} from '@/lib/api/server'
import type { User } from '@/types/auth'
import type { TodosResponse, CreateTodoPayload } from '@/types/todo'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  const page = parseInt(searchParams.get('page') || '1', 10)
  const limit = parseInt(
    searchParams.get('limit') || String(DEFAULT_PAGE_SIZE),
    10
  )
  const skip = (page - 1) * limit

  const userResult = await fetchWithAuth<User>(`${DUMMY_JSON_URL}/auth/me`)

  if (userResult.error) {
    return buildErrorResponse(userResult.error, userResult.status)
  }

  const userId = userResult.data!.id

  const todosResult = await fetchWithAuth<TodosResponse>(
    `${DUMMY_JSON_URL}/todos/user/${userId}?limit=${limit}&skip=${skip}`
  )

  if (todosResult.error) {
    return buildErrorResponse(todosResult.error, todosResult.status)
  }

  const responseData = {
    ...todosResult.data,
    page,
    totalPages: Math.ceil(todosResult.data!.total / limit),
  }

  return buildResponse(
    responseData,
    200,
    todosResult.newTokens || userResult.newTokens
  )
}

export async function POST(request: NextRequest) {
  const body: CreateTodoPayload = await request.json()

  const userResult = await fetchWithAuth<User>(`${DUMMY_JSON_URL}/auth/me`)

  if (userResult.error) {
    return buildErrorResponse(userResult.error, userResult.status)
  }

  const userId = userResult.data!.id

  const createResult = await fetchWithAuth<{ id: number } & CreateTodoPayload>(
    `${DUMMY_JSON_URL}/todos/add`,
    {
      method: 'POST',
      body: JSON.stringify({
        todo: body.todo,
        completed: body.completed ?? false,
        userId,
      }),
    }
  )

  if (createResult.error) {
    return buildErrorResponse(createResult.error, createResult.status)
  }

  return buildResponse(
    createResult.data,
    201,
    createResult.newTokens || userResult.newTokens
  )
}
