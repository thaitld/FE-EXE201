import { Heart, Users, Activity } from 'lucide-react'
import { PanelLayout } from './shared'
import type { MetricCard, PanelDetail } from './types'

const metrics: MetricCard[] = [
  { label: 'Wellbeing Index', value: '78', hint: '+6 points vs last cycle', icon: Heart },
  { label: 'Program Participation', value: '67%', hint: '+15% adoption', icon: Users },
  { label: 'Stress Signals', value: '-12%', hint: 'Declining trend', icon: Activity },
]

const details: PanelDetail = {
  trend: [61, 64, 66, 68, 71, 73, 76],
  progress: [
    { label: 'Program Adoption', value: 67, color: 'bg-blue-500' },
    { label: 'Wellbeing Score', value: 78, color: 'bg-emerald-500' },
    { label: 'Stress Reduction', value: 72, color: 'bg-violet-500' },
  ],
  columns: ['Program', 'Participants', 'Avg Score', 'Delta'],
  rows: [
    ['Mindfulness Sprint', '78', '8.1/10', '+0.7'],
    ['Focus Friday', '113', '7.8/10', '+0.4'],
    ['Wellbeing Coaching', '42', '8.4/10', '+0.9'],
    ['Recovery Workshop', '57', '7.6/10', '+0.3'],
  ],
}

export const WellbeingAnalyticsPanel = () => <PanelLayout metrics={metrics} details={details} />
