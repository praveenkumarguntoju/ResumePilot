'use client'

import { useState } from 'react'
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { ApplicationCard } from '@/components/application-card'
import { ApplicationColumn } from '@/components/application-column'
import { Card } from '@/components/ui/card'

type Application = {
  id: string
  company: string
  role: string
  status: string
  dateApplied: Date
  notes: string | null
}

const STATUSES = [
  { id: 'applied', label: 'Applied', color: 'bg-blue-100 dark:bg-blue-900/20' },
  { id: 'interviewing', label: 'Interviewing', color: 'bg-yellow-100 dark:bg-yellow-900/20' },
  { id: 'offer', label: 'Offer', color: 'bg-green-100 dark:bg-green-900/20' },
  { id: 'rejected', label: 'Rejected', color: 'bg-red-100 dark:bg-red-900/20' },
]

export function ApplicationBoard({ initialApplications }: { initialApplications: Application[] }) {
  const [applications, setApplications] = useState(initialApplications)
  const [activeId, setActiveId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    
    if (!over) {
      setActiveId(null)
      return
    }

    const applicationId = active.id as string
    const newStatus = over.id as string

    const application = applications.find(app => app.id === applicationId)
    
    if (application && application.status !== newStatus) {
      setApplications(apps =>
        apps.map(app =>
          app.id === applicationId ? { ...app, status: newStatus } : app
        )
      )

      try {
        await fetch('/api/applications/update', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: applicationId, status: newStatus }),
        })
      } catch (error) {
        console.error('Failed to update application:', error)
        setApplications(apps =>
          apps.map(app =>
            app.id === applicationId ? { ...app, status: application.status } : app
          )
        )
      }
    }

    setActiveId(null)
  }

  const activeApplication = activeId ? applications.find(app => app.id === activeId) : null

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {STATUSES.map(status => {
          const statusApplications = applications.filter(app => app.status === status.id)
          
          return (
            <ApplicationColumn
              key={status.id}
              id={status.id}
              label={status.label}
              color={status.color}
              count={statusApplications.length}
            >
              <SortableContext
                items={statusApplications.map(app => app.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3">
                  {statusApplications.map(application => (
                    <ApplicationCard
                      key={application.id}
                      application={application}
                    />
                  ))}
                </div>
              </SortableContext>
            </ApplicationColumn>
          )
        })}
      </div>

      <DragOverlay>
        {activeApplication ? (
          <Card className="p-4 cursor-grabbing opacity-90">
            <ApplicationCard application={activeApplication} />
          </Card>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
