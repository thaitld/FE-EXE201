import { Brain, Activity, TrendingUp } from 'lucide-react'
import { PanelLayout } from '@/components/panels/shared'
import type { MetricCard, PanelDetail } from '@/components/panels/types'

const metrics: MetricCard[] = [
  { label: 'Attrition Risk Forecast', value: '6.4%', hint: 'Next 30 days', icon: Brain },
  { label: 'Workload Spike Alerts', value: '9', hint: 'Predicted this week', icon: Activity },
  { label: 'Output Growth Forecast', value: '+7.8%', hint: 'Quarter projection', icon: TrendingUp },
]

const details: PanelDetail = {
  trend: [52, 55, 57, 60, 63, 61, 66],
  progress: [
    { label: 'Forecast Accuracy', value: 89, color: 'bg-blue-500' },
    { label: 'Critical Alert Precision', value: 81, color: 'bg-emerald-500' },
    { label: 'Scenario Coverage', value: 76, color: 'bg-violet-500' },
  ],
  columns: ['Prediction', 'Window', 'Probability', 'Action'],
  rows: [
    ['Ops attrition spike', '30 days', '68%', 'Retention plan'],
    ['Workload peak in Eng', '14 days', '72%', 'Rebalance backlog'],
    ['Wellbeing drop in QA', '21 days', '63%', 'Add support sessions'],
    ['Throughput increase in Product', '30 days', '70%', 'Scale roadmap'],
  ],
}

export const AIPredictionsPanel = () => <PanelLayout metrics={metrics} details={details} />
