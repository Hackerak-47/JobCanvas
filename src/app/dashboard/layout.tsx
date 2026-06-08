import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'
import './dashboard.css'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  /* Fetch the user's profile from the profiles table */
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const userProfile = {
    id: user.id,
    email: user.email ?? '',
    fullName: profile?.full_name ?? user.user_metadata?.full_name ?? 'User',
    avatarUrl: profile?.avatar_url ?? user.user_metadata?.avatar_url ?? null,
    subscriptionTier: (profile?.subscription_tier ?? 'free') as 'free' | 'pro',
  }

  return (
    <div className="dashboard-layout">
      <Sidebar user={userProfile} />
      <div className="dashboard-main">
        <Header user={userProfile} />
        <main className="dashboard-content">
          {children}
        </main>
      </div>
    </div>
  )
}
