import { useMutation, useQuery, useQueryClient, QueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { apiClient } from '@/lib/api/client'
import { QUERY_KEYS, DEFAULT_PAGE_SIZE } from '@/lib/constants'
import type {
  Todo,
  TodosWithPagination,
  CreateTodoPayload,
  UpdateTodoPayload,
} from '@/types/todo'

interface UseTodosParams {
  page?: number
  limit?: number
}

interface UseTodosReturn {
  todos: Todo[]
  total: number
  page: number
  totalPages: number
  isLoading: boolean
  error: Error | null
}

interface UseTodoReturn {
  todo: Todo | null | undefined
  isLoading: boolean
  error: Error | null
}

interface UseTodoMutationsReturn {
  createTodo: (payload: CreateTodoPayload) => Promise<void>
  updateTodo: (id: number, payload: UpdateTodoPayload) => Promise<void>
  deleteTodo: (id: number) => Promise<void>
  isCreating: boolean
  isUpdating: boolean
  isDeleting: boolean
}

export const useTodos = ({
  page = 1,
  limit = DEFAULT_PAGE_SIZE,
}: UseTodosParams = {}): UseTodosReturn => {
  const { data, isLoading, error } = useQuery({
    queryKey: [...QUERY_KEYS.todos, { page, limit }],
    queryFn: async () => {
      const { data } = await apiClient.get<TodosWithPagination>('/todos', {
        params: { page, limit },
      })
      return data
    },
  })

  return {
    todos: data?.todos ?? [],
    total: data?.total ?? 0,
    page: data?.page ?? page,
    totalPages: data?.totalPages ?? 0,
    isLoading,
    error: error as Error | null,
  }
}

export const useTodo = (id: number): UseTodoReturn => {
  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.todo(id),
    queryFn: async () => {
      // For newly created TODOs (negative IDs), get from cache
      // They don't exist on the server
      if (id < 0) {
        const cachedTodo = queryClient.getQueryData<Todo>(QUERY_KEYS.todo(id))
        if (cachedTodo) return cachedTodo

        // If not in cache, search in todos list cache
        const todosQueries = queryClient.getQueriesData<TodosWithPagination>({
          queryKey: QUERY_KEYS.todos,
        })
        for (const [, data] of todosQueries) {
          if (data?.todos) {
            const todo = data.todos.find((t) => t.id === id)
            if (todo) return todo
          }
        }

        throw new Error('TODO not found')
      }

      const { data } = await apiClient.get<Todo>(`/todos/${id}`)
      return data
    },
    enabled: !!id,
  })

  return {
    todo: data,
    isLoading,
    error: error as Error | null,
  }
}

