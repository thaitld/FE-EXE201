import { useEffect, useState, useMemo } from 'react'
import {
  TrendingUp, Brain, AlertTriangle, Users, Building2,
  ArrowUpRight, CalendarDays, Sparkles, RefreshCw,
  ChevronDown, Shield, Activity
} from 'lucide-react'
import { apiClient, type ApiResponse, type CompanyDashboardDto } from '@/lib/api'
import { TripleTrendChart } from './DashboardHelpers'

// ─── Palette tokens ───────────────────────────────────────────────────────────
// Background: #0a0f1a (deep navy)
// Surface:    #111827 / #1e293b
// Border:     rgba(255,255,255,0.06)
// Accent:     #22d3ee (cyan-400)  /  #6366f1 (indigo-500)

export default function CompanyDashboardView({ dashboard: initialDashboard }: { dashboard?: CompanyDashboardDto } = {}) {
  const [dashboard, setDashboard] = useState<CompanyDashboardDto | null>(initialDashboard ?? null)
  const [isLoading, setIsLoading] = useState(initialDashboard == null)
  const [error, setError] = useState<string | null>(null)
  const [year, setYear] = useState(new Date().getFullYear())
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [refreshKey, setRefreshKey] = useState(0)

  const MONTH_OPTIONS = useMemo(
    () => Array.from({ length: 12 }, (_, i) => ({ value: i + 1, label: `Tháng ${i + 1}` })),
    [],
  )

  const yearRange = useMemo(() => {
    const current = new Date().getFullYear()
    return [current - 1, current, current + 1]
  }, [])

  useEffect(() => {
    if (initialDashboard) {
      setDashboard(initialDashboard)
    }
  }, [initialDashboard])

  useEffect(() => {
    if (initialDashboard) return
    let cancelled = false
    const load = async () => {
      setIsLoading(true)
      try {
        const res = await apiClient.get<ApiResponse<CompanyDashboardDto>>('/dashboard/company', { params: { year, month } })
        if (!cancelled) {
          setDashboard(res.data.data ?? null)
          setError(null)
        }
      } catch {
        if (!cancelled) {
          setError('Không thể tải company dashboard')
          setDashboard(null)
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    void load()
    return () => { cancelled = true }
  }, [initialDashboard, year, month, refreshKey])

  if (isLoading && !dashboard) return <DashboardSkeleton />
  if (error && !dashboard) return (
    <div className="flex items-center gap-3 rounded-xl border border-rose-100 bg-rose-50/50 px-5 py-4 text-rose-600">
      <AlertTriangle size={18} className="shrink-0" />
      <span className="text-sm font-medium">{error}</span>
    </div>
  )

  if (!initialDashboard && !dashboard) return null

  if (!initialDashboard) {
    return (
      <div className="min-h-screen bg-[#fafbfc] px-4 py-6 font-sans text-slate-900 sm:px-6">
        {/* Top bar */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-100 bg-white px-5 py-3.5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-50">
              <CalendarDays size={15} className="text-cyan-600" />
            </div>
            <span className="text-sm font-semibold text-slate-700">Kỳ báo cáo</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <PeriodSelect value={month} onChange={(v) => setMonth(Number(v))} options={MONTH_OPTIONS.map(o => ({ value: o.value, label: o.label }))} />
            <PeriodSelect value={year} onChange={(v) => setYear(Number(v))} options={yearRange.map(y => ({ value: y, label: String(y) }))} />
            <button
              type="button"
              onClick={() => setRefreshKey((k) => k + 1)}
              disabled={isLoading}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition-all hover:bg-slate-50 hover:text-slate-800 active:scale-95 disabled:opacity-40"
            >
              <RefreshCw size={13} className={isLoading ? 'animate-spin text-cyan-600' : 'text-slate-500'} />
              Làm mới
            </button>
          </div>
        </div>

        {isLoading && !dashboard && <LoadingBar />}
        {error && (
          <div className="mb-5 flex items-center gap-3 rounded-xl border border-rose-100 bg-rose-50/50 px-5 py-4 text-rose-600">
            <AlertTriangle size={18} className="shrink-0" />
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}
        {dashboard && <CompanyDashboardContent dashboard={dashboard} isRefreshing={isLoading} />}
      </div>
    )
  }

  if (!dashboard) return null
  return (
    <div className="min-h-screen bg-[#fafbfc] px-4 py-6 font-sans text-slate-900 sm:px-6">
      <CompanyDashboardContent dashboard={dashboard} isRefreshing={false} />
    </div>
  )
}

// ─── Period Select ────────────────────────────────────────────────────────────
function PeriodSelect({
  value, onChange, options
}: {
  value: number
  onChange: (v: number) => void
  options: { value: number; label: string }[]
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-9 appearance-none rounded-xl border border-slate-200 bg-white pl-3 pr-8 text-slate-700 font-semibold text-xs outline-none transition hover:border-slate-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/10"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-white">{opt.label}</option>
        ))}
      </select>
      <ChevronDown size={12} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
    </div>
  )
}

// ─── Main Content ─────────────────────────────────────────────────────────────
function CompanyDashboardContent({
  dashboard, isRefreshing = false
}: {
  dashboard: CompanyDashboardDto
  isRefreshing?: boolean
}) {
  const kpiCards = [
    {
      label: 'Hiệu suất TB',
      value: dashboard.avgEfficiencyLabel,
      sub: formatPercent(dashboard.avgEfficiencyRatio),
      ratio: dashboard.avgEfficiencyRatio ?? 0,
      icon: TrendingUp,
      accent: 'cyan' as const,
    },
    {
      label: 'Tinh thần TB',
      value: dashboard.avgMoraleScore.toFixed(2),
      sub: 'Sentiment nhân sự',
      ratio: Math.min(dashboard.avgMoraleScore / 10, 1),
      icon: Brain,
      accent: 'emerald' as const,
    },
    {
      label: 'Áp lực TB',
      value: dashboard.avgStressScore.toFixed(2),
      sub: 'Áp lực tổ chức',
      ratio: Math.min(dashboard.avgStressScore / 10, 1),
      icon: AlertTriangle,
      accent: 'amber' as const,
    },
    {
      label: 'Nhân sự hoạt động',
      value: String(dashboard.totalActiveEmployees),
      sub: `${dashboard.departments.length} phòng ban`,
      ratio: 1,
      icon: Users,
      accent: 'indigo' as const,
    },
  ]

  return (
    <div className={`space-y-5 transition-opacity duration-300 ${isRefreshing ? 'opacity-50' : 'opacity-100'}`}>

      {/* Page header */}
      <div className="flex items-center gap-3 pb-1">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-400/12">
          <Activity size={17} className="text-cyan-400" />
        </div>
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-slate-900">Company Dashboard</h1>
          <p className="text-xs text-slate-500">
            {dashboard.year} · Tháng {dashboard.month}
          </p>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 gap-3.5 xl:grid-cols-4">
        {kpiCards.map((card) => (
          <KpiCard key={card.label} {...card} />
        ))}
      </div>

      {/* Trend + Burnout */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <GlassCard className="xl:col-span-2">
          
          <div className="mt-5">
            <TripleTrendChart
              title="Xu hướng quý"
              description={`${dashboard.year}-${String(dashboard.month).padStart(2, '0')} snapshot`}
              points={dashboard.quarterlyTrend}
            />
          </div>
        </GlassCard>

        <GlassCard>
          <SectionHeader
            title="Tổng quan burnout"
            subtitle="Tín hiệu rủi ro chưa xử lý"
            icon={<Shield size={15} className="text-rose-400" />}
          />
          <div className="mt-5 space-y-2">
            <BurnoutRow label="Rủi ro cao"        value={dashboard.burnoutOverview.highRisk}   level="high" />
            <BurnoutRow label="Rủi ro trung bình" value={dashboard.burnoutOverview.mediumRisk} level="medium" />
            <BurnoutRow label="Rủi ro thấp"       value={dashboard.burnoutOverview.lowRisk}    level="low" />
            <BurnoutRow label="Đã giải quyết"     value={dashboard.burnoutOverview.resolved}   level="resolved" />
          </div>
          {/* Burnout donut summary */}
          <BurnoutDonut
            high={dashboard.burnoutOverview.highRisk}
            medium={dashboard.burnoutOverview.mediumRisk}
            low={dashboard.burnoutOverview.lowRisk}
            resolved={dashboard.burnoutOverview.resolved}
          />
        </GlassCard>
      </div>

      {/* Departments + Alerts */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <GlassCard className="xl:col-span-2">
          <SectionHeader
            title="So sánh phòng ban"
            subtitle="Hiệu suất, tinh thần và burnout theo phòng ban"
            icon={<Building2 size={15} className="text-indigo-400" />}
          />
          <div className="mt-5 space-y-2.5">
            {dashboard.departments.length > 0 ? (
              dashboard.departments.map((dept) => (
                <DepartmentRow key={dept.departmentId} dept={dept} />
              ))
            ) : (
              <EmptyState message="Chưa có dữ liệu phòng ban." />
            )}
          </div>
        </GlassCard>

        <GlassCard>
          <SectionHeader
            title="Cảnh báo hệ thống"
            subtitle="Thông báo chưa đọc"
            icon={<ArrowUpRight size={15} className="text-amber-400" />}
          />
          <div className="mt-5 space-y-2.5">
            {dashboard.systemAlerts.length > 0 ? (
              dashboard.systemAlerts.map((alert) => (
                <AlertItem key={alert.id} alert={alert} />
              ))
            ) : (
              <EmptyState message="Không có cảnh báo chưa đọc." />
            )}
          </div>
        </GlassCard>
      </div>

      {/* Monthly Insight */}
      {dashboard.monthlyInsight && (
        <div className="flex gap-4 rounded-xl border border-violet-100 bg-violet-50/50 px-5 py-4">
          <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-violet-100/50">
            <Sparkles size={13} className="text-violet-600" />
          </div>
          <div>
            <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-violet-600">Nhận xét tháng</p>
            <p className="text-sm leading-relaxed text-slate-600 font-medium">{dashboard.monthlyInsight}</p>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Burnout Donut ────────────────────────────────────────────────────────────
function BurnoutDonut({ high, medium, low, resolved }: { high: number; medium: number; low: number; resolved: number }) {
  const total = high + medium + low + resolved
  if (total === 0) return null

  const R = 38
  const CX = 50
  const CY = 50
  const CIRC = 2 * Math.PI * R

  const segments = [
    { value: high,     color: '#ef4444', label: 'Cao' },
    { value: medium,   color: '#f59e0b', label: 'TB'  },
    { value: low,      color: '#10b981', label: 'Thấp' },
    { value: resolved, color: '#94a3b8', label: 'OK'  },
  ]

  let offset = 0
  const arcs = segments.map((s) => {
    const dash = (s.value / total) * CIRC
    const arc = { ...s, dash, offset }
    offset += dash
    return arc
  })

  return (
    <div className="mt-5 flex items-center gap-6">
      <svg width={100} height={100} className="shrink-0 -rotate-90">
        <circle cx={CX} cy={CY} r={R} fill="none" stroke="#f1f5f9" strokeWidth={10} />
        {arcs.map((arc, i) => (
          <circle
            key={i}
            cx={CX} cy={CY} r={R}
            fill="none"
            stroke={arc.color}
            strokeWidth={10}
            strokeDasharray={`${arc.dash} ${CIRC - arc.dash}`}
            strokeDashoffset={-arc.offset}
            strokeLinecap="butt"
          />
        ))}
      </svg>
      <div className="space-y-1.5 text-xs flex-1">
        {segments.map((s) => (
          <div key={s.label} className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full inline-block shrink-0" style={{ background: s.color }} />
            <span className="text-slate-500 font-medium">{s.label}</span>
            <span className="ml-auto font-bold text-slate-700">{s.value}</span>
          </div>
        ))}
        <div className="mt-2 border-t border-slate-100 pt-2 text-slate-400 font-medium">
          Tổng: <span className="font-bold text-slate-800">{total}</span>
        </div>
      </div>
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const accentRing: Record<string, { ring: string; glow: string; track: string; progress: string; icon: string }> = {
  cyan:    { ring: 'ring-cyan-100', glow: 'text-cyan-600',   track: '#f1f5f9', progress: '#06b6d4', icon: 'bg-cyan-50 text-cyan-600' },
  emerald: { ring: 'ring-emerald-100', glow: 'text-emerald-600', track: '#f1f5f9', progress: '#10b981', icon: 'bg-emerald-50 text-emerald-600' },
  amber:   { ring: 'ring-amber-100', glow: 'text-amber-600', track: '#f1f5f9', progress: '#f59e0b', icon: 'bg-amber-50 text-amber-600' },
  indigo:  { ring: 'ring-indigo-100', glow: 'text-indigo-600', track: '#f1f5f9', progress: '#6366f1', icon: 'bg-indigo-50 text-indigo-600' },
}

function KpiCard({
  label, value, sub, ratio, icon: Icon, accent,
}: {
  label: string; value: string; sub: string; ratio: number
  icon: React.ElementType; accent: keyof typeof accentRing
}) {
  const a = accentRing[accent]
  const R = 22
  const CIRC = 2 * Math.PI * R
  const dash = Math.max(0, Math.min(1, ratio)) * CIRC

  return (
    <div className={`relative overflow-hidden rounded-xl border border-slate-100 bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 ring-1 ${a.ring}`}>
      {/* Subtle gradient accent */}
      <div className={`pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full opacity-5 blur-2xl`}
        style={{ background: a.progress }} />

      <div className="flex items-center justify-between gap-2">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
        {/* Mini ring chart */}
        <svg width={52} height={52} className="-rotate-90 shrink-0">
          <circle cx={26} cy={26} r={R} fill="none" stroke={a.track} strokeWidth={5} />
          <circle
            cx={26} cy={26} r={R}
            fill="none"
            stroke={a.progress}
            strokeWidth={5}
            strokeDasharray={`${dash} ${CIRC - dash}`}
            strokeLinecap="round"
          />
        </svg>
      </div>

      <div className="absolute right-[18px] top-[18px] flex h-[52px] w-[52px] items-center justify-center">
        <Icon size={14} className={a.glow} />
      </div>

      <p className="mt-2 text-2xl font-bold tracking-tight text-slate-800">{value}</p>
      <p className="mt-0.5 text-xs text-slate-500 font-medium">{sub}</p>
    </div>
  )
}

function GlassCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border border-slate-100 bg-white p-6 shadow-sm ${className}`}>
      {children}
    </div>
  )
}

function SectionHeader({
  title, subtitle, icon,
}: {
  title: string; subtitle: string; icon: React.ReactNode
}) {
  return (
    <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-50">
      <div>
        <h3 className="text-sm font-bold text-slate-700">{title}</h3>
        <p className="mt-0.5 text-xs text-slate-400">{subtitle}</p>
      </div>
      <div className="mt-0.5 shrink-0 rounded-lg bg-slate-50 p-1.5">{icon}</div>
    </div>
  )
}

const burnoutConfig = {
  high:     { dot: 'bg-rose-500',    text: 'text-rose-600',    bg: 'bg-rose-50/50 border border-rose-100/60' },
  medium:   { dot: 'bg-amber-500',   text: 'text-amber-600',   bg: 'bg-amber-50/50 border border-amber-100/60' },
  low:      { dot: 'bg-emerald-500', text: 'text-emerald-600', bg: 'bg-emerald-50/50 border border-emerald-100/60' },
  resolved: { dot: 'bg-slate-400',   text: 'text-slate-500',   bg: 'bg-slate-50 border border-slate-100' },
}

function BurnoutRow({ label, value, level }: { label: string; value: number; level: keyof typeof burnoutConfig }) {
  const c = burnoutConfig[level]
  return (
    <div className={`flex items-center justify-between rounded-xl px-3.5 py-2.5 ${c.bg}`}>
      <div className="flex items-center gap-2.5">
        <span className={`h-2 w-2 rounded-full ${c.dot}`} />
        <span className="text-xs font-semibold text-slate-500">{label}</span>
      </div>
      <span className={`text-xs font-bold ${c.text}`}>{value}</span>
    </div>
  )
}

function DepartmentRow({ dept }: { dept: any }) {
  const effPct = Math.round((dept.avgEfficiencyRatio ?? 0) * 100)

  return (
    <div className="group rounded-xl border border-slate-100 bg-white p-4 transition-colors hover:shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-slate-700">{dept.departmentName}</p>
          <div className="mt-2 flex items-center gap-3">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-cyan-600 transition-all"
                style={{ width: `${effPct}%` }}
              />
            </div>
            <span className="shrink-0 text-xs font-bold text-cyan-600">{effPct}%</span>
            <span className="shrink-0 text-xs text-slate-400 font-semibold">{dept.avgEfficiencyLabel}</span>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-2 sm:min-w-[22rem]">
          <MiniMetric label="Tinh thần" value={dept.avgMoraleScore.toFixed(1)} />
          <MiniMetric label="Headcount" value={String(dept.headCount)} />
          <MiniMetric label="Rủi ro cao" value={String(dept.highRiskBurnoutCount)} warn={dept.highRiskBurnoutCount > 0} />
          <MiniMetric label="ID" value={`#${dept.departmentId}`} muted />
        </div>
      </div>
    </div>
  )
}

function MiniMetric({ label, value, warn = false, muted = false }: {
  label: string; value: string; warn?: boolean; muted?: boolean
}) {
  return (
    <div className="rounded-lg border border-slate-100 bg-slate-50/50 px-2 py-1.5 text-center">
      <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">{label}</p>
      <p className={`mt-0.5 text-xs font-bold ${warn ? 'text-rose-600' : muted ? 'text-slate-400' : 'text-slate-700'}`}>
        {value}
      </p>
    </div>
  )
}

const alertSeverityStyle: Record<string, { border: string; bg: string; badge: string; text: string; dot: string }> = {
  CRITICAL: { border: 'border-rose-100',   bg: 'bg-rose-50/50',   badge: 'bg-rose-100 text-rose-600',   text: 'text-rose-700',   dot: 'bg-rose-500'   },
  HIGH:     { border: 'border-orange-100', bg: 'bg-orange-50/50', badge: 'bg-orange-100 text-orange-600', text: 'text-orange-700', dot: 'bg-orange-500' },
  MEDIUM:   { border: 'border-amber-100',  bg: 'bg-amber-50/50',  badge: 'bg-amber-100 text-amber-600',  text: 'text-amber-700',  dot: 'bg-amber-500'  },
  LOW:      { border: 'border-slate-100',   bg: 'bg-slate-50/50',  badge: 'bg-slate-100 text-slate-500',  text: 'text-slate-600',  dot: 'bg-slate-400'  },
}
const defaultAlertStyle = alertSeverityStyle.LOW

function AlertItem({ alert }: { alert: any }) {
  const severity = (alert.severity ?? '').toUpperCase()
  const style = alertSeverityStyle[severity] ?? defaultAlertStyle
  return (
    <div className={`rounded-xl border px-4 py-3 shadow-sm ${style.border} ${style.bg}`}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
          <p className={`text-xs font-bold uppercase tracking-wider ${style.text}`}>{alert.alertType}</p>
        </div>
        {alert.severity && (
          <span className={`rounded-md px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest ${style.badge}`}>
            {alert.severity}
          </span>
        )}
      </div>
      <p className={`mt-1.5 text-xs leading-relaxed ${style.text} font-medium`}>{alert.message}</p>
      <p className="mt-2 text-[9px] font-semibold text-slate-400">{new Date(alert.createdAt ?? '').toLocaleString('vi-VN')}</p>
    </div>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 py-8 text-center bg-slate-50/20">
      <p className="text-xs font-medium text-slate-400">{message}</p>
    </div>
  )
}

// ─── LoadingBar ──────────────────────────────────────────────────────────────
function LoadingBar() {
  return (
    <div className="mb-5 h-1 overflow-hidden rounded-full bg-slate-100">
      <div className="h-full w-1/3 animate-[loading_1.5s_ease-in-out_infinite] rounded-full bg-cyan-600" />
    </div>
  )
}

// ─── DashboardSkeleton ────────────────────────────────────────────────────────
function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-[#fafbfc] px-4 py-6 sm:px-6">
      <div className="animate-pulse space-y-5">
        <div className="h-8 w-62 rounded-xl bg-slate-200/50" />
        <div className="grid grid-cols-2 gap-3.5 xl:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 rounded-xl bg-slate-200/50" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        </div>
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
          <div className="h-64 rounded-2xl bg-white/5 xl:col-span-2" />
          <div className="h-64 rounded-2xl bg-white/5" />
        </div>
      </div>
    </div>
  )
}

function formatPercent(value?: number | null) {
  if (value == null || Number.isNaN(value)) return '—'
  return `${(value * 100).toFixed(1)}%`
}