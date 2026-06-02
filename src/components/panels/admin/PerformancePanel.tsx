import { TrendingUp, Users, Activity } from 'lucide-react'
import { PanelLayout } from '@/components/panels/shared'
import type { MetricCard, PanelDetail } from '@/components/panels/types'

const metrics: MetricCard[] = [
  { label: 'Goals Completed', value: '74%', hint: '+9% this quarter', icon: TrendingUp },
  { label: 'High Performers', value: '39', hint: 'Top 20% benchmark', icon: Users },
  { label: 'Productivity Score', value: '91/100', hint: 'Stable for 3 weeks', icon: Activity },
]

const details: PanelDetail = {
  trend: [65, 69, 67, 72, 76, 74, 79],
  progress: [
    { label: 'Quarterly Goal Completion', value: 74, color: 'bg-blue-500' },
    { label: 'KPI Achievement', value: 81, color: 'bg-emerald-500' },
    { label: 'Quality Score', value: 89, color: 'bg-violet-500' },
  ],
  columns: ['Employee', 'Role', 'Score', 'Trend'],
  rows: [
    ['Lena Tran', 'Product Manager', '92/100', 'Up'],
    ['Minh Le', 'Frontend Engineer', '88/100', 'Up'],
    ['An Nguyen', 'Data Analyst', '85/100', 'Stable'],
    ['Huy Vo', 'Operations Lead', '79/100', 'Down'],
  ],
}

export const PerformancePanel = () => <PanelLayout metrics={metrics} details={details} />
