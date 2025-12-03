import { Suspense } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { TodosContent } from '@/components/todos/todos-content'

export default function TodosPage() {
  return (
    <Suspense fallback={
      <main className="mx-auto max-w-2xl p-4">
        <div className="flex flex-col gap-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      </main>
    }>
      <TodosContent />
    </Suspense>
  )
}
