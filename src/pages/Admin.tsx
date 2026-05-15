import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import Sidebar from '@/components/Sidebar'
import { Button } from '@/components/ui/button'
import { LogOut, Home, Menu } from 'lucide-react'

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
import { WorkforceTrendsPanel } from './admin-panels/WorkforceTrendsPanel'
import { SettingsPanel } from './admin-panels/SettingsPanel'

// Recent sales data for overview panel
const recentSales = [
  { name: 'Olivia Martin', email: 'olivia.martin@email.com', amount: '+$1,999.00', avatar: 'OM' },
  { name: 'Jackson Lee', email: 'jackson.lee@email.com', amount: '+$1,739.00', avatar: 'JL' },
  { name: 'Isabella Nguyen', email: 'isabella.nguyen@email.com', amount: '+$39.00', avatar: 'IN' },
  { name: 'William Kim', email: 'william.kim@email.com', amount: '+$299.00', avatar: 'WK' },
  { name: 'Sofia Davis', email: 'sofia.davis@email.com', amount: '+$99.99', avatar: 'SD' },
]

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
  'workforce-trends': { title: 'Workforce Trends', subtitle: 'Headcount, churn, and productivity trends over time.' },
  settings: { title: 'Settings', subtitle: 'Manage dashboard preferences and system options.' },
}

// Panel component map - maps activeTab to the corresponding panel component
const getPanelComponent = (activeTab: string) => {
  switch (activeTab) {
    case 'overview':
      return <OverviewPanel recentSales={recentSales} />
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
    case 'workforce-trends':
      return <WorkforceTrendsPanel />
    case 'settings':
      return <SettingsPanel />
    default:
      return <OverviewPanel recentSales={recentSales} />
  }
}

export default function Admin() {
  const { logout } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const handleLogout = () => {
    logout()
    window.location.hash = '#/'
  }

  const currentMeta = TAB_META[activeTab] ?? TAB_META.overview

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
      <main className={`flex-1 transition-all duration-300`}>
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

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => (window.location.hash = '#/')}
                className="text-slate-600 border-slate-300"
              >
                <Home size={16} className="mr-2" />
                Home
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700"
              >
                <LogOut size={16} className="mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-slate-600">Rendering {currentMeta.title.toLowerCase()} panel with extracted components.</p>
            </div>
            <Button className="bg-slate-900 hover:bg-slate-800 text-white">
              Export
            </Button>
          </div>

          {getPanelComponent(activeTab)}
        </div>
      </main>
    </div>
  )
}
