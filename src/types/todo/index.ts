export interface Todo {
  id: number
  todo: string
  completed: boolean
  userId: number
}

export interface TodosResponse {
  todos: Todo[]
  total: number
  skip: number
  limit: number
}

export interface TodosWithPagination extends TodosResponse {
  page: number
  totalPages: number
}

export interface CreateTodoPayload {
  todo: string
  completed?: boolean
}

export interface UpdateTodoPayload {
  todo?: string
  completed?: boolean
}
