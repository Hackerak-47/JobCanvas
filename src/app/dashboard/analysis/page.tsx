import { createClient } from '@/lib/supabase/server'
import { AnalysisCard } from '@/components/AnalysisCard'
import type { AIAnalysis, Application } from '@/lib/supabase/types'
import './analysis.css'

export default async function AnalysisPage() {
  const supabase = await createClient()
  const { data: analyses } = await supabase
    .from('ai_analyses')
    .select(`
      *,
      application:applications(company_name, job_title)
    `)
    .order('created_at', { ascending: false })

  return (
    <div className="analysis-page">
      <div className="dashboard-header-text animate-slide-up">
        <h1 className="gradient-text">AI Analysis History</h1>
        <p className="text-secondary">Review your resume vs job description gap analyses</p>
      </div>

      <div className="analysis-content animate-slide-up" style={{ animationDelay: '0.1s' }}>
        {analyses && analyses.length > 0 ? (
          <div className="analysis-grid">
            {analyses.map((analysis) => (
              <AnalysisCard 
                key={analysis.id} 
                analysis={analysis as AIAnalysis & { application: Pick<Application, 'company_name' | 'job_title'> }} 
              />
            ))}
          </div>
        ) : (
          <div className="kanban-empty">
            No analyses yet. Go to your Application Board and click the Sparkles icon on a card to get started!
          </div>
        )}
      </div>
    </div>
  )
}
