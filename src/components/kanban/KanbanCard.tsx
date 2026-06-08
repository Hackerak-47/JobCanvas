'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { MapPin, Pencil, Trash2, Sparkles, Clock } from 'lucide-react'
import type { Application } from '@/lib/supabase/types'

interface Props {
  application: Application
  onEdit: () => void
  onDelete: () => void
}

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

export function KanbanCard({ application, onEdit, onDelete }: Props) {
  const router = useRouter()
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: application.id,
    data: {
      type: 'Task',
      application,
    },
  })

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  }

  const handleAnalyze = async (e: React.PointerEvent) => {
    e.stopPropagation()
    if (isAnalyzing) return
    
    if (!application.job_description || application.job_description.trim() === '') {
      alert('Please edit this application and add a Job Description first so the AI has something to analyze!')
      return
    }

    setIsAnalyzing(true)
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationId: application.id }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || data.error || 'Failed to analyze')
      
      router.push('/dashboard/analysis')
      router.refresh()
    } catch (err: any) {
      alert(err.message)
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`kanban-card status-${application.status} ${isDragging ? 'dragging' : ''}`}
    >
      <div className="kanban-card-company">{application.company_name}</div>
      <div className="kanban-card-title">{application.job_title}</div>
      
      <div className="kanban-card-meta">
        {application.location && (
          <span><MapPin size={12} /> {application.location}</span>
        )}
        <span className={`badge ${application.job_type === 'remote' ? 'badge-blue' : application.job_type === 'hybrid' ? 'badge-purple' : 'badge-yellow'}`}>
          {application.job_type}
        </span>
      </div>

      <div className="kanban-card-footer">
        {application.applied_at && (
          <span className="text-xs text-muted flex-center gap-1">
            <Clock size={12} /> 
            {new Date(application.applied_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
          </span>
        )}
        
        <div className="kanban-card-actions">
          {/* We use onPointerDown with stopPropagation so drag isn't triggered when clicking buttons */}
          <button onPointerDown={(e) => { e.stopPropagation(); onEdit() }} title="Edit">
            <Pencil size={14} />
          </button>
          <button onPointerDown={(e) => { e.stopPropagation(); onDelete() }} title="Delete" className="text-red-400 hover:text-red-500">
            <Trash2 size={14} />
          </button>
          <button onPointerDown={handleAnalyze} title="AI Analysis" disabled={isAnalyzing}>
            {isAnalyzing ? (
              <Loader2 size={14} className="text-indigo-400 animate-spin" />
            ) : (
              <Sparkles size={14} className="text-indigo-400" />
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
