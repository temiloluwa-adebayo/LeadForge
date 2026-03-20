'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Target, Users, BarChart2, Clock, Mail, FileText, Plug,
  LogOut, Settings, ChevronRight, Menu, X, Bell, Search
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

const NAV = [
  { href: '/dashboard/campaign', icon: Target, label: 'Campaign' },
  { href: '/dashboard/leads', icon: Users, label: 'Leads' },
  { href: '/dashboard/analytics', icon: BarChart2, label: 'Analytics' },
  { href: '/dashboard/history', icon: Clock, label: 'Run History' },
  { href: '/dashboard/email', icon: Mail, label: 'Email Templates' },
  { href: '/dashboard/proposals', icon: FileText, label: 'PDF Proposals' },
  { href: '/dashboard/integrations', icon: Plug, label: 'Integrations' },
]

export default function DashboardShell({
  children,
  profile,
  user,
}: {
  children: React.ReactNode
  profile: Record<string, string> | null
  user: { email?: string }
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  async function signOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    toast.success('Signed out')
    router.push('/')
    router.refresh()
  }

  const initials = (profile?.full_name || user?.email || 'U')
    .split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)

  const Sidebar = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-5 border-b" style={{ borderColor: '#f0f2f5' }}>
        <Link href="/dashboard/campaign" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold"
            style={{ background: '#00e676', color: '#0a1a0f' }}>⚡</div>
          <span className="font-bold text-gray-900 text-lg" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>
            Lead<span style={{ color: '#00e676' }}>Forge</span>
          </span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2">Workspace</p>
        {NAV.map(item => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link key={item.href} href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                active
                  ? 'nav-active'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
              }`}
              onClick={() => setSidebarOpen(false)}
            >
              <item.icon size={17} />
              {item.label}
              {active && <ChevronRight size={13} className="ml-auto text-green-600" />}
            </Link>
          )
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-4 border-t" style={{ borderColor: '#f0f2f5' }}>
        <Link href="/dashboard/settings"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-all mb-1">
          <Settings size={17} />
          Settings
        </Link>
        <button onClick={signOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 transition-all">
          <LogOut size={17} />
          Sign out
        </button>

        {/* User */}
        <div className="flex items-center gap-3 mt-3 px-3 py-2.5 rounded-xl"
          style={{ background: '#f8fafc', border: '1px solid #f0f2f5' }}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold"
            style={{ background: '#e8fdf0', color: '#00a854' }}>
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-gray-900 truncate">
              {profile?.full_name || 'Your Account'}
            </div>
            <div className="text-xs text-gray-400 truncate">{user?.email}</div>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-[220px] shrink-0 bg-white"
        style={{ borderRight: '1px solid #f0f2f5' }}>
        <Sidebar />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
          <aside className="relative w-64 bg-white h-full flex flex-col z-10"
            style={{ boxShadow: '4px 0 24px rgba(0,0,0,0.12)' }}>
            <button className="absolute top-4 right-4 text-gray-400" onClick={() => setSidebarOpen(false)}>
              <X size={20} />
            </button>
            <Sidebar />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-14 bg-white flex items-center justify-between px-5 shrink-0"
          style={{ borderBottom: '1px solid #f0f2f5' }}>
          <div className="flex items-center gap-3">
            <button className="lg:hidden p-1.5 text-gray-500" onClick={() => setSidebarOpen(true)}>
              <Menu size={20} />
            </button>
            {/* Search */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-gray-400"
              style={{ background: '#f8fafc', border: '1px solid #f0f2f5', minWidth: '200px' }}>
              <Search size={14} />
              <span>Search leads…</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="relative p-2 text-gray-400 hover:text-gray-700 transition-colors">
              <Bell size={18} />
            </button>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold"
              style={{ background: '#e8fdf0', color: '#00a854' }}>
              {initials}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
