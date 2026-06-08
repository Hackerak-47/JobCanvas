'use client'

import { useMemo } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Plus } from 'lucide-react'
import { KanbanCard } from './KanbanCard'
import type { Application, ApplicationStatus } from '@/lib/supabase/types'

interface Props {
  id: ApplicationStatus
  title: string
  applications: Application[]
  onAddClick: () => void
  onEditClick: (app: Application) => void
  onDeleteClick: (id: string) => void
}

export function KanbanColumn({ id, title, applications, onAddClick, onEditClick, onDeleteClick }: Props) {
  const applicationIds = useMemo(() => applications.map(a => a.id), [applications])

  const { setNodeRef, isOver } = useDroppable({
    id,
    data: {
      type: 'Column',
      application: null,
    },
  })

  return (
    <div 
      className={`kanban-column status-${id} ${isOver ? 'drag-over' : ''}`}
      ref={setNodeRef}
    >
      <div className="kanban-column-header">
        <div className="kanban-column-title">
          <div className="kanban-column-dot" />
          {title}
        </div>
        <div className="kanban-column-count">{applications.length}</div>
      </div>

      <div className="kanban-column-body">
        <SortableContext items={applicationIds} strategy={verticalListSortingStrategy}>
          {applications.map((app) => (
            <KanbanCard 
              key={app.id} 
              application={app} 
              onEdit={() => onEditClick(app)}
              onDelete={() => onDeleteClick(app.id)}
            />
          ))}
        </SortableContext>

        {applications.length === 0 && (
          <div className="kanban-empty">
            No applications yet
          </div>
        )}

        <button className="kanban-add-btn" onClick={onAddClick}>
          <Plus size={16} />
          <span>Add Application</span>
        </button>
      </div>
    </div>
  )
}
