import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
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
  const { data, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.todo(id),
    queryFn: async () => {
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
    onSuccess: (newTodo) => {
      queryClient.setQueriesData<TodosWithPagination>(
        { queryKey: QUERY_KEYS.todos },
        (old) => {
          if (!old) return old
          return {
            ...old,
            todos: [newTodo, ...old.todos],
            total: old.total + 1,
          }
        }
      )
      toast.success('Tarefa criada com sucesso!')
    },
    onError: () => {
      toast.error('Erro ao criar tarefa')
    },
  })

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: number
      payload: UpdateTodoPayload
    }) => {
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

      queryClient.setQueriesData<TodosWithPagination>(
        { queryKey: QUERY_KEYS.todos },
        (old) => {
          if (!old) return old
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

      return { previousTodos, previousTodo }
    },
    onSuccess: () => {
      toast.success('Tarefa atualizada com sucesso!')
    },
    onError: (_error, { id }, context) => {
      if (context?.previousTodos) {
        context.previousTodos.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data)
        })
      }
      if (context?.previousTodo) {
        queryClient.setQueryData(QUERY_KEYS.todo(id), context.previousTodo)
      }
      toast.error('Erro ao atualizar tarefa')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/todos/${id}`)
      return id
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.todos })

      const previousTodos = queryClient.getQueriesData<TodosWithPagination>({
        queryKey: QUERY_KEYS.todos,
      })

      queryClient.setQueriesData<TodosWithPagination>(
        { queryKey: QUERY_KEYS.todos },
        (old) => {
          if (!old) return old
          return {
            ...old,
            todos: old.todos.filter((t) => t.id !== id),
            total: old.total - 1,
          }
        }
      )

      return { previousTodos }
    },
    onSuccess: () => {
      toast.success('Tarefa excluída com sucesso!')
    },
    onError: (_error, _id, context) => {
      if (context?.previousTodos) {
        context.previousTodos.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data)
        })
      }
      toast.error('Erro ao excluir tarefa')
    },
  })

  return {
    createTodo: async (payload) => {
      await createMutation.mutateAsync(payload)
    },
    updateTodo: async (id, payload) => {
      await updateMutation.mutateAsync({ id, payload })
    },
    deleteTodo: async (id) => {
      await deleteMutation.mutateAsync(id)
    },
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  }
}
