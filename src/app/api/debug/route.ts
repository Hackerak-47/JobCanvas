import { NextResponse } from 'next/server'

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  return NextResponse.json({
    supabaseUrlStatus: url ? (url.startsWith('https://') ? 'Valid format' : 'INVALID: Must start with https://') : 'MISSING',
    supabaseUrlLength: url?.length || 0,
    supabaseUrlContainsQuotes: url?.includes('"') || url?.includes("'") ? 'YES (BAD)' : 'NO (GOOD)',
    supabaseUrlHasTrailingSlash: url?.endsWith('/') ? 'YES (BAD)' : 'NO (GOOD)',
    
    supabaseKeyStatus: key ? 'PRESENT' : 'MISSING',
    supabaseKeyLength: key?.length || 0,
    supabaseKeyContainsQuotes: key?.includes('"') || key?.includes("'") ? 'YES (BAD)' : 'NO (GOOD)',
    
    geminiKeyStatus: process.env.GEMINI_API_KEY ? 'PRESENT' : 'MISSING',
    
    NODE_ENV: process.env.NODE_ENV,
    NEXT_RUNTIME: process.env.NEXT_RUNTIME
  })
}
