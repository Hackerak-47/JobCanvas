'use client'

import { useState, useTransition, useEffect } from 'react'
import { createApplication, updateApplication } from '@/actions/applications'
import type { Application, ApplicationStatus, JobType } from '@/lib/supabase/types'

interface Props {
  isOpen: boolean
  onClose: () => void
  targetStatus: ApplicationStatus
  editApplication: Application | null
}

export function AddApplicationModal({ isOpen, onClose, targetStatus, editApplication }: Props) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleSubmit = async (formData: FormData) => {
    setError(null)
    formData.append('status', editApplication ? editApplication.status : targetStatus)
    
    startTransition(async () => {
      let res
      if (editApplication) {
        res = await updateApplication(editApplication.id, formData)
      } else {
        res = await createApplication(formData)
      }
      
      if (res?.error) {
        setError(res.error)
      } else {
        onClose()
      }
    })
  }

  return (
    <div className="modal-overlay animate-fade-in" onPointerDown={onClose}>
      <div className="modal-content animate-scale-in" onPointerDown={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{editApplication ? 'Edit Application' : 'Add Application'}</h2>
          <button className="btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>

        {error && <div className="auth-error mb-4">{error}</div>}

        <form action={handleSubmit} className="auth-form mt-4">
          <div className="form-grid">
            <div className="auth-form-group">
              <label htmlFor="companyName">Company Name *</label>
              <input type="text" id="companyName" name="companyName" className="input-field" required defaultValue={editApplication?.company_name || ''} />
            </div>
            
            <div className="auth-form-group">
              <label htmlFor="jobTitle">Job Title *</label>
              <input type="text" id="jobTitle" name="jobTitle" className="input-field" required defaultValue={editApplication?.job_title || ''} />
            </div>
          </div>

          <div className="auth-form-group">
            <label htmlFor="jobUrl">Job URL</label>
            <input type="url" id="jobUrl" name="jobUrl" className="input-field" placeholder="https://..." defaultValue={editApplication?.job_url || ''} />
          </div>

          <div className="form-grid">
            <div className="auth-form-group">
              <label htmlFor="location">Location</label>
              <input type="text" id="location" name="location" className="input-field" placeholder="e.g. San Francisco, CA" defaultValue={editApplication?.location || ''} />
            </div>

            <div className="auth-form-group">
              <label htmlFor="jobType">Job Type</label>
              <select id="jobType" name="jobType" className="select-field" defaultValue={editApplication?.job_type || 'remote'}>
                <option value="remote">Remote</option>
                <option value="hybrid">Hybrid</option>
                <option value="onsite">On-site</option>
              </select>
            </div>
          </div>
          
          <div className="auth-form-group">
            <label htmlFor="salaryRange">Salary Range</label>
            <input type="text" id="salaryRange" name="salaryRange" className="input-field" placeholder="e.g. $120k - $150k" defaultValue={editApplication?.salary_range || ''} />
          </div>

          <div className="auth-form-group">
            <label htmlFor="jobDescription">Job Description</label>
            <textarea id="jobDescription" name="jobDescription" className="textarea-field" rows={4} placeholder="Paste the job description here for AI analysis..." defaultValue={editApplication?.job_description || ''} />
          </div>

          <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-subtle">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={isPending}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={isPending}>
              {isPending ? 'Saving...' : 'Save Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
