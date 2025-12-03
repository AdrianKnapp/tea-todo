import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { apiClient } from '@/lib/api/client'
import { QUERY_KEYS } from '@/lib/constants'
import type { User, LoginCredentials } from '@/types/auth'

interface UseAuthReturn {
  user: User | null | undefined
  isLoading: boolean
  isAuthenticated: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => Promise<void>
  isLoggingIn: boolean
  isLoggingOut: boolean
  loginError: Error | null
}

export const useAuth = (): UseAuthReturn => {
  const router = useRouter()
  const queryClient = useQueryClient()

  const {
    data: user,
    isLoading,
    error,
  } = useQuery({
    queryKey: QUERY_KEYS.user,
    queryFn: async () => {
      const { data } = await apiClient.get<User>('/auth/me')
      return data
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
  })

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const { data } = await apiClient.post<User>('/auth/login', credentials)
      return data
    },
    onSuccess: (data) => {
      queryClient.setQueryData(QUERY_KEYS.user, data)
      router.push('/todos')
    },
  })

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiClient.post('/auth/logout')
    },
    onSuccess: () => {
      queryClient.clear()
      router.push('/auth')
    },
  })

  return {
    user,
    isLoading,
    isAuthenticated: !!user && !error,
    login: async (username: string, password: string) => {
      await loginMutation.mutateAsync({ username, password })
    },
    logout: async () => {
      await logoutMutation.mutateAsync()
    },
    isLoggingIn: loginMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
    loginError: loginMutation.error,
  }
}
