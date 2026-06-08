'use client'

import { useState } from 'react'
import { Sparkles, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Props {
  applicationId: string
  hasJobDescription: boolean
}

export function AnalyzeButton({ applicationId, hasJobDescription }: Props) {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleAnalyze = async () => {
    if (!hasJobDescription) {
      setError('Please add a job description to this application first.')
      return
    }

    setIsAnalyzing(true)
    setError(null)

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationId }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || data.error || 'Failed to analyze')
      }

      // Success! Redirect to analysis page
      router.push('/dashboard/analysis')
      router.refresh()
      
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="analyze-btn-container">
      <button 
        onClick={handleAnalyze} 
        disabled={isAnalyzing}
        className="btn-primary btn-sm flex-center gap-2"
        style={{ width: '100%' }}
      >
        {isAnalyzing ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            <span>Analyzing...</span>
          </>
        ) : (
          <>
            <Sparkles size={16} />
            <span>AI Match Analysis</span>
          </>
        )}
      </button>
      
      {error && (
        <div className="text-xs text-red-400 mt-2 text-center">
          {error}
        </div>
      )}
    </div>
  )
}
