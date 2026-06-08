'use client'

import { useState, useEffect } from 'react'
import { Check, X, Minus } from 'lucide-react'
import type { AIAnalysis, Application } from '@/lib/supabase/types'

interface Props {
  analysis: AIAnalysis & { application?: Pick<Application, 'company_name' | 'job_title'> }
}

export function AnalysisCard({ analysis }: Props) {
  const [mounted, setMounted] = useState(false)
  const score = analysis.overall_score || 0
  
  useEffect(() => {
    setMounted(true)
  }, [])

  const getScoreColor = (s: number) => {
    if (s >= 70) return 'var(--status-accepted)'
    if (s >= 40) return '#eab308'
    return 'var(--status-rejected)'
  }

  const scoreColor = getScoreColor(score)
  const circumference = 2 * Math.PI * 28 // r=28
  const strokeDashoffset = circumference - (score / 100) * circumference

  return (
    <div className="glass-card analysis-card">
      <div className="analysis-card-header">
        <div className="analysis-job-info">
          <h3>{analysis.application?.company_name || 'Unknown Company'}</h3>
          <p>{analysis.application?.job_title || 'Application'} Analysis</p>
          <p className="text-xs text-muted mt-1">{new Date(analysis.created_at).toLocaleDateString()}</p>
        </div>
        
        <div className="score-gauge">
          <svg viewBox="0 0 64 64">
            <circle cx="32" cy="32" r="28" className="score-gauge-bg" />
            <circle 
              cx="32" cy="32" r="28" 
              className="score-gauge-fill"
              style={{ 
                stroke: scoreColor,
                strokeDasharray: mounted ? `${circumference} ${circumference}` : `0 ${circumference}`,
                strokeDashoffset: mounted ? strokeDashoffset : circumference
              }} 
            />
          </svg>
          <div className="score-text" style={{ color: scoreColor }}>{score}</div>
        </div>
      </div>

      {analysis.skill_matches && (
        <div className="analysis-section">
          <h4>Skill Gap Analysis</h4>
          <div className="skills-grid">
            {analysis.skill_matches.matched?.map((skill, i) => (
              <div key={`matched-${i}`} className="skill-pill matched">
                <Check size={14} className="text-emerald-500" />
                <span className="text-primary">{skill}</span>
              </div>
            ))}
            
            {analysis.skill_matches.partial?.map((item, i) => (
              <div key={`partial-${i}`} className="skill-pill partial">
                <Minus size={14} className="text-yellow-500" />
                <div>
                  <span className="text-primary block">{item.skill}</span>
                  <span className="text-xs text-secondary">{item.gap}</span>
                </div>
              </div>
            ))}

            {analysis.skill_matches.missing?.map((skill, i) => (
              <div key={`missing-${i}`} className="skill-pill missing">
                <X size={14} className="text-rose-500" />
                <span className="text-primary">{skill}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {analysis.recommendations && analysis.recommendations.length > 0 && (
        <div className="analysis-section">
          <h4>Actionable Recommendations</h4>
          <div className="recommendations-list">
            {analysis.recommendations.map((rec, i) => (
              <div key={i} className={`recommendation-item priority-${rec.priority}`}>
                <div className="recommendation-header">
                  <span className="recommendation-category">{rec.category}</span>
                  <span className="recommendation-priority" style={{
                    color: rec.priority === 'high' ? 'var(--status-rejected)' : 
                           rec.priority === 'medium' ? '#eab308' : 'var(--status-applied)'
                  }}>
                    {rec.priority} Priority
                  </span>
                </div>
                <div className="recommendation-suggestion">{rec.suggestion}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
