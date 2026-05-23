import { Brain, Activity, TrendingUp } from 'lucide-react'
import { PanelLayout } from './shared'
import type { MetricCard, PanelDetail } from './types'

const metrics: MetricCard[] = [
  { label: 'Insights Generated', value: '124', hint: 'Past 7 days', icon: Brain },
  { label: 'Confidence Avg', value: '93%', hint: 'Model confidence score', icon: Activity },
  { label: 'Actionable Alerts', value: '18', hint: 'Pending review', icon: TrendingUp },
]

const details: PanelDetail = {
  trend: [18, 22, 20, 27, 31, 29, 35],
  progress: [
    { label: 'Insight Quality Score', value: 93, color: 'bg-blue-500' },
    { label: 'Validated Insights', value: 71, color: 'bg-emerald-500' },
    { label: 'Automation Coverage', value: 64, color: 'bg-violet-500' },
  ],
  columns: ['Insight', 'Confidence', 'Owner', 'Status'],
  rows: [
    ['Attrition risk in Ops', '95%', 'People Ops', 'Open'],
    ['Productivity dip in Team B', '92%', 'Engineering Lead', 'In Review'],
    ['Wellbeing score rise in Product', '89%', 'HRBP', 'Approved'],
    ['Workload imbalance in QA', '94%', 'QA Manager', 'Open'],
  ],
}

export const AIInsightsPanel = () => <PanelLayout metrics={metrics} details={details} />
