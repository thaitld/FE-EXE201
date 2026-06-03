import { Brain, Users, BarChart3 } from 'lucide-react'
import { PanelLayout } from '@/components/panels/shared'
import type { MetricCard, PanelDetail } from '@/components/panels/types'

const metrics: MetricCard[] = [
  { label: 'Open Recommendations', value: '22', hint: 'Require owner assignment', icon: Brain },
  { label: 'Adoption Rate', value: '61%', hint: '+13% over baseline', icon: Users },
  { label: 'Impact Score', value: '8.4/10', hint: 'Based on implemented items', icon: BarChart3 },
]

const details: PanelDetail = {
  trend: [12, 14, 16, 18, 17, 21, 24],
  progress: [
    { label: 'Recommendation Adoption', value: 61, color: 'bg-blue-500' },
    { label: 'Measured Impact', value: 74, color: 'bg-emerald-500' },
    { label: 'Owner Assignment', value: 86, color: 'bg-violet-500' },
  ],
  columns: ['Recommendation', 'Priority', 'Impact', 'Owner'],
  rows: [
    ['Reduce sprint WIP by 10%', 'High', 'Productivity +8%', 'Eng Manager'],
    ['Launch burnout check-ins', 'High', 'Risk -12%', 'People Ops'],
    ['Adjust meeting windows', 'Medium', 'Focus +6%', 'Department Leads'],
    ['Create wellbeing champions', 'Medium', 'Adoption +9%', 'HRBP'],
  ],
}

export const AIRecommendationsPanel = () => <PanelLayout metrics={metrics} details={details} />
