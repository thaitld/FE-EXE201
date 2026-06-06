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
    <div className="flex items-center gap-3 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-5 py-4 text-rose-400">
      <AlertTriangle size={18} className="shrink-0" />
      <span className="text-sm font-medium">{error}</span>
    </div>
  )

  if (!initialDashboard && !dashboard) return null

  if (!initialDashboard) {
    return (
      <div className="min-h-screen bg-white px-4 py-6 font-sans text-slate-900 sm:px-6">
        {/* Top bar */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-3.5">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-400/10">
              <CalendarDays size={15} className="text-cyan-400" />
            </div>
            <span className="text-sm font-semibold text-black-200">Kỳ báo cáo</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <PeriodSelect value={month} onChange={(v) => setMonth(Number(v))} options={MONTH_OPTIONS.map(o => ({ value: o.value, label: o.label }))} />
            <PeriodSelect value={year} onChange={(v) => setYear(Number(v))} options={yearRange.map(y => ({ value: y, label: String(y) }))} />
            <button
              type="button"
              onClick={() => setRefreshKey((k) => k + 1)}
              disabled={isLoading}
              className="inline-flex items-center gap-2 rounded-xl border border-white/8 bg-white/5 px-4 py-2 text-sm font-medium text-slate-300 transition-all hover:border-cyan-400/30 hover:bg-cyan-400/8 hover:text-cyan-300 active:scale-95 disabled:opacity-40"
            >
              <RefreshCw size={13} className={isLoading ? 'animate-spin text-cyan-400' : ''} />
              Làm mới
            </button>
          </div>
        </div>

        {isLoading && !dashboard && <LoadingBar />}
        {error && (
          <div className="mb-5 flex items-center gap-3 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-5 py-4 text-rose-400">
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
    <div className="min-h-screen bg-white px-4 py-6 font-sans text-slate-900 sm:px-6">
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
        className="h-9 appearance-none rounded-xl border border-white/8 white pl-3 pr-8 text-black font-medium text-slate-200 outline-none transition hover:border-white/14 focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/10"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-white">{opt.label}</option>
        ))}
      </select>
      <ChevronDown size={12} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
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
        <div className="flex gap-4 rounded-2xl border border-violet-500/20 bg-violet-500/8 px-5 py-4">
          <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-violet-500/15">
            <Sparkles size={13} className="text-violet-400" />
          </div>
          <div>
            <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-violet-400">Nhận xét tháng</p>
            <p className="text-sm leading-relaxed text-slate-300">{dashboard.monthlyInsight}</p>
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
    { value: high,     color: '#f43f5e', label: 'Cao' },
    { value: medium,   color: '#f59e0b', label: 'TB'  },
    { value: low,      color: '#10b981', label: 'Thấp' },
    { value: resolved, color: '#334155', label: 'OK'  },
  ]

  let offset = 0
  const arcs = segments.map((s) => {
    const dash = (s.value / total) * CIRC
    const arc = { ...s, dash, offset }
    offset += dash
    return arc
  })

  return (
    <div className="mt-5 flex items-center gap-4">
      <svg width={100} height={100} className="shrink-0 -rotate-90">
        <circle cx={CX} cy={CY} r={R} fill="none" stroke="#1e293b" strokeWidth={10} />
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
      <div className="space-y-1 text-xs">
        {segments.map((s) => (
          <div key={s.label} className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full inline-block shrink-0" style={{ background: s.color }} />
            <span className="text-slate-400">{s.label}</span>
            <span className="ml-auto font-semibold text-slate-200">{s.value}</span>
          </div>
        ))}
        <div className="mt-1 border-t border-slate-200 pt-1 text-slate-600">
          Tổng: <span className="font-semibold text-slate-900">{total}</span>
        </div>
      </div>
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const accentRing: Record<string, { ring: string; glow: string; track: string; progress: string; icon: string }> = {
  cyan:    { ring: 'ring-cyan-400/15',   glow: 'text-cyan-400',   track: '#0e2a33', progress: '#22d3ee', icon: 'bg-cyan-400/10 text-cyan-400'    },
  emerald: { ring: 'ring-emerald-400/15',glow: 'text-emerald-400',track: '#0d2b1f', progress: '#34d399', icon: 'bg-emerald-400/10 text-emerald-400'},
  amber:   { ring: 'ring-amber-400/15',  glow: 'text-amber-400',  track: '#2c1d07', progress: '#fbbf24', icon: 'bg-amber-400/10 text-amber-400'   },
  indigo:  { ring: 'ring-indigo-400/15', glow: 'text-indigo-400', track: '#17183a', progress: '#818cf8', icon: 'bg-indigo-400/10 text-indigo-400' },
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
    <div className={`relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 ring-1 ${a.ring} transition-shadow hover:shadow-md`}>
      {/* Subtle gradient accent */}
      <div className={`pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full opacity-10 blur-2xl`}
        style={{ background: a.progress }} />

      <div className="flex items-center justify-between gap-2">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">{label}</p>
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
          {/* Icon in center */}
        </svg>
      </div>

      {/* Icon overlay on ring — rendered as sibling for simplicity */}
      <div className="absolute right-[18px] top-[18px] flex h-[52px] w-[52px] items-center justify-center">
        <Icon size={14} className={a.glow} />
      </div>

      <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">{value}</p>
      <p className="mt-0.5 text-xs text-slate-600">{sub}</p>
    </div>
  )
}

function GlassCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-slate-200 bg-white p-6 ${className}`}>
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
    <div className="flex items-start justify-between gap-3">
      <div>
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
        <p className="mt-0.5 text-xs text-slate-600">{subtitle}</p>
      </div>
      <div className="mt-0.5 shrink-0">{icon}</div>
    </div>
  )
}

const burnoutConfig = {
  high:     { dot: 'bg-rose-500',    text: 'text-rose-400',    bg: 'bg-rose-500/8   border border-rose-500/15'   },
  medium:   { dot: 'bg-amber-400',   text: 'text-amber-400',   bg: 'bg-amber-400/8  border border-amber-400/15'  },
  low:      { dot: 'bg-emerald-400', text: 'text-emerald-400', bg: 'bg-emerald-400/8 border border-emerald-400/15'},
  resolved: { dot: 'bg-slate-500',   text: 'text-slate-400',   bg: 'bg-white/3       border border-white/6'       },
}

function BurnoutRow({ label, value, level }: { label: string; value: number; level: keyof typeof burnoutConfig }) {
  const c = burnoutConfig[level]
  return (
    <div className={`flex items-center justify-between rounded-xl px-3.5 py-2.5 ${c.bg}`}>
      <div className="flex items-center gap-2.5">
        <span className={`h-2 w-2 rounded-full ${c.dot}`} />
        <span className="text-sm text-slate-400">{label}</span>
      </div>
      <span className={`text-sm font-bold ${c.text}`}>{value}</span>
    </div>
  )
}

function DepartmentRow({ dept }: { dept: any }) {
  const effPct = Math.round((dept.avgEfficiencyRatio ?? 0) * 100)

  return (
    <div className="group rounded-xl border border-slate-200 bg-white p-4 transition-colors hover:shadow-md">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-slate-900">{dept.departmentName}</p>
          <div className="mt-2 flex items-center gap-2">
            {/* Efficiency bar */}
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-cyan-600 transition-all"
                style={{ width: `${effPct}%` }}
              />
            </div>
            <span className="shrink-0 text-xs font-medium text-cyan-600">{effPct}%</span>
            <span className="shrink-0 text-xs text-slate-600">{dept.avgEfficiencyLabel}</span>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-2 sm:min-w-[22rem]">
          <MiniMetric label="Tinh thần" value={dept.avgMoraleScore.toFixed(2)} />
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
    <div className="rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-center">
      <p className="text-[9px] font-medium uppercase tracking-wide text-slate-600">{label}</p>
      <p className={`mt-0.5 text-sm font-bold ${warn ? 'text-rose-400' : muted ? 'text-slate-600' : 'text-slate-900'}`}>
        {value}
      </p>
    </div>
  )
}

const alertSeverityStyle: Record<string, { border: string; bg: string; badge: string; text: string; dot: string }> = {
  CRITICAL: { border: 'border-rose-500/25',   bg: 'bg-rose-500/8',   badge: 'bg-rose-500/20 text-rose-400',   text: 'text-rose-400',   dot: 'bg-rose-500'   },
  HIGH:     { border: 'border-orange-400/25', bg: 'bg-orange-400/8', badge: 'bg-orange-400/20 text-orange-400', text: 'text-orange-400', dot: 'bg-orange-400' },
  MEDIUM:   { border: 'border-amber-400/25',  bg: 'bg-amber-400/8',  badge: 'bg-amber-400/20 text-amber-400',  text: 'text-amber-400',  dot: 'bg-amber-400'  },
  LOW:      { border: 'border-white/6',        bg: 'bg-white/3',       badge: 'bg-white/8 text-slate-400',       text: 'text-slate-400',  dot: 'bg-slate-500'  },
}
const defaultAlertStyle = alertSeverityStyle.LOW

function AlertItem({ alert }: { alert: any }) {
  const severity = (alert.severity ?? '').toUpperCase()
  const style = alertSeverityStyle[severity] ?? defaultAlertStyle
  return (
    <div className={`rounded-xl border px-4 py-3 ${style.border} ${style.bg}`}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
          <p className={`text-sm font-semibold ${style.text}`}>{alert.alertType}</p>
        </div>
        {alert.severity && (
          <span className={`rounded-md px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest ${style.badge}`}>
            {alert.severity}
          </span>
        )}
      </div>
      <p className={`mt-1.5 text-xs leading-relaxed ${style.text} opacity-75`}>{alert.message}</p>
      <p className="mt-2 text-[10px] text-slate-600">{new Date(alert.createdAt ?? '').toLocaleString('vi-VN')}</p>
    </div>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 py-8 text-center">
      <p className="text-sm text-slate-600">{message}</p>
    </div>
  )
}

function LoadingBar() {
  return (
    <div className="mb-5 h-0.5 overflow-hidden rounded-full bg-slate-100">
      <div className="h-full w-1/3 animate-[loading_1.5s_ease-in-out_infinite] rounded-full bg-cyan-600" />
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-white px-4 py-6 sm:px-6">
      <div className="animate-pulse space-y-5">
        <div className="h-12 w-64 rounded-xl bg-white/5" />
        <div className="grid grid-cols-2 gap-3.5 xl:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-white/5" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
          <div className="h-72 rounded-2xl bg-white/5 xl:col-span-2" />
          <div className="h-72 rounded-2xl bg-white/5" />
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