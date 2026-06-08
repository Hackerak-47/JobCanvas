'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { ApplicationStatus } from '@/lib/supabase/types'

export async function createApplication(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }
  
  const status = (formData.get('status') as ApplicationStatus) || 'wishlist'
  
  // Get max position_order for the target column
  const { data: maxOrder } = await supabase
    .from('applications')
    .select('position_order')
    .eq('user_id', user.id)
    .eq('status', status)
    .order('position_order', { ascending: false })
    .limit(1)
    .single()
  
  const { error } = await supabase.from('applications').insert({
    user_id: user.id,
    company_name: formData.get('companyName') as string,
    job_title: formData.get('jobTitle') as string,
    job_url: formData.get('jobUrl') as string || null,
    job_description: formData.get('jobDescription') as string || null,
    status,
    position_order: (maxOrder?.position_order ?? -1) + 1,
    location: formData.get('location') as string || null,
    salary_range: formData.get('salaryRange') as string || null,
    job_type: formData.get('jobType') as string || 'remote',
    notes: formData.get('notes') as string || null,
    applied_at: status !== 'wishlist' ? new Date().toISOString() : null,
  })
  if (error) return { error: error.message }
  revalidatePath('/dashboard')
  return { success: true }
}

export async function updateApplication(id: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }
  
  const { error } = await supabase
    .from('applications')
    .update({
      company_name: formData.get('companyName') as string,
      job_title: formData.get('jobTitle') as string,
      job_url: formData.get('jobUrl') as string || null,
      job_description: formData.get('jobDescription') as string || null,
      location: formData.get('location') as string || null,
      salary_range: formData.get('salaryRange') as string || null,
      job_type: formData.get('jobType') as string || 'remote',
      notes: formData.get('notes') as string || null,
    })
    .eq('id', id)
    .eq('user_id', user.id)
    
  if (error) return { error: error.message }
  revalidatePath('/dashboard')
  return { success: true }
}

export async function deleteApplication(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }
  
  const { error } = await supabase
    .from('applications')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)
    
  if (error) return { error: error.message }
  revalidatePath('/dashboard')
  return { success: true }
}

export async function moveApplication(id: string, newStatus: ApplicationStatus, newOrder: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }
  
  // A simplistic approach to updating order:
  // Usually you would batch update all position_orders, but for MVP we update the moved item's status
  // and set its position_order to the newOrder (in practice requires conflict resolution if two items share order).
  
  const { error } = await supabase
    .from('applications')
    .update({
      status: newStatus,
      position_order: newOrder,
      ...(newStatus !== 'wishlist' ? { applied_at: new Date().toISOString() } : {})
    })
    .eq('id', id)
    .eq('user_id', user.id)
    
  if (error) return { error: error.message }
  revalidatePath('/dashboard')
  return { success: true }
}
