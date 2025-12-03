'use client'

import { type FC, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface CreateTodoDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (todo: string) => Promise<void>
  isLoading?: boolean
}

export const CreateTodoDialog: FC<CreateTodoDialogProps> = ({
  open,
  onOpenChange,
  onSubmit,
  isLoading,
}) => {
  const [todo, setTodo] = useState('')

  const handleSubmit = async () => {
    if (!todo.trim()) return

    await onSubmit(todo)
    setTodo('')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="todo">Task</Label>
            <Input
              id="todo"
              value={todo}
              onChange={(e) => setTodo(e.target.value)}
              placeholder="What needs to be done?"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSubmit()
                }
              }}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading || !todo.trim()}>
            {isLoading ? 'Creating...' : 'Create'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
