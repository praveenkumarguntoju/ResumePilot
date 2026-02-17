'use client'

import { useDroppable } from '@dnd-kit/core'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

type ApplicationColumnProps = {
  id: string
  label: string
  color: string
  count: number
  children: React.ReactNode
}

export function ApplicationColumn({ id, label, color, count, children }: ApplicationColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id,
  })

  return (
    <div ref={setNodeRef} className="flex flex-col h-full">
      <div className={cn('rounded-t-lg p-3 mb-3', color)}>
        <h3 className="font-semibold text-sm">
          {label} <span className="text-zinc-500">({count})</span>
        </h3>
      </div>
      <div
        className={cn(
          'flex-1 rounded-lg border-2 border-dashed p-3 transition-colors min-h-[400px]',
          isOver
            ? 'border-zinc-900 bg-zinc-50 dark:border-zinc-50 dark:bg-zinc-900'
            : 'border-zinc-200 dark:border-zinc-800'
        )}
      >
        {children}
      </div>
    </div>
  )
}
