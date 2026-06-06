import { useEffect, useMemo, useRef, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import ManagerSidebar from './ManagerSidebar'
import ManagerCreateTaskModal from './ManagerCreateTaskModal'
import { Bell, ChevronDown, Menu, Shield } from 'lucide-react'

export default function ManagerShell({ title, subtitle, children, activeTab, onTabChange }: { title: string; subtitle?: string; children: any; activeTab?: string; onTabChange?: (tab: string) => void }) {
  const { logout, user, userEmail } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [profileOpen, setProfileOpen] = useState(false)
  const profileRef = useRef<HTMLDivElement | null>(null)

  const profileName = useMemo(() => {
    if (user?.firstName || user?.lastName) return `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim()
    if (userEmail) {
      const localPart = userEmail.split('@')[0] ?? ''
      return localPart
        .split(/[._-]/)
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ')
    }
    return 'MANTO Manager'
  }, [user, userEmail])

  const userInitials = useMemo(() => {
    if (!profileName) return 'MM'
    const parts = profileName.split(' ').filter(Boolean)
    const initials = (parts[0]?.charAt(0) ?? '') + (parts[1]?.charAt(0) ?? '')
    return initials.toUpperCase() || 'MM'
  }, [profileName])

  const profileRole = useMemo(() => user?.roleName ?? 'Manager', [user])

  useEffect(() => {
    const onDocumentClick = (event: MouseEvent) => {
      if (!profileRef.current) return
      if (!profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false)
      }
    }

    document.addEventListener('mousedown', onDocumentClick)
    return () => document.removeEventListener('mousedown', onDocumentClick)
  }, [])

  const handleLogout = () => {
    logout()
    window.location.hash = '#/'
  }

  const notificationCount = 0
  const [showCreateModal, setShowCreateModal] = useState(false)

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 flex" style={{ fontFamily: "'Barlow', sans-serif" }}>
      <ManagerSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} activeTab={activeTab ?? ''} onTabChange={onTabChange ?? (() => {})} onOpenCreate={() => setShowCreateModal(true)} />

      <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'md:ml-64' : ''}`}>
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="flex items-center justify-between px-6 py-3.5">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="rounded-lg p-2 transition hover:bg-slate-100 md:hidden"
              >
                <Menu size={20} />
              </button>
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                  <span>Manager</span>
                  <span className="text-slate-300">/</span>
                  <span className="truncate text-slate-700">{title}</span>
                </div>
                {subtitle ? <p className="mt-1 max-w-[42rem] truncate text-sm text-slate-500">{subtitle}</p> : null}
              </div>
            </div>

            <div className="flex items-center gap-3" ref={profileRef}>
              <button
                type="button"
                className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-100"
                onClick={() => {}}
                aria-label="Notifications"
              >
                <Bell size={18} />
                {notificationCount > 0 ? (
                  <span className="absolute right-0 top-0 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[11px] font-bold leading-none text-white">
                    {notificationCount}
                  </span>
                ) : null}
              </button>

              <div className="relative">
                <button
                  type="button"
                  className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 transition hover:bg-slate-100"
                  onClick={() => setProfileOpen((v) => !v)}
                >
                  <div className="hidden text-right sm:block">
                    <p className="text-sm font-semibold leading-tight text-blue-900">{profileName}</p>
                    <p className="text-xs uppercase tracking-wide text-slate-500 leading-tight">{profileRole}</p>
                  </div>
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-full overflow-hidden bg-blue-600 text-sm font-bold text-white">
                    {user?.avatarUrl ? <img src={user.avatarUrl} alt="avatar" className="h-full w-full object-cover" /> : <span>{userInitials}</span>}
                  </div>
                  <ChevronDown size={16} className={`text-slate-400 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
                </button>

                {profileOpen ? (
                  <div className="absolute right-0 z-50 mt-3 w-72 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_20px_45px_rgba(15,23,42,0.16)]">
                    <div className="border-b border-slate-200 bg-slate-50 px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="inline-flex h-12 w-12 items-center justify-center rounded-full overflow-hidden bg-blue-600 text-base font-bold text-white">
                          {user?.avatarUrl ? <img src={user.avatarUrl} alt="avatar" className="h-full w-full object-cover" /> : <span>{userInitials}</span>}
                        </div>
                        <div>
                          <p className="text-2xl font-semibold leading-tight text-blue-900">{profileName}</p>
                          <p className="text-sm text-slate-600">{user?.email ?? userEmail ?? 'unknown@manto.local'}</p>
                        </div>
                      </div>
                      <div className="mt-3 inline-flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700">
                        <Shield size={14} />
                        Current Role: {profileRole}
                      </div>
                    </div>

                    <div className="px-3 py-2">
                      <button
                        type="button"
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-slate-700 transition hover:bg-slate-100"
                        onClick={() => {
                          if (onTabChange) onTabChange('dashboard')
                          else window.location.hash = '#/roles/manager'
                          setProfileOpen(false)
                        }}
                      >
                        <span className="font-medium">Manager Home</span>
                      </button>

                      <button
                        type="button"
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-slate-700 transition hover:bg-slate-100"
                        onClick={() => {
                          if (onTabChange) onTabChange('profile')
                          else window.location.hash = '#/roles/manager/profile'
                          setProfileOpen(false)
                        }}
                      >
                        <span className="font-medium">Profile</span>
                      </button>

                      <button
                        type="button"
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-slate-700 transition hover:bg-slate-100"
                        onClick={() => handleLogout()}
                      >
                        <span className="font-medium text-rose-600">Log Out</span>
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </header>

        <div className="p-6">
          {children}
        </div>
      {showCreateModal ? (
        <ManagerCreateTaskModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => { /* refresh or navigate to tasks */ window.location.hash = '#/roles/manager/tasks' }}
        />
      ) : null}
      </main>
    </div>
  )
}
