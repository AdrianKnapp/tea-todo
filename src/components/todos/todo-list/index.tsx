'use client'

import { type FC } from 'react'
import { TodoItem } from '../todo-item'
import type { Todo } from '@/types/todo'

interface TodoListProps {
  todos: Todo[]
  onToggle: (id: number, completed: boolean) => void
  onDelete: (id: number) => void
  isUpdating?: boolean
  isDeleting?: boolean
}

export const TodoList: FC<TodoListProps> = ({
  todos,
  onToggle,
  onDelete,
  isUpdating,
  isDeleting,
}) => {
  if (todos.length === 0) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        No tasks found. Create one to get started!
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {todos.map((todo) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggle={onToggle}
          onDelete={onDelete}
          isUpdating={isUpdating}
          isDeleting={isDeleting}
        />
      ))}
    </div>
  )
}
