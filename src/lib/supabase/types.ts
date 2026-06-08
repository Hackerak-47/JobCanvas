// ============================================================
// JobCanvas Database Types
// TypeScript interfaces matching the Supabase schema
// ============================================================


export type ApplicationStatus =
  | 'wishlist'
  | 'applied'
  | 'screening'
  | 'interviewing'
  | 'offer'
  | 'rejected'
  | 'accepted'

export type JobType = 'remote' | 'hybrid' | 'onsite'

// ============================================================
// Table Row Types
// ============================================================

export interface Profile {
  id: string
  full_name: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface Application {
  id: string
  user_id: string
  company_name: string
  job_title: string
  job_url: string | null
  job_description: string | null
  status: ApplicationStatus
  position_order: number
  notes: string | null
  salary_range: string | null
  location: string | null
  job_type: JobType
  applied_at: string | null
  created_at: string
  updated_at: string
}

export interface Resume {
  id: string
  user_id: string
  file_name: string
  file_url: string | null
  extracted_text: string | null
  parsed_data: Record<string, unknown> | null
  is_default: boolean
  created_at: string
}

export interface AIAnalysis {
  id: string
  user_id: string
  application_id: string
  resume_id: string | null
  overall_score: number | null
  skill_matches: SkillMatches | null
  experience_analysis: ExperienceAnalysis | null
  education_analysis: EducationAnalysis | null
  recommendations: Recommendation[] | null
  raw_response: string | null
  created_at: string
}

// ============================================================
// JSONB Column Types
// ============================================================

export interface SkillMatches {
  matched: string[]
  missing: string[]
  partial: { skill: string; gap: string }[]
}

export interface ExperienceAnalysis {
  score: number
  strengths: string[]
  gaps: string[]
}

export interface EducationAnalysis {
  score: number
  notes: string
}

export interface Recommendation {
  priority: 'high' | 'medium' | 'low'
  category: string
  suggestion: string
}
