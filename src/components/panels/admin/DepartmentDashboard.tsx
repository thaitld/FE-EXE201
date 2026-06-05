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
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-slate-600">Controls</p>
              <h3 className="text-lg font-semibold text-slate-900">Period and scope</h3>
            </div>
            <div className="flex flex-wrap items-end gap-3 opacity-60">
              <div className="h-10 w-56 rounded-xl bg-slate-100" />
              <div className="h-10 w-28 rounded-xl bg-slate-100" />
              <div className="h-10 w-20 rounded-xl bg-slate-100" />
              <div className="h-10 w-28 rounded-xl bg-slate-100" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="rounded-2xl border border-white/5 bg-white/4 p-5">
              <div className="h-6 w-24 rounded bg-slate-100 mb-3" />
              <div className="h-8 w-40 rounded bg-slate-100 mb-2" />
              <div className="h-3 w-20 rounded bg-slate-100" />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2">
            <div className="h-40 rounded bg-slate-100" />
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="h-40 rounded bg-slate-100" />
          </div>
        </div>
      </div>
    )
  if (error && !dashboard) return <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-700">{error}</div>
  
  if (!initialDashboard && !dashboard && selectedDepartmentId != null) {
    return (
      <div className="space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-slate-600">Controls</p>
              <h3 className="text-lg font-semibold text-slate-900">Period and scope</h3>
            </div>
            <div className="flex flex-wrap items-end gap-3">
              <label className="space-y-1.5">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Department</span>
                <select
                  value={selectedDepartmentId ?? ''}
                  onChange={(e) => setSelectedDepartmentId(e.target.value ? Number(e.target.value) : null)}
                  className="min-w-56 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none"
                >
                  <option value="">Select department</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-1.5">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Month</span>
                <select
                  value={month}
                  onChange={(e) => setMonth(Number(e.target.value))}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none"
                >
                  {MONTH_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-1.5">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Year</span>
                <select
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none"
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
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <RefreshCw size={14} />
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
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-slate-600">Controls</p>
              <h3 className="text-lg font-semibold text-slate-900">Period and scope</h3>
            </div>
            <div className="flex flex-wrap items-end gap-3">
              <label className="space-y-1.5">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Department</span>
                <select
                  value={selectedDepartmentId ?? ''}
                  onChange={(e) => setSelectedDepartmentId(e.target.value ? Number(e.target.value) : null)}
                  className="min-w-56 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none"
                >
                  <option value="">Select department</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-1.5">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Month</span>
                <select
                  value={month}
                  onChange={(e) => setMonth(Number(e.target.value))}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none"
                >
                  {MONTH_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-1.5">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Year</span>
                <select
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none"
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
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 
                px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <RefreshCw size={14} />
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
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2">
          
          <div className="mt-6">
            <SimpleTrendChart title="Monthly trend" description={`${dashboard.departmentName} ·
             ${dashboard.month}/${dashboard.year}`} points={dashboard.monthlyTrend} />
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Burnout counts</h3>
              <p className="text-sm text-slate-500">High / medium risk overview.</p>
            </div>
            <Brain size={18} className="text-slate-400" />
          </div>

          <div className="mt-5 space-y-3">
            <StatRow label="High risk" value={dashboard.highRiskBurnoutCount} tone="text-rose-600" />
            <StatRow label="Medium risk" value={dashboard.mediumRiskBurnoutCount} tone="text-amber-600" />
            <StatRow label="Department" value={dashboard.departmentName} tone="text-slate-800" />
          </div>
        </section>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Teams</h3>
              <p className="text-sm text-slate-500">KPI theo từng team trong phòng ban.</p>
            </div>
            <Building2 size={18} className="text-slate-400" />
          </div>

          <div className="mt-5 space-y-3">
            {dashboard.teams.length > 0 ? (
              dashboard.teams.map((team) => (
                <div key={team.teamId} className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="font-semibold text-slate-900">{team.teamName}</p>
                      <p className="mt-1 text-sm text-slate-500">
                        {team.avgEfficiencyLabel} · {formatPercent(team.avgEfficiencyRatio)}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm sm:min-w-[16rem]">
                      <SmallStat label="Morale" value={team.avgMoraleScore != null ? team.avgMoraleScore.toFixed(2) : '-'} />
                      <SmallStat label="Stress" value={team.avgStressScore != null ? team.avgStressScore.toFixed(2) : '-'} />
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

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Recent alerts</h3>
              <p className="text-sm text-slate-500">Burnout alerts gần đây.</p>
            </div>
            <AlertTriangle size={18} className="text-slate-400" />
          </div>

          <div className="mt-5 space-y-3">
            {dashboard.recentHighRiskAlerts.length > 0 ? (
              dashboard.recentHighRiskAlerts.map((alert) => (
                <div key={alert.id} className={`rounded-2xl border border-slate-200 bg-white px-4 py-3 ${alert.riskLevel ?? ''}`}>
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold">{alert.userName}</p>
                    <span className="text-[11px] font-bold uppercase tracking-wide">{alert.riskLevel}</span>
                  </div>
                  <p className="mt-1 text-sm">{alert.message}</p>
                  <p className="mt-2 text-xs opacity-80">{new Date(alert.detectedDate).toLocaleString('vi-VN')}</p>
                </div>
              ))
            ) : (
              <EmptyBlock message="No recent high-risk alerts." />
            )}
          </div>
        </section>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Unread alerts</h3>
            <p className="text-sm text-slate-500">Thông báo chưa đọc trong dashboard phòng ban.</p>
          </div>
          <ArrowUpRight size={18} className="text-slate-400" />
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 xl:grid-cols-2">
            {dashboard.unreadAlerts.length > 0 ? (
            dashboard.unreadAlerts.map((alert) => (
              <div key={alert.id} className={`rounded-2xl border border-slate-200 bg-white px-4 py-3 ${alert.severity ?? ''}`}>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold">{alert.alertType}</p>
                  <span className="text-[11px] font-bold uppercase tracking-wide">{alert.severity}</span>
                </div>
                <p className="mt-1 text-sm">{alert.message}</p>
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500 xl:col-span-2">
              No unread alerts.
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

function formatPercent(value?: number | null) {
  if (value == null || Number.isNaN(value)) return '-'
  return `${(value * 100).toFixed(1)}%`
}

