'use client'

import { useState, useCallback } from 'react'
import { UploadCloud, FileType, CheckCircle2 } from 'lucide-react'
import * as pdfjsLib from 'pdfjs-dist'
import { uploadResume } from '@/actions/resumes'

// Initialize pdf.js worker
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`
}

export function ResumeUploader() {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const extractTextFromPDF = async (file: File): Promise<string> => {
    try {
      const arrayBuffer = await file.arrayBuffer()
      const loadingTask = pdfjsLib.getDocument(new Uint8Array(arrayBuffer))
      const pdf = await loadingTask.promise
      
      let fullText = ''
      const numPages = pdf.numPages
      
      for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i)
        const textContent = await page.getTextContent()
        const pageText = textContent.items.map((item: any) => item.str).join(' ')
        fullText += pageText + '\n\n'
        
        // Update progress just for parsing phase (up to 50%)
        setProgress(Math.round((i / numPages) * 50))
      }
      
      return fullText
    } catch (err) {
      console.error('PDF parsing error:', err)
      throw new Error('Failed to parse PDF file. Ensure it is a valid text-based PDF.')
    }
  }

  const handleFile = async (file: File) => {
    setError(null)
    setSuccess(false)
    
    if (file.type !== 'application/pdf') {
      setError('Only PDF files are supported.')
      return
    }
    
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be under 10MB.')
      return
    }

    setIsUploading(true)
    setProgress(10)

    try {
      // 1. Extract text client-side
      const extractedText = await extractTextFromPDF(file)
      
      // 2. Prepare form data
      const formData = new FormData()
      formData.append('file', file)
      formData.append('extractedText', extractedText)
      
      setProgress(60) // Done parsing, uploading now
      
      // 3. Send to server
      const result = await uploadResume(formData)
      
      if (result?.error) {
        throw new Error(result.error)
      }
      
      setProgress(100)
      setSuccess(true)
      setTimeout(() => {
        setSuccess(false)
        setProgress(0)
      }, 3000)
    } catch (err: any) {
      setError(err.message || 'An error occurred during upload.')
      setProgress(0)
    } finally {
      setIsUploading(false)
    }
  }

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0])
    }
  }, [])

  const onFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0])
    }
  }

  return (
    <div className="glass-card" style={{ padding: 'var(--space-6)' }}>
      <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, marginBottom: 'var(--space-4)' }}>
        Upload New Resume
      </h2>
      
      <div 
        className={`upload-zone ${isDragging ? 'drag-active' : ''}`}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        <input 
          type="file" 
          className="upload-input" 
          accept="application/pdf"
          onChange={onFileInput}
          disabled={isUploading}
        />
        
        {success ? (
          <>
            <div className="upload-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--status-accepted)' }}>
              <CheckCircle2 size={32} />
            </div>
            <div className="upload-text" style={{ color: 'var(--status-accepted)' }}>
              Resume uploaded successfully!
            </div>
          </>
        ) : (
          <>
            <div className="upload-icon">
              <UploadCloud size={32} />
            </div>
            <div className="upload-text">
              <span style={{ fontWeight: 600 }}>Click to upload</span> or drag and drop
              <div style={{ fontSize: 'var(--text-xs)', marginTop: 4 }}>PDF only (Max 10MB)</div>
            </div>
          </>
        )}
      </div>

      {error && <div className="auth-error" style={{ marginTop: 'var(--space-4)' }}>{error}</div>}

      {isUploading && (
        <div className="upload-progress">
          <div className="upload-progress-bar" style={{ width: `${progress}%` }} />
        </div>
      )}
    </div>
  )
}
