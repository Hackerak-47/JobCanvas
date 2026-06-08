import { GoogleGenerativeAI, Schema, SchemaType } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

const analysisSchema: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    overall_score: {
      type: SchemaType.INTEGER,
      description: '0-100 score of how well the resume matches the job description',
    },
    reasoning: {
      type: SchemaType.STRING,
      description: 'Chain of thought reasoning for the score and analysis',
    },
    skill_matches: {
      type: SchemaType.OBJECT,
      properties: {
        matched: {
          type: SchemaType.ARRAY,
          items: { type: SchemaType.STRING },
          description: 'Skills found in both resume and job description',
        },
        missing: {
          type: SchemaType.ARRAY,
          items: { type: SchemaType.STRING },
          description: 'Important skills in JD that are missing from resume',
        },
        partial: {
          type: SchemaType.ARRAY,
          items: {
            type: SchemaType.OBJECT,
            properties: {
              skill: { type: SchemaType.STRING },
              gap: { type: SchemaType.STRING },
            },
            required: ['skill', 'gap'],
          },
          description: 'Skills partially matching or related but not exact',
        },
      },
      required: ['matched', 'missing', 'partial'],
    },
    experience_analysis: {
      type: SchemaType.OBJECT,
      properties: {
        score: {
          type: SchemaType.INTEGER,
          description: '0-100 score for experience match',
        },
        strengths: {
          type: SchemaType.ARRAY,
          items: { type: SchemaType.STRING },
        },
        gaps: {
          type: SchemaType.ARRAY,
          items: { type: SchemaType.STRING },
        },
      },
      required: ['score', 'strengths', 'gaps'],
    },
    education_analysis: {
      type: SchemaType.OBJECT,
      properties: {
        score: {
          type: SchemaType.INTEGER,
          description: '0-100 score for education match',
        },
        notes: {
          type: SchemaType.STRING,
        },
      },
      required: ['score', 'notes'],
    },
    recommendations: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          priority: {
            type: SchemaType.STRING,
            description: 'Must be one of: high, medium, low',
          },
          category: { type: SchemaType.STRING },
          suggestion: {
            type: SchemaType.STRING,
            description: 'Actionable advice for the candidate to improve their resume or prepare for interview',
          },
        },
        required: ['priority', 'category', 'suggestion'],
      },
    },
  },
  required: [
    'overall_score',
    'reasoning',
    'skill_matches',
    'experience_analysis',
    'education_analysis',
    'recommendations',
  ],
}

export type AnalysisResult = {
  overall_score: number
  reasoning: string
  skill_matches: {
    matched: string[]
    missing: string[]
    partial: { skill: string; gap: string }[]
  }
  experience_analysis: {
    score: number
    strengths: string[]
    gaps: string[]
  }
  education_analysis: {
    score: number
    notes: string
  }
  recommendations: {
    priority: 'high' | 'medium' | 'low'
    category: string
    suggestion: string
  }[]
}

export async function analyzeResumeVsJD(resumeText: string, jobDescription: string): Promise<AnalysisResult> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured')
  }

  const model = genAI.getGenerativeModel({
    model: 'gemini-flash-latest',
    generationConfig: {
      responseMimeType: 'application/json',
      responseSchema: analysisSchema,
      temperature: 0.2,
    },
  })

  const systemPrompt = `You are an expert technical recruiter and ATS (Applicant Tracking System) simulator.
Your job is to objectively analyze a candidate's resume against a specific job description.
Be highly critical but constructive. Identify exact skill matches, missing critical requirements, and provide actionable recommendations.
Output your analysis following the exact JSON structure requested.`

  const userPrompt = `
SYSTEM INSTRUCTIONS:
${systemPrompt}

JOB DESCRIPTION:
${jobDescription}

-----------------
CANDIDATE RESUME:
${resumeText}

Analyze the resume against the job description.`

  const result = await model.generateContent(userPrompt)
  const response = result.response.text()
  
  if (!response) {
    throw new Error('Failed to parse AI response')
  }

  return JSON.parse(response) as AnalysisResult
}
