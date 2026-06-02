import type { LucideIcon } from 'lucide-react'

export interface MetricCard {
  label: string
  value: string
  hint: string
  icon: LucideIcon
}

export interface ProgressItem {
  label: string
  value: number
  color: string
}

export interface PanelDetail {
  trend: number[]
  progress: ProgressItem[]
  columns: string[]
  rows: string[][]
}

export interface PanelProps {
  metrics: MetricCard[]
  details: PanelDetail
}
