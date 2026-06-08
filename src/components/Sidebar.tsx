'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  FileText,
  BarChart3,
  LogOut,
  Menu,
  X,
} from 'lucide-react'
import { signOut } from '@/actions/auth'

interface UserProfile {
  id: string
  email: string
  fullName: string
  avatarUrl: string | null
}

const navItems = [
  { href: '/dashboard/board', label: 'Board', icon: LayoutDashboard },
  { href: '/dashboard/resumes', label: 'Resumes', icon: FileText },
  { href: '/dashboard/analysis', label: 'Analysis', icon: BarChart3 },
]

export default function Sidebar({ user }: { user: UserProfile }) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  function getInitials(name: string) {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  function isActive(href: string) {
    if (href === '/dashboard/board') {
      return pathname === '/dashboard/board'
    }
    return pathname.startsWith(href)
  }

  function handleSignOut() {
    signOut()
  }

  return (
    <>
      {/* Mobile hamburger — rendered inside the header via CSS */}
      <button
        className="sidebar-mobile-toggle"
        onClick={() => setMobileOpen(true)}
        aria-label="Open sidebar"
      >
        <Menu />
      </button>

      {/* Backdrop */}
      {mobileOpen && (
        <div
          className="sidebar-backdrop visible"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`dashboard-sidebar${mobileOpen ? ' open' : ''}`}>
        <div className="sidebar-logo">
          <h2 className="gradient-text text-4xl font-black">JobCanvas</h2>

          {/* Close button on mobile */}
          {mobileOpen && (
            <button
              className="sidebar-mobile-toggle"
              onClick={() => setMobileOpen(false)}
              aria-label="Close sidebar"
              style={{ marginLeft: 'auto' }}
            >
              <X />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`sidebar-nav-item${active ? ' active' : ''}`}
                onClick={() => setMobileOpen(false)}
              >
                <Icon />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* User Section */}
        <div className="sidebar-user">
          <div className="sidebar-user-avatar">
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.fullName} />
            ) : (
              getInitials(user.fullName)
            )}
          </div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name truncate">{user.fullName}</div>
            <div className="sidebar-user-email truncate">{user.email}</div>
          </div>
          <button
            className="sidebar-signout-btn"
            onClick={handleSignOut}
            title="Sign out"
            aria-label="Sign out"
          >
            <LogOut />
          </button>
        </div>
      </aside>
    </>
  )
}
