import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { analyzeResumeVsJD } from '@/lib/ai/analyze'

export const maxDuration = 60 // Allow up to 60s for OpenAI

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { applicationId, resumeId } = await request.json()

    if (!applicationId) {
      return NextResponse.json({ error: 'Application ID is required' }, { status: 400 })
    }


    // Fetch Application (for JD)
    const { data: application } = await supabase
      .from('applications')
      .select('job_description')
      .eq('id', applicationId)
      .eq('user_id', user.id)
      .single()

    if (!application || !application.job_description) {
      return NextResponse.json({ error: 'Job description is missing for this application' }, { status: 400 })
    }

    // Fetch Resume
    let finalResumeId = resumeId
    if (!finalResumeId) {
      // Get default resume or the most recently uploaded one
      const { data: defaultResume } = await supabase
        .from('resumes')
        .select('id, extracted_text')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(1)
        .single()
        
      if (defaultResume) {
        finalResumeId = defaultResume.id
      }
    }

    if (!finalResumeId) {
      return NextResponse.json({ error: 'No resume provided or no default resume found' }, { status: 400 })
    }

    const { data: resume } = await supabase
      .from('resumes')
      .select('extracted_text')
      .eq('id', finalResumeId)
      .eq('user_id', user.id)
      .single()

    if (!resume || !resume.extracted_text) {
      return NextResponse.json({ error: 'Resume text is missing' }, { status: 400 })
    }

    // Run Analysis
    const analysisResult = await analyzeResumeVsJD(resume.extracted_text, application.job_description)

    // Save to DB
    const { data: savedAnalysis, error: dbError } = await supabase
      .from('ai_analyses')
      .insert({
        user_id: user.id,
        application_id: applicationId,
        resume_id: finalResumeId,
        overall_score: analysisResult.overall_score,
        skill_matches: analysisResult.skill_matches,
        experience_analysis: analysisResult.experience_analysis,
        education_analysis: analysisResult.education_analysis,
        recommendations: analysisResult.recommendations,
        raw_response: JSON.stringify(analysisResult)
      })
      .select()
      .single()

    if (dbError) {
      console.error('Failed to save analysis:', dbError)
    }


    return NextResponse.json({ success: true, analysis: savedAnalysis || analysisResult })

  } catch (error: any) {
    console.error('Analysis error:', error)
    return NextResponse.json({ 
      error: 'Analysis failed', 
      message: error.message || 'An unexpected error occurred' 
    }, { status: 500 })
  }
}
