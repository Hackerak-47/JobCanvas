import { createClient } from '@/lib/supabase/server'
import { KanbanBoard } from '@/components/kanban/KanbanBoard'
import type { Application } from '@/lib/supabase/types'
import './board.css'

export default async function BoardPage() {
  const supabase = await createClient()
  const { data: applications } = await supabase
    .from('applications')
    .select('*')
    .order('position_order', { ascending: true })
  
  return (
    <div className="board-page">
      <div className="board-header animate-slide-up">
        <div>
          <h1 className="gradient-text">Application Board</h1>
          <p className="text-secondary">Organize your job search and never miss an opportunity</p>
        </div>
      </div>
      <div className="board-content animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <KanbanBoard initialApplications={(applications || []) as Application[]} />
      </div>
    </div>
  )
}
