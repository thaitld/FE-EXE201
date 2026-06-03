import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import {
  LayoutDashboard,
  Users,
  UserRound,
  TrendingUp,
  Briefcase,
  Heart,
  TriangleAlert,
  Activity,
  Brain,
  Sparkles,
  CornerDownRight,
  Compass,
  BarChart3,
  Building2,
  Zap,
  ListTodo,
  ChevronDown,
  Settings,
  X,
} from 'lucide-react'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
  activeTab: string
  onTabChange: (tab: string) => void
}

export default function Sidebar({ isOpen, onClose, activeTab, onTabChange }: SidebarProps) {
  const { user } = useAuth()
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>(
    {
      dashboard: true,
      tasks: true,
      people: true,
      wellbeing: true,
      ai: true,
      analytics: true,
    }
  )

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  const handleTabClick = (tab: string) => {
    onTabChange(tab)
  }

  const topLevelItemClass = 'w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-slate-600 hover:bg-slate-100 transition'
  const activeTopLevelClass = 'bg-slate-100 text-blue-800'
  const subItemClass = 'w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 transition'
  const activeSubItemClass = 'bg-gradient-to-r from-blue-700 to-blue-500 text-white shadow-[0_6px_18px_rgba(37,99,235,0.35)]'

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-white border-r border-slate-200 z-40 transition-all duration-300 md:translate-x-0 ${
          !isOpen ? '-translate-x-full' : ''
        }`}
      >
        <div className="h-full flex flex-col overflow-y-auto">
          {/* Logo Section */}
          <div className="p-6 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img 
                  src="/manto.png" 
                  className="h-23 w-auto"
                  loading="lazy"
                />
              </div>
              <button
                onClick={onClose}
                className="md:hidden p-1 hover:bg-slate-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            <button
              type="button"
              onClick={() => toggleSection('dashboard')}
              className={`${topLevelItemClass} ${expandedSections.dashboard ? activeTopLevelClass : ''}`}
            >
              <LayoutDashboard size={18} />
              <span className="text-sm font-semibold">Dashboard</span>
              <ChevronDown
                size={16}
                className={`ml-auto transition-transform ${expandedSections.dashboard ? 'rotate-180' : ''}`}
              />
            </button>

            {expandedSections.dashboard && (
              <div className="space-y-1 pl-4">
                <button
                  type="button"
                  onClick={() => handleTabClick('dashboard-personal')}
                  className={`${subItemClass} ${activeTab === 'dashboard-personal' ? activeSubItemClass : ''}`}
                >
                  <UserRound size={17} />
                  <span className="text-sm font-medium">Personal</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleTabClick('dashboard-department')}
                  className={`${subItemClass} ${activeTab === 'dashboard-department' ? activeSubItemClass : ''}`}
                >
                  <Building2 size={17} />
                  <span className="text-sm font-medium">Department</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleTabClick('dashboard-company')}
                  className={`${subItemClass} ${activeTab === 'dashboard-company' ? activeSubItemClass : ''}`}
                >
                  <BarChart3 size={17} />
                  <span className="text-sm font-medium">Company</span>
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={() => toggleSection('tasks')}
              className={`${topLevelItemClass} ${expandedSections.tasks ? activeTopLevelClass : ''}`}
            >
              <ListTodo size={18} />
              <span className="text-sm font-semibold">Tasks</span>
              <ChevronDown
                size={16}
                className={`ml-auto transition-transform ${expandedSections.tasks ? 'rotate-180' : ''}`}
              />
            </button>

            {expandedSections.tasks && (
              <div className="space-y-1 pl-4">
                <button
                  type="button"
                  onClick={() => handleTabClick('tasks')}
                  className={`${subItemClass} ${activeTab === 'tasks' ? activeSubItemClass : ''}`}
                >
                  <ListTodo size={17} />
                  <span className="text-sm font-medium">All Tasks</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleTabClick('my-tasks')}
                  className={`${subItemClass} ${activeTab === 'my-tasks' ? activeSubItemClass : ''}`}
                >
                  <UserRound size={17} />
                  <span className="text-sm font-medium">My Tasks</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleTabClick('team-tasks')}
                  className={`${subItemClass} ${activeTab === 'team-tasks' ? activeSubItemClass : ''}`}
                >
                  <Users size={17} />
                  <span className="text-sm font-medium">Team Tasks</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleTabClick('task-types')}
                  className={`${subItemClass} ${activeTab === 'task-types' ? activeSubItemClass : ''}`}
                >
                  <ListTodo size={17} />
                  <span className="text-sm font-medium">Task Types</span>
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={() => toggleSection('people')}
              className={`${topLevelItemClass} ${expandedSections.people ? activeTopLevelClass : ''}`}
            >
              <Users size={18} />
              <span className="text-sm font-semibold">People</span>
              <ChevronDown
                size={16}
                className={`ml-auto transition-transform ${expandedSections.people ? 'rotate-180' : ''}`}
              />
            </button>

            {expandedSections.people && (
              <div className="space-y-1 pl-4">
                <button
                  type="button"
                  onClick={() => handleTabClick('team')}
                  className={`${subItemClass} ${activeTab === 'team' ? activeSubItemClass : ''}`}
                >
                  <UserRound size={17} />
                  <span className="text-sm font-medium">Team</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleTabClick('departments')}
                  className={`${subItemClass} ${activeTab === 'departments' ? activeSubItemClass : ''}`}
                >
                  <Building2 size={17} />
                  <span className="text-sm font-medium">Departments</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleTabClick('user-management')}
                  className={`${subItemClass} ${activeTab === 'user-management' ? activeSubItemClass : ''}`}
                >
                  <Users size={17} />
                  <span className="text-sm font-medium">Users</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleTabClick('performance')}
                  className={`${subItemClass} ${activeTab === 'performance' ? activeSubItemClass : ''}`}
                >
                  <TrendingUp size={17} />
                  <span className="text-sm font-medium">Performance</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleTabClick('workload')}
                  className={`${subItemClass} ${activeTab === 'workload' ? activeSubItemClass : ''}`}
                >
                  <Briefcase size={17} />
                  <span className="text-sm font-medium">Workload</span>
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={() => toggleSection('wellbeing')}
              className={`${topLevelItemClass} ${expandedSections.wellbeing ? activeTopLevelClass : ''}`}
            >
              <Heart size={18} />
              <span className="text-sm font-semibold">Wellbeing</span>
              <ChevronDown
                size={16}
                className={`ml-auto transition-transform ${expandedSections.wellbeing ? 'rotate-180' : ''}`}
              />
            </button>

            {expandedSections.wellbeing && (
              <div className="space-y-1 pl-4">
                <button
                  type="button"
                  onClick={() => handleTabClick('burnout-risk')}
                  className={`${subItemClass} ${activeTab === 'burnout-risk' ? activeSubItemClass : ''}`}
                >
                  <TriangleAlert size={17} />
                  <span className="text-sm font-medium">Burnout Risk</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleTabClick('wellbeing-analytics')}
                  className={`${subItemClass} ${activeTab === 'wellbeing-analytics' ? activeSubItemClass : ''}`}
                >
                  <Activity size={17} />
                  <span className="text-sm font-medium">Wellbeing Analytics</span>
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={() => toggleSection('ai')}
              className={`${topLevelItemClass} ${expandedSections.ai ? activeTopLevelClass : ''}`}
            >
              <Brain size={18} />
              <span className="text-sm font-semibold">AI Intelligence</span>
              <ChevronDown
                size={16}
                className={`ml-auto transition-transform ${expandedSections.ai ? 'rotate-180' : ''}`}
              />
            </button>

            {expandedSections.ai && (
              <div className="space-y-1 pl-4">
                <button
                  type="button"
                  onClick={() => handleTabClick('ai-insights')}
                  className={`${subItemClass} ${activeTab === 'ai-insights' ? activeSubItemClass : ''}`}
                >
                  <Sparkles size={17} />
                  <span className="text-sm font-medium">AI Insights</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleTabClick('ai-predictions')}
                  className={`${subItemClass} ${activeTab === 'ai-predictions' ? activeSubItemClass : ''}`}
                >
                  <CornerDownRight size={17} />
                  <span className="text-sm font-medium">AI Predictions</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleTabClick('ai-recommendations')}
                  className={`${subItemClass} ${activeTab === 'ai-recommendations' ? activeSubItemClass : ''}`}
                >
                  <Compass size={17} />
                  <span className="text-sm font-medium">AI Recommendations</span>
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={() => toggleSection('analytics')}
              className={`${topLevelItemClass} ${expandedSections.analytics ? activeTopLevelClass : ''}`}
            >
              <BarChart3 size={18} />
              <span className="text-sm font-semibold">Analytics</span>
              <ChevronDown
                size={16}
                className={`ml-auto transition-transform ${expandedSections.analytics ? 'rotate-180' : ''}`}
              />
            </button>

            {expandedSections.analytics && (
              <div className="space-y-1 pl-4">
                <button
                  type="button"
                  onClick={() => handleTabClick('department-analytics')}
                  className={`${subItemClass} ${activeTab === 'department-analytics' ? activeSubItemClass : ''}`}
                >
                  <Building2 size={17} />
                  <span className="text-sm font-medium">Department Analytics</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleTabClick('workforce-trends')}
                  className={`${subItemClass} ${activeTab === 'workforce-trends' ? activeSubItemClass : ''}`}
                >
                  <Zap size={17} />
                  <span className="text-sm font-medium">Workforce Trends</span>
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={() => handleTabClick('settings')}
              className={`${topLevelItemClass} ${activeTab === 'settings' ? activeSubItemClass : ''}`}
            >
              <Settings size={18} />
              <span className="text-sm font-semibold">Settings</span>
            </button>
          </nav>

          {/* User Section */}
          <div className="p-4 border-t border-slate-200 space-y-2">
            <div className="flex items-center gap-3 px-3 py-2">
                <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0">
                  {user?.avatarUrl ? (
                    <img src={user.avatarUrl} alt="avatar" className="h-full w-full object-cover" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-300 to-cyan-300 flex items-center justify-center text-slate-900 text-xs font-bold">
                      {(user?.email?.charAt(0) ?? 'M').toUpperCase()}
                    </div>
                  )}
                </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 truncate">{user?.email ?? 'unknown@manto.local'}</p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
