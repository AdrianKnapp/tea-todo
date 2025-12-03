"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Save, Trash2 } from "lucide-react";
import { useTodo, useTodoMutations } from "@/hooks/use-todos";

interface TodoDetailDialogProps {
  todoId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const TodoDetailDialog: React.FC<TodoDetailDialogProps> = ({
  todoId,
  open,
  onOpenChange,
}) => {
  const { todo, isLoading, error } = useTodo(todoId);
  const { updateTodo, deleteTodo, isUpdating, isDeleting } = useTodoMutations();

  const [editedTodo, setEditedTodo] = useState("");
  const [editedCompleted, setEditedCompleted] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const handleEdit = () => {
    if (todo) {
      setEditedTodo(todo.todo);
      setEditedCompleted(todo.completed);
      setIsEditing(true);
    }
  };

  const handleSave = async () => {
    await updateTodo(todoId, {
      todo: editedTodo,
      completed: editedCompleted,
    });
    setIsEditing(false);
  };

  const handleDelete = async () => {
    await deleteTodo(todoId);
    onOpenChange(false);
  };

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Loading...</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-8 w-32" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (error || !todo) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Error</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">Task not found</p>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Task Details</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-6 py-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Task</label>
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
              Completed
            </label>
          </div>
        </div>

        <DialogFooter className="gap-2">
          {isEditing ? (
            <>
              <Button onClick={handleSave} disabled={isUpdating}>
                <Save className="mr-2 h-4 w-4" />
                {isUpdating ? "Saving..." : "Save"}
              </Button>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
            </>
          ) : (
            <>
              <Button onClick={handleEdit}>Edit</Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {isDeleting ? "Deleting..." : "Delete"}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
