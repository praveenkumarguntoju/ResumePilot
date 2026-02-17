'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Building2, Calendar, GripVertical } from 'lucide-react'
import { format } from 'date-fns'

type Application = {
  id: string
  company: string
  role: string
  status: string
  dateApplied: Date
  notes: string | null
}

export function ApplicationCard({ application }: { application: Application }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: application.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style}>
      <Card className="cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-sm font-semibold line-clamp-1">
              {application.role}
            </CardTitle>
            <button
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
            >
              <GripVertical className="h-4 w-4" />
            </button>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
            <Building2 className="h-3 w-3" />
            <span className="line-clamp-1">{application.company}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <Calendar className="h-3 w-3" />
            <span>{format(new Date(application.dateApplied), 'MMM d, yyyy')}</span>
          </div>
          {application.notes && (
            <p className="text-xs text-zinc-500 line-clamp-2 mt-2">
              {application.notes}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
