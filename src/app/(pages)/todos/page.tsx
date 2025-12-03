'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Plus, LogOut } from 'lucide-react'
import { TodoList } from '@/components/todos/todo-list'
import { TodoPagination } from '@/components/todos/todo-pagination'
import { CreateTodoDialog } from '@/components/todos/create-todo-dialog'
import { useTodos, useTodoMutations } from '@/hooks/use-todos'
import { useAuth } from '@/features/auth/hooks/use-auth'

export default function TodosPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const page = parseInt(searchParams.get('page') || '1', 10)

  const [isCreateOpen, setIsCreateOpen] = useState(false)

  const { user, logout, isLoggingOut } = useAuth()
  const { todos, totalPages, isLoading } = useTodos({ page })
  const { createTodo, updateTodo, deleteTodo, isCreating, isUpdating, isDeleting } =
    useTodoMutations()

  const handlePageChange = (newPage: number) => {
    router.push(`/todos?page=${newPage}`)
  }

  const handleToggle = async (id: number, completed: boolean) => {
    await updateTodo(id, { completed })
  }

  const handleDelete = async (id: number) => {
    await deleteTodo(id)
  }

  const handleCreate = async (todo: string) => {
    await createTodo({ todo, completed: false })
  }

  if (isLoading) {
    return (
      <main className="mx-auto max-w-2xl p-4">
        <div className="flex flex-col gap-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-2xl p-4">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Minhas Tarefas</h1>
          {user && (
            <p className="text-sm text-muted-foreground">
              Olá, {user.firstName}!
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Tarefa
          </Button>

          <Button variant="outline" onClick={logout} disabled={isLoggingOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Sair
          </Button>
        </div>
      </header>

      <TodoList
        todos={todos}
        onToggle={handleToggle}
        onDelete={handleDelete}
        isUpdating={isUpdating}
        isDeleting={isDeleting}
      />

      <div className="mt-6">
        <TodoPagination
          page={page}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>

      <CreateTodoDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSubmit={handleCreate}
        isLoading={isCreating}
      />
    </main>
  )
}
