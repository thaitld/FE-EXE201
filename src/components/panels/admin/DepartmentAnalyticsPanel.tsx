import { BarChart3, Activity, Users } from 'lucide-react'
import { PanelLayout } from '@/components/panels/shared'
import type { MetricCard, PanelDetail } from '@/components/panels/types'

const metrics: MetricCard[] = [
  { label: 'Top Department', value: 'Product', hint: 'Highest engagement', icon: BarChart3 },
  { label: 'Lowest Utilization', value: 'Ops', hint: 'Needs enablement', icon: Activity },
  { label: 'Department Coverage', value: '100%', hint: 'All org units reporting', icon: Users },
]

const details: PanelDetail = {
  trend: [71, 70, 74, 76, 78, 79, 81],
  progress: [
    { label: 'Reporting Completeness', value: 100, color: 'bg-emerald-500' },
    { label: 'KPI Target Hit Rate', value: 82, color: 'bg-blue-500' },
    { label: 'Inter-team Alignment', value: 76, color: 'bg-violet-500' },
  ],
  columns: ['Department', 'Engagement', 'Utilization', 'Rank'],
  rows: [
    ['Product', '89%', '83%', '1'],
    ['Engineering', '86%', '91%', '2'],
    ['Design', '82%', '75%', '3'],
    ['Operations', '74%', '69%', '4'],
  ],
}

export const DepartmentAnalyticsPanel = () => <PanelLayout metrics={metrics} details={details} />
