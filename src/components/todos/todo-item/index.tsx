'use client'

import { type FC } from 'react'
import { useRouter } from 'next/navigation'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Trash2, Eye } from 'lucide-react'
import type { Todo } from '@/types/todo'

interface TodoItemProps {
  todo: Todo
  onToggle: (id: number, completed: boolean) => void
  onDelete: (id: number) => void
  isUpdating?: boolean
  isDeleting?: boolean
}

export const TodoItem: FC<TodoItemProps> = ({
  todo,
  onToggle,
  onDelete,
  isUpdating,
  isDeleting,
}) => {
  const router = useRouter()

  const handleViewDetails = () => {
    router.push(`/todos?selected=${todo.id}`)
  }

  return (
    <div className="flex items-center gap-4 rounded-lg border p-4">
      <Checkbox
        checked={todo.completed}
        disabled={isUpdating}
        onCheckedChange={(checked) => onToggle(todo.id, checked as boolean)}
      />

      <span
        className={`flex-1 ${
          todo.completed ? 'text-muted-foreground line-through' : ''
        }`}
      >
        {todo.todo}
      </span>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={handleViewDetails}>
          <Eye className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(todo.id)}
          disabled={isDeleting}
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>
    </div>
  )
}