export const useTodoMutations = (): UseTodoMutationsReturn => {
  const queryClient = useQueryClient()

  const createMutation = useMutation({
    mutationFn: async (payload: CreateTodoPayload) => {
      const { data } = await apiClient.post<Todo>('/todos', payload)
      return data
    },
    onMutate: async (payload) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.todos })

      // Get user for optimistic TODO
      const user = queryClient.getQueryData<{ id: number }>(['user'])

      // Create optimistic TODO with temporary negative ID
      const optimisticTodo: Todo = {
        id: -Date.now(), // Temporary negative ID for optimistic update
        todo: payload.todo,
        completed: payload.completed ?? false,
        userId: user?.id ?? 1,
      }

      // Save previous state for rollback
      const previousTodos = queryClient.getQueriesData<TodosWithPagination>({
        queryKey: QUERY_KEYS.todos,
      })

      // Optimistically update cache
      queryClient.setQueriesData<TodosWithPagination>(
        { queryKey: QUERY_KEYS.todos },
        (old) => {
          if (!old || !old.todos) return old
          return {
            ...old,
            todos: [optimisticTodo, ...old.todos],
            total: old.total + 1,
          }
        }
      )

      // Cache the individual TODO so it can be viewed in detail dialog
      queryClient.setQueryData(QUERY_KEYS.todo(optimisticTodo.id), optimisticTodo)

      return { previousTodos, optimisticTodo }
    },
    onSuccess: (_apiTodo, _payload, _context) => {
      // Keep the optimistic TODO with negative ID
      // DummyJSON returns fake IDs that might be duplicates
      // and newly created TODOs don't actually persist on the server
      toast.success('Task created successfully!')
    },
    onError: (_error, _payload, context) => {
      // Rollback on error
      if (context?.previousTodos) {
        context.previousTodos.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data)
        })
      }
      toast.error('Error creating task')
    },
  })

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      payload,
      queryClient: qc,
    }: {
      id: number
      payload: UpdateTodoPayload
      queryClient: QueryClient
    }) => {
      // Skip API call for newly created TODOs (negative IDs)
      // They don't exist on the server
      if (id < 0) {
        // Get the current TODO from cache and merge with updates
        const currentTodo = qc.getQueryData<Todo>(QUERY_KEYS.todo(id))
        if (currentTodo) {
          return { ...currentTodo, ...payload }
        }
        // Fallback if not in cache
        return { id, todo: '', completed: false, userId: 1, ...payload }
      }
      const { data } = await apiClient.put<Todo>(`/todos/${id}`, payload)
      return data
    },
    onMutate: async ({ id, payload }) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.todos })
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.todo(id) })

      const previousTodos = queryClient.getQueriesData<TodosWithPagination>({
        queryKey: QUERY_KEYS.todos,
      })
      const previousTodo = queryClient.getQueryData<Todo>(QUERY_KEYS.todo(id))

      // Optimistic update
      queryClient.setQueriesData<TodosWithPagination>(
        { queryKey: QUERY_KEYS.todos },
        (old) => {
          if (!old || !old.todos) return old
          return {
            ...old,
            todos: old.todos.map((t) =>
              t.id === id ? { ...t, ...payload } : t
            ),
          }
        }
      )

      queryClient.setQueryData<Todo>(QUERY_KEYS.todo(id), (old) =>
        old ? { ...old, ...payload } : old
      )

      return { previousTodos, previousTodo, id }
    },
    onSuccess: (apiResponse, { id }) => {
      // Update cache with API response
      queryClient.setQueryData(QUERY_KEYS.todo(id), apiResponse)
      queryClient.setQueriesData<TodosWithPagination>(
        { queryKey: QUERY_KEYS.todos },
        (old) => {
          if (!old || !old.todos) return old
          return {
            ...old,
            todos: old.todos.map((t) => (t.id === id ? apiResponse : t)),
          }
        }
      )
      toast.success('Task updated successfully!')
    },
    onError: (_error, { id }, context) => {
      // Rollback
      if (context?.previousTodos) {
        context.previousTodos.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data)
        })
      }
      if (context?.previousTodo) {
        queryClient.setQueryData(QUERY_KEYS.todo(id), context.previousTodo)
      }
      toast.error('Error updating task')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      // Skip API call for newly created TODOs (negative IDs)
      // They don't exist on the server
      if (id < 0) {
        return { id }
      }
      await apiClient.delete(`/todos/${id}`)
      return { id }
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.todos })

      const previousTodos = queryClient.getQueriesData<TodosWithPagination>({
        queryKey: QUERY_KEYS.todos,
      })

      // Remove from cache
      queryClient.setQueriesData<TodosWithPagination>(
        { queryKey: QUERY_KEYS.todos },
        (old) => {
          if (!old || !old.todos) return old
          return {
            ...old,
            todos: old.todos.filter((t) => t.id !== id),
            total: old.total - 1,
          }
        }
      )
      queryClient.removeQueries({ queryKey: QUERY_KEYS.todo(id) })

      return { previousTodos, id }
    },
    onSuccess: () => {
      toast.success('Task deleted successfully!')
    },
    onError: (_error, _id, context) => {
      if (context?.previousTodos) {
        context.previousTodos.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data)
        })
      }
      toast.error('Error deleting task')
    },
  })

  return {
    createTodo: async (payload) => {
      await createMutation.mutateAsync(payload)
    },
    updateTodo: async (id, payload) => {
      await updateMutation.mutateAsync({ id, payload, queryClient })
    },
    deleteTodo: async (id) => {
      await deleteMutation.mutateAsync(id)
    },
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  }
}
