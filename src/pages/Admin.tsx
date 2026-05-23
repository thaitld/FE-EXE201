import { useEffect, useMemo, useRef, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import Sidebar from '@/components/Sidebar'
// import { Button } from '@/components/ui/button'
import { Bell, ChevronDown, LogOut, Menu, Settings, Shield, TrendingUp, User } from 'lucide-react'

// Import all panel components
import { OverviewPanel } from './admin-panels/OverviewPanel'
import { TeamPanel } from './admin-panels/TeamPanel'
import { PerformancePanel } from './admin-panels/PerformancePanel'
import { WorkloadPanel } from './admin-panels/WorkloadPanel'
import { BurnoutRiskPanel } from './admin-panels/BurnoutRiskPanel'
import { WellbeingAnalyticsPanel } from './admin-panels/WellbeingAnalyticsPanel'
import { AIInsightsPanel } from './admin-panels/AIInsightsPanel'
import { AIPredictionsPanel } from './admin-panels/AIPredictionsPanel'
import { AIRecommendationsPanel } from './admin-panels/AIRecommendationsPanel'
import { DepartmentAnalyticsPanel } from './admin-panels/DepartmentAnalyticsPanel'
import { UserManagementPanel } from './admin-panels/UserManagementPanel'
import { WorkforceTrendsPanel } from './admin-panels/WorkforceTrendsPanel'
import { SettingsPanel } from './admin-panels/SettingsPanel'
import DepartmentsPanel from './admin-panels/DepartmentsPanel'
import ProfilePage from './Profile'

const TAB_META: Record<string, { title: string; subtitle: string }> = {
  overview: { title: 'Dashboard Overview', subtitle: 'Executive snapshot of platform performance.' },
  team: { title: 'Team', subtitle: 'Team size, distribution and engagement status.' },
  performance: { title: 'Performance', subtitle: 'Productivity and goal completion metrics.' },
  workload: { title: 'Workload', subtitle: 'Allocation balance across teams and roles.' },
  'burnout-risk': { title: 'Burnout Risk', subtitle: 'Risk classification based on recent signals.' },
  'wellbeing-analytics': { title: 'Wellbeing Analytics', subtitle: 'Mental wellbeing trends and score changes.' },
  'ai-insights': { title: 'AI Insights', subtitle: 'AI-generated highlights from operational data.' },
  'ai-predictions': { title: 'AI Predictions', subtitle: 'Forecasts generated from recent platform activity.' },
  'ai-recommendations': { title: 'AI Recommendations', subtitle: 'Actionable suggestions to improve outcomes.' },
  'department-analytics': { title: 'Department Analytics', subtitle: 'Department-level KPI breakdown and ranking.' },
  departments: { title: 'Departments', subtitle: 'Manage company departments.' },
  'user-management': { title: 'User Management', subtitle: 'Create, update, search, and review users.' },
  'workforce-trends': { title: 'Workforce Trends', subtitle: 'Headcount, churn, and productivity trends over time.' },
  settings: { title: 'Settings', subtitle: 'Manage dashboard preferences and system options.' },
}

// Panel component map - maps activeTab to the corresponding panel component
const getPanelComponent = (activeTab: string) => {
  switch (activeTab) {
    case 'overview':
      return <OverviewPanel />
    case 'profile':
      return <ProfilePage />
    case 'team':
      return <TeamPanel />
    case 'performance':
      return <PerformancePanel />
    case 'workload':
      return <WorkloadPanel />
    case 'burnout-risk':
      return <BurnoutRiskPanel />
    case 'wellbeing-analytics':
      return <WellbeingAnalyticsPanel />
    case 'ai-insights':
      return <AIInsightsPanel />
    case 'ai-predictions':
      return <AIPredictionsPanel />
    case 'ai-recommendations':
      return <AIRecommendationsPanel />
    case 'department-analytics':
      return <DepartmentAnalyticsPanel />
    case 'departments':
      return <DepartmentsPanel />
    case 'user-management':
      return <UserManagementPanel />
    case 'workforce-trends':
      return <WorkforceTrendsPanel />
    case 'settings':
      return <SettingsPanel />
    default:
      return <OverviewPanel />
  }
}

export default function Admin({ initialTab }: { initialTab?: string } = {}) {
  const { logout, user, userEmail } = useAuth()
  const [activeTab, setActiveTab] = useState(initialTab ?? 'overview')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [profileOpen, setProfileOpen] = useState(false)
  const profileRef = useRef<HTMLDivElement | null>(null)

  const handleLogout = () => {
    logout()
    window.location.hash = '#/'
  }

  const currentMeta = TAB_META[activeTab] ?? TAB_META.overview

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
    return 'MANTO User'
  }, [user, userEmail])

  const userInitials = useMemo(() => {
    if (!profileName) return 'MU'
    const parts = profileName.split(' ').filter(Boolean)
    const initials = (parts[0]?.charAt(0) ?? '') + (parts[1]?.charAt(0) ?? '')
    return initials.toUpperCase() || 'MU'
  }, [profileName])

  const profileRole = useMemo(() => {
    return user?.roleName ?? 'Admin'
  }, [user])

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

  const handleProfileAction = (tab: string) => {
    setActiveTab(tab)
    setProfileOpen(false)
  }

  const notificationCount = 2

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 flex" style={{ fontFamily: "'Barlow', sans-serif" }}>
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Main Content */}
      <main className="flex-1 transition-all duration-300 md:ml-64">
        {/* Header */}
        <header className="border-b border-slate-200 bg-white sticky top-0 z-30">
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 hover:bg-slate-100 rounded-lg transition md:hidden"
              >
                <Menu size={20} />
              </button>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">{currentMeta.title}</h2>
                <p className="text-sm text-slate-500">{currentMeta.subtitle}</p>
              </div>
            </div>

            <div className="flex items-center gap-3" ref={profileRef}>
              <button
                type="button"
                className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-100"
                onClick={() => setProfileOpen(false)}
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
                  onClick={() => setProfileOpen((value) => !value)}
                >
                  <div className="hidden text-right sm:block">
                    <p className="text-base font-semibold text-blue-900 leading-tight">{profileName}</p>
                    <p className="text-sm text-slate-500 leading-tight">{profileRole}</p>
                  </div>
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-full overflow-hidden bg-blue-600 text-sm font-bold text-white">
                    {user?.avatarUrl ? (
                      <img src={user.avatarUrl} alt="avatar" className="h-full w-full object-cover" />
                    ) : (
                      <span>{userInitials}</span>
                    )}
                  </div>
                  <ChevronDown size={16} className={`text-slate-400 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
                </button>

                {profileOpen ? (
                  <div className="absolute right-0 z-50 mt-3 w-80 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_20px_45px_rgba(15,23,42,0.16)]">
                    <div className="border-b border-slate-200 bg-slate-50 px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="inline-flex h-12 w-12 items-center justify-center rounded-full overflow-hidden bg-blue-600 text-base font-bold text-white">
                          {user?.avatarUrl ? (
                            <img src={user.avatarUrl} alt="avatar" className="h-full w-full object-cover" />
                          ) : (
                            <span>{userInitials}</span>
                          )}
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
                              onClick={() => { window.location.hash = '#/admin/profile'; setActiveTab('profile'); setProfileOpen(false) }}
                            >
                              <User size={16} />
                              <span className="font-medium">Profile</span>
                            </button>
                      <button
                        type="button"
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-slate-700 transition hover:bg-slate-100"
                        onClick={() => handleProfileAction('performance')}
                      >
                        <TrendingUp size={16} />
                        <span className="font-medium">My Performance</span>
                      </button>
                      <button
                        type="button"
                        className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-slate-700 transition hover:bg-slate-100"
                        onClick={() => setProfileOpen(false)}
                      >
                        <span className="inline-flex items-center gap-3">
                          <Bell size={16} />
                          <span className="font-medium">Notifications</span>
                        </span>
                        {notificationCount > 0 ? (
                          <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-rose-500 px-1 text-xs font-bold text-white">
                            {notificationCount}
                          </span>
                        ) : null}
                      </button>
                      <button
                        type="button"
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-slate-700 transition hover:bg-slate-100"
                        onClick={() => handleProfileAction('settings')}
                      >
                        <Settings size={16} />
                        <span className="font-medium">Settings</span>
                      </button>
                    </div>

                    <div className="border-t border-slate-200 px-3 py-2">
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left font-semibold text-rose-600 transition hover:bg-rose-50"
                      >
                        <LogOut size={16} />
                        Log Out
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-slate-600">Rendering {currentMeta.title.toLowerCase()} panel with extracted components.</p>
            </div>
            {/* <Button className="bg-slate-900 hover:bg-slate-800 text-white">
              Export
            </Button> */}
          </div>

          {getPanelComponent(activeTab)}
        </div>
      </main>
    </div>
  )
}
