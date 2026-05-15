import { Heart, Activity, TrendingUp } from 'lucide-react'
import { PanelLayout } from './shared'
import type { MetricCard, PanelDetail } from './types'

const metrics: MetricCard[] = [
  { label: 'High Risk', value: '14', hint: 'Need immediate follow-up', icon: Heart },
  { label: 'Medium Risk', value: '32', hint: 'Monitor weekly', icon: Activity },
  { label: 'Recovery Trend', value: '+11%', hint: 'Improved from last month', icon: TrendingUp },
]

const details: PanelDetail = {
  trend: [36, 34, 33, 31, 29, 30, 27],
  progress: [
    { label: 'High Risk Group', value: 23, color: 'bg-rose-500' },
    { label: 'Medium Risk Group', value: 47, color: 'bg-amber-500' },
    { label: 'Recovery Program Match', value: 68, color: 'bg-emerald-500' },
  ],
  columns: ['Employee', 'Risk Level', 'Primary Signal', 'Follow-up'],
  rows: [
    ['Tuan Pham', 'High', 'Overtime 3 weeks', '1:1 this week'],
    ['Ha Do', 'Medium', 'Survey stress score', 'Coaching session'],
    ['Trang Vu', 'High', 'Low recovery index', 'HR escalation'],
    ['Khanh Bui', 'Medium', 'Engagement drop', 'Manager check-in'],
  ],
}

export const BurnoutRiskPanel = () => <PanelLayout metrics={metrics} details={details} />
