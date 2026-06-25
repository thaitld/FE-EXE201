import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import ManagerShell from '../components/ManagerShell'
import type { ManagerTabItem } from '../components/ManagerLayout'
import DepartmentDashboardPage from './DepartmentDashboardPage'
import TaskManagementPage from './TaskManagementPage'
import BulkCreateTaskPage from './BulkCreateTaskPage'
import BurnoutMonitorPage from './BurnoutMonitorPage'
import TeamPerformancePage from './TeamPerformancePage'
import ManagerReportPage from './ManagerReportPage'
import OrgManagementPage from './OrgManagementPage'
import ProfilePage from '@/pages/shared/Profile'
import { MeetingsPanel } from '@/components/panels/admin/MeetingsPanel'
import { WellbeingAnalyticsPanel } from '@/components/panels/admin/WellbeingAnalyticsPanel'
import { AssignedSurveysWidget } from '@/components/panels/employee/AssignedSurveysWidget'

const tabs: ManagerTabItem[] = [
  { id: 'dashboard', label: 'Department Dashboard', description: 'KPI, burnout alerts, and monthly trend.' },
  { id: 'tasks', label: 'Task Management', description: 'Create, approve, reject, reassign, and clone tasks.' },
  { id: 'bulk-create', label: 'Bulk Create Tasks', description: 'Import multiple tasks in one shot.' },
  { id: 'burnout', label: 'Burnout Monitor', description: 'Track high-risk signals and resolve them.' },
  { id: 'survey-analytics', label: 'Survey Analytics', description: 'Thống kê kết quả khảo sát tinh thần theo tháng và xu hướng.' },
  { id: 'meetings', label: 'Meetings', description: 'Đặt lịch họp, xem lịch phòng ban và kết nối Google Calendar.' },
  { id: 'performance', label: 'Team Performance', description: 'Efficiency and overtime by team member.' },
  { id: 'report', label: 'Manager Report', description: 'Weekly AI-generated optimization report.' },
  { id: 'organization', label: 'Organization', description: 'Departments, teams, and work schedules.' },
  { id: 'profile', label: 'Profile', description: 'Your profile and account settings' },
]

const routeByTab: Record<string, string> = {
  dashboard: '#/roles/manager/dashboard',
  tasks: '#/roles/manager/tasks',
  'bulk-create': '#/roles/manager/bulk-create',
  burnout: '#/roles/manager/burnout',
  'survey-analytics': '#/roles/manager/survey-analytics',
  meetings: '#/roles/manager/meetings',
  performance: '#/roles/manager/performance',
  report: '#/roles/manager/report',
  organization: '#/roles/manager/organization',
  profile: '#/roles/manager/profile',
}

function getTabFromHash(hash: string) {
  const parts = hash.replace(/^#\/?/, '').split('/').filter(Boolean)
  const candidate = parts[2] ?? parts[1] ?? 'dashboard'
  return tabs.some((tab) => tab.id === candidate) ? candidate : 'dashboard'
}

function getTitle(tab: string) {
  return tabs.find((item) => item.id === tab)?.label ?? 'Department Dashboard'
}

function getSubtitle(tab: string) {
  return tabs.find((item) => item.id === tab)?.description ?? 'Manager workspace'
}

export default function ManagerWorkspace() {
  const { user, isAuthenticated, refreshUser, role: authRole } = useAuth()
  const [activeTab, setActiveTab] = useState(() => getTabFromHash(window.location.hash || '#/roles/manager'))

  const allowed = useMemo(() => {
    const rawRole = authRole || user?.roleName || user?.role;
    if (!rawRole) return false;
    const check = (target: string) => {
      if (Array.isArray(rawRole)) {
        return rawRole.some((x) => typeof x === 'string' && x.toUpperCase() === target.toUpperCase());
      }
      return typeof rawRole === 'string' && rawRole.toUpperCase() === target.toUpperCase();
    };
    return check('MANAGER') || check('ADMIN');
  }, [user, authRole])

  useEffect(() => {
    console.log("[ManagerWorkspace useEffect] isAuthenticated:", isAuthenticated, "user:", user, "allowed:", allowed);
    if (!isAuthenticated) {
      window.location.hash = '#/login'
      return
    }

    // If authenticated but user profile not yet loaded, attempt refresh and wait.
    if (isAuthenticated && !user) {
      ;(async () => {
        try {
          await refreshUser()
        } catch {
          // ignore
        }
      })()
      return
    }

    if (!allowed) {
      window.location.hash = '#/'
      return
    }

    const sync = () => {
      const nextTab = getTabFromHash(window.location.hash || '#/roles/manager')
      setActiveTab(nextTab)
    }

    sync()
    window.addEventListener('hashchange', sync)
    return () => window.removeEventListener('hashchange', sync)
  }, [allowed, isAuthenticated])

  useEffect(() => {
    const expectedHash = routeByTab[activeTab]
    if (window.location.hash !== expectedHash) {
      window.location.hash = expectedHash
    }
  }, [activeTab])

  const content = (() => {
    switch (activeTab) {
      case 'profile':
        return <ProfilePage />
      case 'tasks':
        return <TaskManagementPage />
      case 'bulk-create':
        return <BulkCreateTaskPage />
      case 'burnout':
        return <BurnoutMonitorPage />
      case 'survey-analytics':
        return <WellbeingAnalyticsPanel />
      case 'meetings':
        return <MeetingsPanel />
      case 'performance':
        return <TeamPerformancePage />
      case 'report':
        return <ManagerReportPage />
      case 'organization':
        return <OrgManagementPage />
      default:
        return <DepartmentDashboardPage />
    }
  })()

  return (
    <ManagerShell title={getTitle(activeTab)} subtitle={getSubtitle(activeTab)} activeTab={activeTab} onTabChange={setActiveTab}>
      <div className="space-y-6">
        <AssignedSurveysWidget />
        {content}
      </div>
    </ManagerShell>
  )
}