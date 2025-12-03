'use client'

import { use, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowLeft, Save, Trash2 } from 'lucide-react'
import { useTodo, useTodoMutations } from '@/hooks/use-todos'

interface TodoDetailPageProps {
  params: Promise<{ id: string }>
}

export default function TodoDetailPage({ params }: TodoDetailPageProps) {
  const { id } = use(params)
  const todoId = parseInt(id, 10)
  const router = useRouter()

  const { todo, isLoading, error } = useTodo(todoId)
  const { updateTodo, deleteTodo, isUpdating, isDeleting } = useTodoMutations()

  const [editedTodo, setEditedTodo] = useState('')
  const [editedCompleted, setEditedCompleted] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  const handleEdit = () => {
    if (todo) {
      setEditedTodo(todo.todo)
      setEditedCompleted(todo.completed)
      setIsEditing(true)
    }
  }

  const handleSave = async () => {
    await updateTodo(todoId, {
      todo: editedTodo,
      completed: editedCompleted,
    })
    setIsEditing(false)
  }

  const handleDelete = async () => {
    await deleteTodo(todoId)
    router.push('/todos')
  }

  if (isLoading) {
    return (
      <main className="mx-auto max-w-2xl p-4">
        <Skeleton className="mb-4 h-10 w-24" />
        <Skeleton className="h-64 w-full" />
      </main>
    )
  }

  if (error || !todo) {
    return (
      <main className="mx-auto max-w-2xl p-4">
        <Button variant="ghost" onClick={() => router.push('/todos')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
        <div className="mt-8 text-center text-muted-foreground">
          Tarefa não encontrada
        </div>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-2xl p-4">
      <Button
        variant="ghost"
        onClick={() => router.push('/todos')}
        className="mb-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Voltar para Tarefas
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Detalhes da Tarefa</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Tarefa</label>
            {isEditing ? (
              <Input
                value={editedTodo}
                onChange={(e) => setEditedTodo(e.target.value)}
              />
            ) : (
              <p className="rounded-md border p-3">{todo.todo}</p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="completed"
              checked={isEditing ? editedCompleted : todo.completed}
              disabled={!isEditing}
              onCheckedChange={(checked) =>
                setEditedCompleted(checked as boolean)
              }
            />
            <label htmlFor="completed" className="text-sm">
              Concluída
            </label>
          </div>

          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <Button onClick={handleSave} disabled={isUpdating}>
                  <Save className="mr-2 h-4 w-4" />
                  {isUpdating ? 'Salvando...' : 'Salvar'}
                </Button>
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancelar
                </Button>
              </>
            ) : (
              <>
                <Button onClick={handleEdit}>Editar</Button>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  {isDeleting ? 'Excluindo...' : 'Excluir'}
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
