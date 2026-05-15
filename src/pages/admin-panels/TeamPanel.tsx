import { Users, BarChart3, Heart } from 'lucide-react'
import { PanelLayout } from './shared'
import type { MetricCard, PanelDetail } from './types'

const metrics: MetricCard[] = [
  { label: 'Total Members', value: '148', hint: '+8 this month', icon: Users },
  { label: 'Active Teams', value: '12', hint: 'Across 4 departments', icon: BarChart3 },
  { label: 'Avg Engagement', value: '86%', hint: '+4.2% vs last month', icon: Heart },
]

const details: PanelDetail = {
  trend: [42, 46, 44, 51, 55, 58, 61],
  progress: [
    { label: 'Onboarding Completion', value: 88, color: 'bg-blue-500' },
    { label: 'Team Participation', value: 79, color: 'bg-emerald-500' },
    { label: 'Collaboration Health', value: 84, color: 'bg-violet-500' },
  ],
  columns: ['Team', 'Members', 'Engagement', 'Status'],
  rows: [
    ['Engineering', '43', '91%', 'Excellent'],
    ['Product', '21', '87%', 'Good'],
    ['Design', '14', '82%', 'Stable'],
    ['Operations', '17', '76%', 'Watchlist'],
  ],
}

export const TeamPanel = () => <PanelLayout metrics={metrics} details={details} />
