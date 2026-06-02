import { Settings, Activity, BarChart3 } from 'lucide-react'
import { PanelLayout } from '@/components/panels/shared'
import type { MetricCard, PanelDetail } from '@/components/panels/types'

const metrics: MetricCard[] = [
  { label: 'Active Integrations', value: '7', hint: 'All systems healthy', icon: Settings },
  { label: 'Alert Rules', value: '15', hint: '3 recently updated', icon: Activity },
  { label: 'Saved Views', value: '9', hint: 'Shared by admins', icon: BarChart3 },
]

const details: PanelDetail = {
  trend: [40, 42, 45, 47, 46, 50, 54],
  progress: [
    { label: 'Policy Compliance', value: 95, color: 'bg-emerald-500' },
    { label: 'Integration Health', value: 92, color: 'bg-blue-500' },
    { label: 'Alert Coverage', value: 84, color: 'bg-violet-500' },
  ],
  columns: ['Module', 'State', 'Last Updated', 'Owner'],
  rows: [
    ['Access Control', 'Enabled', '2 days ago', 'Admin'],
    ['Alert Rules', 'Enabled', '1 day ago', 'People Ops'],
    ['Data Retention', 'Enabled', '5 days ago', 'Security'],
    ['SSO Sync', 'Healthy', 'Today', 'IT'],
  ],
}

export const SettingsPanel = () => <PanelLayout metrics={metrics} details={details} />
