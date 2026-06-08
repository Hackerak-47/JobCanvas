import { createClient } from '@/lib/supabase/server'
import { ResumeUploader } from '@/components/ResumeUploader'
import { FileText, CheckCircle2, Trash2 } from 'lucide-react'
import type { Resume } from '@/lib/supabase/types'
import './resumes.css'

export default async function ResumesPage() {
  const supabase = await createClient()
  const { data: resumes } = await supabase
    .from('resumes')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="resumes-page">
      <div className="dashboard-header-text animate-slide-up">
        <h1 className="gradient-text">Resume Management</h1>
        <p className="text-secondary">Upload your resumes for AI analysis against job descriptions</p>
      </div>

      <div className="resumes-content">
        <div className="resume-uploader-section animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <ResumeUploader />
        </div>

        <div className="resumes-list-section animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <h2>Your Resumes</h2>
          {resumes && resumes.length > 0 ? (
            <div className="resumes-grid">
              {(resumes as Resume[]).map((resume) => (
                <div key={resume.id} className={`glass-card resume-card ${resume.is_default ? 'default-resume' : ''}`}>
                  <div className="resume-icon">
                    <FileText size={32} className={resume.is_default ? 'text-indigo-400' : 'text-muted'} />
                  </div>
                  <div className="resume-details">
                    <div className="resume-name truncate" title={resume.file_name}>{resume.file_name}</div>
                    <div className="resume-meta text-xs text-muted">
                      {new Date(resume.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="resume-actions">
                    {resume.is_default ? (
                      <span className="badge badge-indigo flex-center gap-1">
                        <CheckCircle2 size={12} /> Default
                      </span>
                    ) : (
                      <form action={async () => {
                        'use server'
                        const supabase = await createClient()
                        // Unset previous default
                        await supabase.from('resumes').update({ is_default: false }).neq('id', resume.id)
                        // Set new default
                        await supabase.from('resumes').update({ is_default: true }).eq('id', resume.id)
                      }}>
                        <button type="submit" className="btn-secondary btn-sm">Set Default</button>
                      </form>
                    )}
                    
                    <form action={async () => {
                      'use server'
                      const supabase = await createClient()
                      await supabase.from('resumes').delete().eq('id', resume.id)
                      // Also delete from storage
                      if (resume.file_url) {
                        const path = resume.file_url.split('/').pop()
                        if (path) await supabase.storage.from('resumes').remove([path])
                      }
                    }}>
                      <button type="submit" className="text-red-400 hover:text-red-500" title="Delete">
                        <Trash2 size={16} />
                      </button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="kanban-empty">
              No resumes uploaded yet. Upload your first resume above.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
