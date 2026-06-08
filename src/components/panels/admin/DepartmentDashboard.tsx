import { useEffect, useState, useMemo } from 'react'
import { TrendingUp, Users, AlertTriangle, Building2, ArrowUpRight, Sparkles, Brain, RefreshCw } from 'lucide-react'
import { apiClient, type ApiResponse, type DepartmentDashboardDto, type DepartmentDto } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import { MetricCard, StatRow, SmallStat, EmptyBlock, SimpleTrendChart } from './DashboardHelpers'

export default function DepartmentDashboardView({ dashboard: initialDashboard, departmentId }: { dashboard?: DepartmentDashboardDto; departmentId?: number } = {}) {
  const { user } = useAuth()
  const [dashboard, setDashboard] = useState<DepartmentDashboardDto | null>(initialDashboard ?? null)
  const [isLoading, setIsLoading] = useState(initialDashboard == null)
  const [error, setError] = useState<string | null>(null)
  const [departments, setDepartments] = useState<DepartmentDto[]>([])
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<number | null>(null)
  const [year, setYear] = useState(new Date().getFullYear())
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    if (initialDashboard) {
      setDashboard(initialDashboard)
    }
  }, [initialDashboard])

  useEffect(() => {
    if (initialDashboard) return
    let cancelled = false
    const load = async () => {
      try {
        const res = await apiClient.get<ApiResponse<DepartmentDto[] | import('@/lib/api').PagedResult<DepartmentDto>>>(
          '/departments',
        )
        // backend may return either an array or a PagedResult
        const data = res.data.data as any
        const items: DepartmentDto[] = data?.items ?? data ?? []
        if (!cancelled) {
          setDepartments(items)
          if (selectedDepartmentId == null && items.length > 0) {
            const matched = user?.departmentName
              ? items.find((d) => d.name.trim().toLowerCase() === user.departmentName?.trim().toLowerCase())
              : undefined
            setSelectedDepartmentId(matched?.id ?? items[0].id)
          }
        }
      } catch (err) {
        if (!cancelled) setError('Không thể tải danh sách phòng ban')
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [initialDashboard, user?.departmentName])

  // if a departmentId prop is provided (for direct checks), use it
  useEffect(() => {
    if (departmentId != null) setSelectedDepartmentId(departmentId)
  }, [departmentId])

  // read query params on first load to pre-select department/year/month
  useEffect(() => {
    try {
      const qs = new URLSearchParams(window.location.search)
      const qDept = Number(qs.get('departmentId') ?? qs.get('deptId') ?? '') || null
      const qYear = Number(qs.get('year') ?? '') || null
      const qMonth = Number(qs.get('month') ?? '') || null
      if (qDept) setSelectedDepartmentId(qDept)
      if (qYear) setYear(qYear)
      if (qMonth) setMonth(qMonth)
    } catch (e) {
      // ignore
    }
    // only run once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // sync selection to URL without adding history entries
  useEffect(() => {
    if (selectedDepartmentId == null) return
    try {
      const qs = new URLSearchParams(window.location.search)
      qs.set('departmentId', String(selectedDepartmentId))
      qs.set('year', String(year))
      qs.set('month', String(month))
      const newUrl = window.location.pathname + '?' + qs.toString() + window.location.hash
      window.history.replaceState(null, '', newUrl)
    } catch (e) {
      // ignore
    }
  }, [selectedDepartmentId, year, month])

  useEffect(() => {
    if (initialDashboard || selectedDepartmentId == null) return
    let cancelled = false
    const load = async () => {
      setIsLoading(true)
      try {
        const res = await apiClient.get<ApiResponse<DepartmentDashboardDto>>(`/dashboard/department/${selectedDepartmentId}`, {
          params: { year, month },
        })
        if (!cancelled) {
          setDashboard(res.data.data ?? null)
          setError(null)
        }
      } catch (err) {
        // provide clearer messages for auth errors
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const e: any = err
        if (!cancelled) {
          if (e?.response?.status === 401) {
            setError('Chưa đăng nhập. Vui lòng đăng nhập để xem dashboard phòng ban.')
          } else if (e?.response?.status === 403) {
            setError('Bạn không có quyền truy cập dashboard phòng ban (Admin/Manager/HR).')
          } else {
            setError('Không thể tải department dashboard')
          }
          setDashboard(null)
        }
        // eslint-disable-next-line no-console
        console.error('Failed to load department dashboard', err)
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [initialDashboard, selectedDepartmentId, year, month, refreshKey])

  const MONTH_OPTIONS = useMemo(
    () => [
      { value: 1, label: 'Jan' },
      { value: 2, label: 'Feb' },
      { value: 3, label: 'Mar' },
      { value: 4, label: 'Apr' },
      { value: 5, label: 'May' },
      { value: 6, label: 'Jun' },
      { value: 7, label: 'Jul' },
      { value: 8, label: 'Aug' },
      { value: 9, label: 'Sep' },
      { value: 10, label: 'Oct' },
      { value: 11, label: 'Nov' },
      { value: 12, label: 'Dec' },
    ],
    [],
  )

  const yearRange = useMemo(() => {
    const current = new Date().getFullYear()
    return [current - 1, current, current + 1]
  }, [])

  if (isLoading && !dashboard)
    return (
      <div className="space-y-6">
        <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Controls</p>
              <h3 className="text-sm font-bold text-slate-700">Period and scope</h3>
            </div>
            <div className="flex flex-wrap items-end gap-3 opacity-60">
              <div className="h-9 w-56 rounded-xl bg-slate-100" />
              <div className="h-9 w-28 rounded-xl bg-slate-100" />
              <div className="h-9 w-20 rounded-xl bg-slate-100" />
              <div className="h-9 w-28 rounded-xl bg-slate-100" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
              <div className="h-4 w-24 rounded bg-slate-100 mb-3" />
              <div className="h-8 w-40 rounded bg-slate-100 mb-2" />
              <div className="h-3 w-20 rounded bg-slate-100" />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm xl:col-span-2">
            <div className="h-40 rounded bg-slate-100" />
          </div>
          <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="h-40 rounded bg-slate-100" />
          </div>
        </div>
      </div>
    )
  if (error && !dashboard) return <div className="rounded-xl border border-rose-100 bg-rose-50/50 p-4 text-rose-600 font-medium text-sm">{error}</div>
  
  if (!initialDashboard && !dashboard && selectedDepartmentId != null) {
    return (
      <div className="space-y-6">
        <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Controls</p>
              <h3 className="text-sm font-bold text-slate-700">Period and scope</h3>
            </div>
            <div className="flex flex-wrap items-end gap-3">
              <label className="space-y-1.5 flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Department</span>
                <select
                  value={selectedDepartmentId ?? ''}
                  onChange={(e) => setSelectedDepartmentId(e.target.value ? Number(e.target.value) : null)}
                  className="min-w-56 h-9 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-700 outline-none hover:border-slate-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/10 transition"
                >
                  <option value="">Select department</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-1.5 flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Month</span>
                <select
                  value={month}
                  onChange={(e) => setMonth(Number(e.target.value))}
                  className="h-9 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-700 outline-none hover:border-slate-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/10 transition"
                >
                  {MONTH_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-1.5 flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Year</span>
                <select
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  className="h-9 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-700 outline-none hover:border-slate-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/10 transition"
                >
                  {yearRange.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </label>
              <button
                type="button"
                onClick={() => setRefreshKey((k) => k + 1)}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 h-9 text-xs font-bold text-slate-600 transition hover:bg-slate-50 active:scale-95"
              >
                <RefreshCw size={13} className="text-slate-400" />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!dashboard) return null
  const stats = [
    { label: 'Avg efficiency', value: dashboard.avgEfficiencyLabel, hint: formatPercent(dashboard.avgEfficiencyRatio), icon: TrendingUp, iconClassName: 'text-emerald-600' },
    { label: 'Active tasks', value: String(dashboard.totalActiveTasks), hint: 'Tasks currently active', icon: Users, iconClassName: 'text-blue-600' },
    { label: 'Overdue tasks', value: String(dashboard.overdueTasks), hint: 'Needs attention', icon: AlertTriangle, iconClassName: 'text-rose-600' },
    { label: 'Completed this month', value: String(dashboard.completedThisMonth), hint: 'Monthly progress', icon: Sparkles, iconClassName: 'text-cyan-600' },
  ]

  return (
    <div className="space-y-6">
      {/* Controls visible when dashboard is loaded so user can change period or copy link */}
      {!initialDashboard && (
        <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Controls</p>
              <h3 className="text-sm font-bold text-slate-700">Period and scope</h3>
            </div>
            <div className="flex flex-wrap items-end gap-3">
              <label className="space-y-1.5 flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Department</span>
                <select
                  value={selectedDepartmentId ?? ''}
                  onChange={(e) => setSelectedDepartmentId(e.target.value ? Number(e.target.value) : null)}
                  className="min-w-56 h-9 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-700 outline-none hover:border-slate-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/10 transition"
                >
                  <option value="">Select department</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-1.5 flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Month</span>
                <select
                  value={month}
                  onChange={(e) => setMonth(Number(e.target.value))}
                  className="h-9 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-700 outline-none hover:border-slate-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/10 transition"
                >
                  {MONTH_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-1.5 flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Year</span>
                <select
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  className="h-9 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-700 outline-none hover:border-slate-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/10 transition"
                >
                  {yearRange.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </label>
              <button
                type="button"
                onClick={() => setRefreshKey((k) => k + 1)}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 h-9 text-xs font-bold text-slate-600 transition hover:bg-slate-50 active:scale-95"
              >
                <RefreshCw size={13} className="text-slate-400" />
                Refresh
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <MetricCard key={stat.label} label={stat.label} value={stat.value} hint={stat.hint} icon={stat.icon as any} iconClassName={stat.iconClassName} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <section className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm xl:col-span-2">
          <div className="mt-2">
            <SimpleTrendChart title="Monthly trend" description={`${dashboard.departmentName} · ${dashboard.month}/${dashboard.year}`} points={dashboard.monthlyTrend} />
          </div>
        </section>

        <section className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4 pb-3 border-b border-slate-50">
            <div>
              <h3 className="text-sm font-bold text-slate-700">Burnout counts</h3>
              <p className="text-xs text-slate-400">High / medium risk overview.</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-1.5">
              <Brain size={15} className="text-slate-500" />
            </div>
          </div>

          <div className="mt-5 space-y-2.5">
            <StatRow label="High risk" value={dashboard.highRiskBurnoutCount} tone="text-rose-600 font-bold" />
            <StatRow label="Medium risk" value={dashboard.mediumRiskBurnoutCount} tone="text-amber-600 font-bold" />
            <StatRow label="Department" value={dashboard.departmentName} tone="text-slate-700 font-semibold" />
          </div>
        </section>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <section className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm xl:col-span-2">
          <div className="flex items-center justify-between gap-4 pb-3 border-b border-slate-50">
            <div>
              <h3 className="text-sm font-bold text-slate-700">Teams</h3>
              <p className="text-xs text-slate-400">KPI theo từng team trong phòng ban.</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-1.5">
              <Building2 size={15} className="text-slate-500" />
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {dashboard.teams.length > 0 ? (
              dashboard.teams.map((team) => (
                <div key={team.teamId} className="rounded-xl border border-slate-100 bg-white p-4 transition-colors hover:shadow-sm">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="font-bold text-slate-700 text-sm">{team.teamName}</p>
                      <p className="mt-1 text-xs text-slate-400 font-semibold">
                        {team.avgEfficiencyLabel} · {formatPercent(team.avgEfficiencyRatio)}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs sm:min-w-[16rem]">
                      <SmallStat label="Morale" value={team.avgMoraleScore != null ? team.avgMoraleScore.toFixed(1) : '-'} />
                      <SmallStat label="Stress" value={team.avgStressScore != null ? team.avgStressScore.toFixed(1) : '-'} />
                      <SmallStat label="Members" value={team.activeMembers != null ? String(team.activeMembers) : '-'} />
                      <SmallStat label="High risk" value={team.highRiskBurnoutCount != null ? String(team.highRiskBurnoutCount) : '-'} />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <EmptyBlock message="Chưa có team nào trong phòng ban này." />
            )}
          </div>
        </section>

        <section className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4 pb-3 border-b border-slate-50">
            <div>
              <h3 className="text-sm font-bold text-slate-700">Recent alerts</h3>
              <p className="text-xs text-slate-400">Burnout alerts gần đây.</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-1.5">
              <AlertTriangle size={15} className="text-slate-500" />
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {dashboard.recentHighRiskAlerts.length > 0 ? (
              dashboard.recentHighRiskAlerts.map((alert) => {
                const level = (alert.riskLevel ?? '').toLowerCase()
                const c = burnoutConfig[level === 'high' ? 'high' : level === 'medium' ? 'medium' : 'low'] ?? burnoutConfig.resolved
                return (
                  <div key={alert.id} className={`rounded-xl border px-4 py-3 shadow-sm ${c.bg}`}>
                    <div className="flex items-center justify-between gap-2">
                      <p className={`text-xs font-bold ${c.text}`}>{alert.userName}</p>
                      <span className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${c.text} bg-slate-50`}>{alert.riskLevel}</span>
                    </div>
                    <p className="mt-1.5 text-xs text-slate-600 font-medium leading-relaxed">{alert.message}</p>
                    <p className="mt-2 text-[9px] text-slate-400 font-semibold">{new Date(alert.detectedDate).toLocaleString('vi-VN')}</p>
                  </div>
                )
              })
            ) : (
              <EmptyBlock message="No recent high-risk alerts." />
            )}
          </div>
        </section>
      </div>

      <section className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4 pb-3 border-b border-slate-50">
          <div>
            <h3 className="text-sm font-bold text-slate-700">Unread alerts</h3>
            <p className="text-xs text-slate-400">Thông báo chưa đọc trong dashboard phòng ban.</p>
          </div>
          <div className="rounded-lg bg-slate-50 p-1.5">
            <ArrowUpRight size={15} className="text-slate-500" />
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 xl:grid-cols-2">
          {dashboard.unreadAlerts.length > 0 ? (
            dashboard.unreadAlerts.map((alert) => {
              const severity = (alert.severity ?? '').toUpperCase()
              const style = alertSeverityStyle[severity] ?? defaultAlertStyle
              return (
                <div key={alert.id} className={`rounded-xl border px-4 py-3 shadow-sm ${style.border} ${style.bg}`}>
                  <div className="flex items-center justify-between gap-2">
                    <p className={`text-xs font-bold uppercase tracking-wider ${style.text}`}>{alert.alertType}</p>
                    <span className={`rounded-md px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest ${style.badge}`}>{alert.severity}</span>
                  </div>
                  <p className={`mt-1.5 text-xs leading-relaxed ${style.text} font-medium`}>{alert.message}</p>
                </div>
              )
            })
          ) : (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 px-4 py-6 text-xs text-slate-400 text-center font-medium xl:col-span-2">
              No unread alerts.
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

const burnoutConfig = {
  high:     { dot: 'bg-rose-500',    text: 'text-rose-600',    bg: 'bg-rose-50/50 border border-rose-100/60' },
  medium:   { dot: 'bg-amber-500',   text: 'text-amber-600',   bg: 'bg-amber-50/50 border border-amber-100/60' },
  low:      { dot: 'bg-emerald-500', text: 'text-emerald-600', bg: 'bg-emerald-50/50 border border-emerald-100/60' },
  resolved: { dot: 'bg-slate-400',   text: 'text-slate-500',   bg: 'bg-slate-50 border border-slate-100' },
}

const alertSeverityStyle: Record<string, { border: string; bg: string; badge: string; text: string; dot: string }> = {
  CRITICAL: { border: 'border-rose-100',   bg: 'bg-rose-50/50',   badge: 'bg-rose-100 text-rose-600',   text: 'text-rose-700',   dot: 'bg-rose-500'   },
  HIGH:     { border: 'border-orange-100', bg: 'bg-orange-50/50', badge: 'bg-orange-100 text-orange-600', text: 'text-orange-700', dot: 'bg-orange-500' },
  MEDIUM:   { border: 'border-amber-100',  bg: 'bg-amber-50/50',  badge: 'bg-amber-100 text-amber-600',  text: 'text-amber-700',  dot: 'bg-amber-500'  },
  LOW:      { border: 'border-slate-100',   bg: 'bg-slate-50/50',  badge: 'bg-slate-100 text-slate-500',  text: 'text-slate-600',  dot: 'bg-slate-400'  },
}
const defaultAlertStyle = alertSeverityStyle.LOW

function formatPercent(value?: number | null) {
  if (value == null || Number.isNaN(value)) return '-'
  return `${(value * 100).toFixed(1)}%`
}
