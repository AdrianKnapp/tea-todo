import { NextRequest } from 'next/server'
import { DUMMY_JSON_URL } from '@/lib/constants'
import {
  fetchWithAuth,
  buildResponse,
  buildErrorResponse,
} from '@/lib/api/server'
import type { Todo, UpdateTodoPayload } from '@/types/todo'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params

  const result = await fetchWithAuth<Todo>(`${DUMMY_JSON_URL}/todos/${id}`)

  if (result.error) {
    return buildErrorResponse(result.error, result.status)
  }

  return buildResponse(result.data, 200, result.newTokens)
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { id } = await params
  const body: UpdateTodoPayload = await request.json()

  const result = await fetchWithAuth<Todo>(`${DUMMY_JSON_URL}/todos/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  })

  if (result.error) {
    return buildErrorResponse(result.error, result.status)
  }

  return buildResponse(result.data, 200, result.newTokens)
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params

  const result = await fetchWithAuth<Todo & { isDeleted: boolean }>(
    `${DUMMY_JSON_URL}/todos/${id}`,
    { method: 'DELETE' }
  )

  if (result.error) {
    return buildErrorResponse(result.error, result.status)
  }

  return buildResponse(result.data, 200, result.newTokens)
}
