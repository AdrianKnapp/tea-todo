'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Plus, LogOut, AlertCircle } from 'lucide-react'
import { TodoList } from '@/components/todos/todo-list'
import { TodoPagination } from '@/components/todos/todo-pagination'
import { CreateTodoDialog } from '@/components/todos/create-todo-dialog'
import { TodoDetailDialog } from '@/components/todos/todo-detail-dialog'
import { useTodos, useTodoMutations } from '@/hooks/use-todos'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { Skeleton } from '@/components/ui/skeleton'

export function TodosContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const page = parseInt(searchParams.get('page') || '1', 10)
  const selectedId = searchParams.get('selected')

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

  const handleDialogClose = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('selected')
    router.push(`/todos?${params.toString()}`)
  }

  // Keyboard shortcut: Press 'N' to open create todo dialog
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger if user is typing in an input, textarea, or contenteditable element
      const target = event.target as HTMLElement
      const isTyping =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.contentEditable === 'true'

      // Check if 'N' key is pressed (not case sensitive) and not typing
      if ((event.key === 'n' || event.key === 'N') && !isTyping && !event.metaKey && !event.ctrlKey) {
        event.preventDefault()
        setIsCreateOpen(true)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

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
      <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950">
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 h-5 w-5 text-amber-600 dark:text-amber-500" />
          <div className="flex-1">
            <h3 className="font-medium text-amber-900 dark:text-amber-100">
              Demo Mode
            </h3>
            <p className="mt-1 text-sm text-amber-700 dark:text-amber-300">
              This application uses a demo API (DummyJSON). All tasks created
              or modified will be lost when refreshing the page. Data is stored
              only in the browser cache during your current session.
            </p>
          </div>
        </div>
      </div>

      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Tasks</h1>
          {user && (
            <p className="text-sm text-muted-foreground">
              Hello, {user.firstName}!
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={() => setIsCreateOpen(true)} className="relative">
            <Plus className="mr-2 h-4 w-4" />
            New Task
            <kbd className="ml-2 hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border border-white/20 bg-white/10 px-1.5 font-mono text-[10px] font-medium text-white opacity-100">
              N
            </kbd>
          </Button>

          <Button variant="outline" onClick={logout} disabled={isLoggingOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
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

      {selectedId && (
        <TodoDetailDialog
          todoId={parseInt(selectedId, 10)}
          open={!!selectedId}
          onOpenChange={(open) => !open && handleDialogClose()}
        />
      )}
    </main>
  )
}
