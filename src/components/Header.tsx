'use client'

import { usePathname } from 'next/navigation'

interface UserProfile {
  id: string
  email: string
  fullName: string
  avatarUrl: string | null
}

const pageTitles: Record<string, string> = {
  '/dashboard/board': 'Board',
  '/dashboard/resumes': 'Resumes',
  '/dashboard/analysis': 'Analysis',
}

export default function Header({ user }: { user: UserProfile }) {
  const pathname = usePathname()

  /* Determine the current page title based on route */
  const title =
    pageTitles[pathname] ??
    Object.entries(pageTitles).find(([key]) =>
      pathname.startsWith(key)
    )?.[1] ??
    'Dashboard'

  function getInitials(name: string) {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <header className="dashboard-header">
      <h2>{title}</h2>

      <div className="dashboard-header-right">

        {/* User avatar */}
        <div className="dashboard-header-avatar" title={user.fullName}>
          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt={user.fullName} />
          ) : (
            getInitials(user.fullName)
          )}
        </div>
      </div>
    </header>
  )
}
