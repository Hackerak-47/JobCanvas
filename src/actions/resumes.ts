'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function uploadResume(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const file = formData.get('file') as File
  const extractedText = formData.get('extractedText') as string

  if (!file) return { error: 'No file provided' }

  // 1. Upload to Supabase Storage
  const fileExt = file.name.split('.').pop()
  const fileName = `${user.id}/${Date.now()}.${fileExt}`
  
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('resumes')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false
    })

  if (uploadError) return { error: uploadError.message }

  // Check if this is the user's first resume
  const { count } = await supabase
    .from('resumes')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  const isFirst = count === 0

  // 2. Insert record into database
  const { error: dbError } = await supabase.from('resumes').insert({
    user_id: user.id,
    file_name: file.name,
    file_url: uploadData.path,
    extracted_text: extractedText,
    is_default: isFirst, // Make default if it's the first one
  })

  if (dbError) {
    // Cleanup storage if DB insert fails
    await supabase.storage.from('resumes').remove([uploadData.path])
    return { error: dbError.message }
  }

  revalidatePath('/dashboard/resumes')
  return { success: true }
}

export async function deleteResume(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // Get the file path first
  const { data: resume } = await supabase
    .from('resumes')
    .select('file_url')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (resume?.file_url) {
    // Delete from storage
    await supabase.storage.from('resumes').remove([resume.file_url])
  }

  // Delete from DB (cascade handles the rest)
  const { error } = await supabase.from('resumes').delete().eq('id', id).eq('user_id', user.id)
  
  if (error) return { error: error.message }
  revalidatePath('/dashboard/resumes')
  return { success: true }
}

export async function setDefaultResume(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // First unset all
  await supabase
    .from('resumes')
    .update({ is_default: false })
    .eq('user_id', user.id)

  // Then set the selected one
  const { error } = await supabase
    .from('resumes')
    .update({ is_default: true })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { error: error.message }
  revalidatePath('/dashboard/resumes')
  return { success: true }
}
