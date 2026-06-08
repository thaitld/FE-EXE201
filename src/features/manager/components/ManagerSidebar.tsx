import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useTranslation } from 'react-i18next'
import {
  Grid,
  ClipboardList,
  Archive,
  Activity,
  BarChart2,
  FileText,
  Users,
  Settings,
  X,
  ChevronDown,
  CalendarDays,
  Sparkles,
} from 'lucide-react'

interface ManagerSidebarProps {
  isOpen?: boolean
  onClose?: () => void
  activeTab: string
  onTabChange: (tab: string) => void
  onOpenCreate?: () => void
}

export default function ManagerSidebar({ isOpen = true, onClose = () => { }, activeTab, onTabChange, onOpenCreate }: ManagerSidebarProps) {
  const { user } = useAuth()
  const { t } = useTranslation()
  const [expanded, setExpanded] = useState<{ [k: string]: boolean }>({ dashboard: true, tasks: true, org: true })

  const toggle = (k: string) => setExpanded((s) => ({ ...s, [k]: !s[k] }))

  const topLevelItemClass = 'w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-slate-600 hover:bg-slate-100 transition'
  const activeTopLevelClass = 'bg-slate-100 text-blue-800'
  const subItemClass = 'w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 transition'
  const activeSubItemClass = 'bg-gradient-to-r from-blue-700 to-blue-500 text-white shadow-[0_6px_18px_rgba(37,99,235,0.35)]'

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={onClose} />
      )}

      <aside className={`fixed left-0 top-0 h-screen w-64 bg-white border-r border-slate-200 z-40 transition-all duration-300 md:translate-x-0 ${!isOpen ? '-translate-x-full' : ''}`}>
        <div className="h-full flex flex-col overflow-y-auto">
          <div className="p-6 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <img src="/manto.png" className="h-30 w-auto object-contain transition-transform duration-300 hover:scale-105" alt="MANTO" loading="lazy" />
              </div>
              <button onClick={onClose} className="md:hidden p-1 hover:bg-slate-100 rounded-lg">
                <X size={20} />
              </button>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            <button type="button" onClick={() => toggle('dashboard')} className={`${topLevelItemClass} ${expanded.dashboard ? activeTopLevelClass : ''}`}>
              <Grid size={18} />
              <span className="text-sm font-semibold">{t('nav.dashboard')}</span>
              <ChevronDown size={16} className={`ml-auto transition-transform ${expanded.dashboard ? 'rotate-180' : ''}`} />
            </button>

            {expanded.dashboard && (
              <div className="space-y-1 pl-4">
                <button type="button" onClick={() => onTabChange('dashboard')} className={`${subItemClass} ${activeTab === 'dashboard' ? activeSubItemClass : ''}`}>
                  <Grid size={16} />
                  <span className="text-sm font-medium">{t('nav.department')}</span>
                </button>
              </div>
            )}

            <button type="button" onClick={() => toggle('tasks')} className={`${topLevelItemClass} ${expanded.tasks ? activeTopLevelClass : ''}`}>
              <ClipboardList size={18} />
              <span className="text-sm font-semibold">{t('nav.tasks')}</span>
              <ChevronDown size={16} className={`ml-auto transition-transform ${expanded.tasks ? 'rotate-180' : ''}`} />
            </button>

            {expanded.tasks && (
              <div className="space-y-1 pl-4">
                <button type="button" onClick={() => onTabChange('tasks')} className={`${subItemClass} ${activeTab === 'tasks' ? activeSubItemClass : ''}`}>
                  <ClipboardList size={16} />
                  <span className="text-sm font-medium">{t('nav.all_tasks')}</span>
                </button>
                <button type="button" onClick={() => onTabChange('bulk-create')} className={`${subItemClass} ${activeTab === 'bulk-create' ? activeSubItemClass : ''}`}>
                  <Archive size={16} />
                  <span className="text-sm font-medium">{t('nav.bulk_create')}</span>
                </button>
              </div>
            )}

            <button type="button" onClick={() => onTabChange('burnout')} className={`${topLevelItemClass} ${activeTab === 'burnout' ? activeTopLevelClass : ''}`}>
              <Activity size={18} />
              <span className="text-sm font-semibold">{t('nav.burnout_monitor')}</span>
            </button>

            <button type="button" onClick={() => onTabChange('survey-analytics')} className={`${topLevelItemClass} ${activeTab === 'survey-analytics' ? activeTopLevelClass : ''}`}>
              <Sparkles size={18} />
              <span className="text-sm font-semibold">{t('nav.survey_analytics')}</span>
            </button>

            <button type="button" onClick={() => onTabChange('meetings')} className={`${topLevelItemClass} ${activeTab === 'meetings' ? activeTopLevelClass : ''}`}>
              <CalendarDays size={18} />
              <span className="text-sm font-semibold">{t('nav.meetings')}</span>
            </button>

            <button type="button" onClick={() => onTabChange('performance')} className={`${topLevelItemClass} ${activeTab === 'performance' ? activeTopLevelClass : ''}`}>
              <BarChart2 size={18} />
              <span className="text-sm font-semibold">{t('nav.team_performance')}</span>
            </button>

            <button type="button" onClick={() => onTabChange('report')} className={`${topLevelItemClass} ${activeTab === 'report' ? activeTopLevelClass : ''}`}>
              <FileText size={18} />
              <span className="text-sm font-semibold">{t('nav.manager_report')}</span>
            </button>

            <button type="button" onClick={() => toggle('org')} className={`${topLevelItemClass} ${expanded.org ? activeTopLevelClass : ''}`}>
              <Users size={18} />
              <span className="text-sm font-semibold">{t('nav.organization')}</span>
              <ChevronDown size={16} className={`ml-auto transition-transform ${expanded.org ? 'rotate-180' : ''}`} />
            </button>

            {expanded.org && (
              <div className="space-y-1 pl-4">
                <button type="button" onClick={() => onTabChange('organization')} className={`${subItemClass} ${activeTab === 'organization' ? activeSubItemClass : ''}`}>
                  <Users size={16} />
                  <span className="text-sm font-medium">{t('nav.departments_teams')}</span>
                </button>
              </div>
            )}

            <button type="button" onClick={() => onTabChange('profile')} className={`${topLevelItemClass} ${activeTab === 'profile' ? activeTopLevelClass : ''}`}>
              <Settings size={18} />
              <span className="text-sm font-semibold">{t('nav.profile')}</span>
            </button>
          </nav>

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
