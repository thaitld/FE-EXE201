import { Users, TrendingUp, Activity } from 'lucide-react'
import { PanelLayout } from './shared'
import type { MetricCard, PanelDetail } from './types'

const metrics: MetricCard[] = [
  { label: 'Headcount Growth', value: '+4.3%', hint: 'Month over month', icon: Users },
  { label: 'Churn Trend', value: '-1.2%', hint: 'Improved retention', icon: TrendingUp },
  { label: 'Utilization Trend', value: '+3.7%', hint: 'Steady growth', icon: Activity },
]

const details: PanelDetail = {
  trend: [49, 52, 56, 58, 61, 63, 67],
  progress: [
    { label: 'Retention Trend', value: 88, color: 'bg-emerald-500' },
    { label: 'Hiring Velocity', value: 72, color: 'bg-blue-500' },
    { label: 'Productivity Lift', value: 69, color: 'bg-violet-500' },
  ],
  columns: ['Metric', 'Current', 'Last Month', 'Delta'],
  rows: [
    ['Headcount', '248', '239', '+9'],
    ['Monthly Attrition', '2.1%', '2.8%', '-0.7%'],
    ['Avg Utilization', '82%', '79%', '+3%'],
    ['Output Index', '114', '107', '+7'],
  ],
}

export const WorkforceTrendsPanel = () => <PanelLayout metrics={metrics} details={details} />
