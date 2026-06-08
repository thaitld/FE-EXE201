import { useEffect, useMemo, useRef, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import ManagerSidebar from './ManagerSidebar'
import ManagerCreateTaskModal from './ManagerCreateTaskModal'
import { Bell, ChevronDown, Menu, Shield } from 'lucide-react'
import { useNotificationStore } from '@/features/notifications/notificationStore'
import NotificationsPanel from '@/features/notifications/NotificationsPanel'
import AlertBell from '@/features/notifications/AlertBell'
import LanguageSwitcher from '@/components/LanguageSwitcher'

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

  const { unreadCount } = useNotificationStore()
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)

  return (
    <div className="min-h-screen bg-[#fafbfc] text-slate-900 flex" style={{ fontFamily: "'Barlow', sans-serif" }}>
      <ManagerSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} activeTab={activeTab ?? ''} onTabChange={onTabChange ?? (() => {})} onOpenCreate={() => setShowCreateModal(true)} />

      <main className={`flex-1 transition-all duration-350 ease-in-out ${sidebarOpen ? 'md:ml-64' : ''}`}>
        <header className="sticky top-0 z-30 border-b border-slate-100 bg-white/80 backdrop-blur-md transition-shadow duration-200">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="rounded-xl p-2.5 text-slate-600 transition-all hover:bg-slate-50 hover:text-slate-900 md:hidden"
                aria-label="Toggle navigation"
              >
                <Menu size={20} />
              </button>
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  <span>Manager</span>
                  <span className="text-slate-300">/</span>
                  <span className="truncate text-blue-600 font-medium">{title}</span>
                </div>
                {subtitle ? <p className="mt-0.5 max-w-[42rem] truncate text-sm text-slate-500 font-normal">{subtitle}</p> : null}
              </div>
            </div>

            <div className="flex items-center gap-4" ref={profileRef}>
              <LanguageSwitcher />
              <AlertBell onOpenNotifications={() => setNotificationsOpen(true)} />

              <div className="relative">
                <button
                  type="button"
                  className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white p-1.5 pr-3 transition-all duration-200 hover:border-slate-200 hover:bg-slate-50/50 hover:shadow-sm"
                  onClick={() => setProfileOpen((v) => !v)}
                >
                  <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-600 text-sm font-bold text-white shadow-sm shadow-blue-500/20">
                    {user?.avatarUrl ? <img src={user.avatarUrl} alt="avatar" className="h-full w-full object-cover" /> : <span>{userInitials}</span>}
                  </div>
                  <div className="hidden text-left sm:block">
                    <p className="text-sm font-semibold leading-none text-slate-800">{profileName}</p>
                    <p className="mt-1 text-[10px] font-medium uppercase tracking-wider text-slate-400 leading-none">{profileRole}</p>
                  </div>
                  <ChevronDown size={14} className={`text-slate-400 transition-transform duration-200 ${profileOpen ? 'rotate-180 text-slate-600' : ''}`} />
                </button>

                {profileOpen ? (
                  <div className="absolute right-0 z-50 mt-2 w-72 overflow-hidden rounded-xl border border-slate-100 bg-white p-1.5 shadow-[0_12px_30px_-4px_rgba(15,23,42,0.08),0_4px_12px_-2px_rgba(15,23,42,0.03)] transition-all animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="rounded-lg bg-slate-50/70 p-4 border border-slate-100/50">
                      <div className="flex items-center gap-3">
                        <div className="inline-flex h-11 w-11 items-center justify-center rounded-lg overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-600 text-base font-bold text-white shadow-sm">
                          {user?.avatarUrl ? <img src={user.avatarUrl} alt="avatar" className="h-full w-full object-cover" /> : <span>{userInitials}</span>}
                        </div>
                        <div className="min-w-0">
                          <p className="text-base font-bold text-slate-800 truncate leading-tight">{profileName}</p>
                          <p className="text-xs text-slate-500 truncate mt-0.5">{user?.email ?? userEmail ?? 'unknown@manto.local'}</p>
                        </div>
                      </div>
                      <div className="mt-3.5 inline-flex items-center gap-1.5 rounded-md bg-blue-50/80 px-2.5 py-1 text-[11px] font-semibold tracking-wide uppercase text-blue-700">
                        <Shield size={12} />
                        {profileRole}
                      </div>
                    </div>

                    <div className="mt-1.5 space-y-0.5">
                      <button
                        type="button"
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-slate-700 transition-all hover:bg-slate-50 hover:text-slate-900"
                        onClick={() => {
                          if (onTabChange) onTabChange('dashboard')
                          else window.location.hash = '#/roles/manager'
                          setProfileOpen(false)
                        }}
                      >
                        <span className="font-medium">Manager Dashboard</span>
                      </button>

                      <button
                        type="button"
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-slate-700 transition-all hover:bg-slate-50 hover:text-slate-900"
                        onClick={() => {
                          if (onTabChange) onTabChange('profile')
                          else window.location.hash = '#/roles/manager/profile'
                          setProfileOpen(false)
                        }}
                      >
                        <span className="font-medium">My Profile</span>
                      </button>

                      <hr className="my-1 border-slate-100" />

                      <button
                        type="button"
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-rose-600 transition-all hover:bg-rose-50 hover:text-rose-700 font-medium"
                        onClick={() => handleLogout()}
                      >
                        <span>Sign Out</span>
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

      {/* Notifications Panel */}
      <NotificationsPanel
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
      />
    </div>
  )
}
