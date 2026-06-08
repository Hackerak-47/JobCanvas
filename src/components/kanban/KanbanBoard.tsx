'use client'

import { useState, useCallback, useTransition } from 'react'
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragOverEvent,
  type DragEndEvent,
  defaultDropAnimationSideEffects,
} from '@dnd-kit/core'
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { KanbanColumn } from './KanbanColumn'
import { KanbanCard } from './KanbanCard'
import { AddApplicationModal } from './AddApplicationModal'
import { moveApplication, deleteApplication } from '@/actions/applications'
import type { Application, ApplicationStatus } from '@/lib/supabase/types'

const COLUMNS: { id: ApplicationStatus; title: string }[] = [
  { id: 'wishlist', title: 'Wishlist' },
  { id: 'applied', title: 'Applied' },
  { id: 'screening', title: 'Screening' },
  { id: 'interviewing', title: 'Interviewing' },
  { id: 'offer', title: 'Offer' },
  { id: 'rejected', title: 'Rejected' },
  { id: 'accepted', title: 'Accepted' },
]

export function KanbanBoard({ initialApplications }: { initialApplications: Application[] }) {
  const [applications, setApplications] = useState<Application[]>(initialApplications)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [activeApplication, setActiveApplication] = useState<Application | null>(null)
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [addModalStatus, setAddModalStatus] = useState<ApplicationStatus>('wishlist')
  const [editingApplication, setEditingApplication] = useState<Application | null>(null)
  
  const [isPending, startTransition] = useTransition()

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    setActiveId(active.id as string)
    const app = applications.find(a => a.id === active.id)
    if (app) setActiveApplication(app)
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event
    if (!over) return

    const activeId = active.id
    const overId = over.id

    if (activeId === overId) return

    const isActiveTask = active.data.current?.type === 'Task'
    const isOverTask = over.data.current?.type === 'Task'
    const isOverColumn = over.data.current?.type === 'Column'

    if (!isActiveTask) return

    setApplications((apps) => {
      const activeIndex = apps.findIndex((t) => t.id === activeId)
      const overIndex = apps.findIndex((t) => t.id === overId)

      if (isActiveTask && isOverTask && apps[activeIndex].status !== apps[overIndex].status) {
        const newApps = [...apps]
        newApps[activeIndex].status = apps[overIndex].status
        return arrayMove(newApps, activeIndex, overIndex)
      }

      if (isActiveTask && isOverColumn) {
        const newApps = [...apps]
        newApps[activeIndex].status = overId as ApplicationStatus
        return arrayMove(newApps, activeIndex, activeIndex) // Just change status, position handled on end
      }

      return apps
    })
  }

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null)
    setActiveApplication(null)
    
    const { active, over } = event
    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    if (activeId === overId) return

    setApplications((apps) => {
      const activeIndex = apps.findIndex((t) => t.id === activeId)
      const overIndex = apps.findIndex((t) => t.id === overId)
      
      const newApps = arrayMove(apps, activeIndex, overIndex)
      
      // Update position_order for affected items
      const status = newApps[overIndex].status
      const colApps = newApps.filter(a => a.status === status)
      
      const finalOrder = colApps.findIndex(a => a.id === activeId)
      
      // Send update to server
      startTransition(() => {
        moveApplication(activeId, status, finalOrder)
      })

      return newApps
    })
  }

  const openAddModal = (status: ApplicationStatus) => {
    setAddModalStatus(status)
    setEditingApplication(null)
    setIsAddModalOpen(true)
  }

  const openEditModal = (app: Application) => {
    setAddModalStatus(app.status)
    setEditingApplication(app)
    setIsAddModalOpen(true)
  }

  const handleDelete = (id: string) => {
    setApplications(apps => apps.filter(a => a.id !== id))
    startTransition(() => {
      deleteApplication(id)
    })
  }

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="kanban-container">
          {COLUMNS.map((col) => (
            <KanbanColumn
              key={col.id}
              id={col.id}
              title={col.title}
              applications={applications.filter(a => a.status === col.id)}
              onAddClick={() => openAddModal(col.id)}
              onEditClick={openEditModal}
              onDeleteClick={handleDelete}
            />
          ))}
        </div>

        <DragOverlay dropAnimation={{ sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: '0.5' } } }) }}>
          {activeId && activeApplication ? (
            <div className={`drag-overlay-card status-${activeApplication.status}`}>
              <div className="kanban-card-company">{activeApplication.company_name}</div>
              <div className="kanban-card-title">{activeApplication.job_title}</div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <AddApplicationModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        targetStatus={addModalStatus}
        editApplication={editingApplication}
      />
    </>
  )
}
