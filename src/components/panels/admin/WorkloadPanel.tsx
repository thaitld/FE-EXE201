import { BarChart3, Users, Activity } from 'lucide-react'
import { PanelLayout } from '@/components/panels/shared'
import type { MetricCard, PanelDetail } from '@/components/panels/types'

const metrics: MetricCard[] = [
  { label: 'Balanced Teams', value: '9/12', hint: '3 need redistribution', icon: BarChart3 },
  { label: 'Overloaded Users', value: '17', hint: 'Focus on Engineering', icon: Users },
  { label: 'Capacity Usage', value: '82%', hint: 'Target range: 70-85%', icon: Activity },
]

const details: PanelDetail = {
  trend: [58, 62, 65, 70, 68, 66, 64],
  progress: [
    { label: 'Balanced Distribution', value: 73, color: 'bg-blue-500' },
    { label: 'Overload Reduction', value: 61, color: 'bg-amber-500' },
    { label: 'Task Completion Velocity', value: 77, color: 'bg-emerald-500' },
  ],
  columns: ['Department', 'Utilization', 'Overload Cases', 'Action'],
  rows: [
    ['Engineering', '92%', '8', 'Redistribute sprint tasks'],
    ['Product', '84%', '3', 'Monitor weekly'],
    ['Design', '75%', '1', 'Healthy'],
    ['Operations', '69%', '0', 'Can absorb load'],
  ],
}

export const WorkloadPanel = () => <PanelLayout metrics={metrics} details={details} />
