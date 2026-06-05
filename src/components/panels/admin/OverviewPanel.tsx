import { useEffect, useMemo, useState } from 'react'
import {
  AlertTriangle,
  ArrowUpRight,
  Brain,
  Building2,
  CalendarDays,
  Loader2,
  TrendingUp,
  Users,
  CheckCircle2,
  Clock,
  BarChart2,
  Bell,
  RefreshCw
} from 'lucide-react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'
import {
  apiClient,
  type ApiResponse,
  type CompanyDashboardDto,
  type DepartmentDashboardDto,
  type DepartmentDto
} from '@/lib/api'

const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const formatPercent = (value: number) => `${(value * 100).toFixed(1)}%`

const severityClassMap: Record<string, string> = {
  HIGH: 'border-rose-200 bg-rose-50 text-rose-700',
  MEDIUM: 'border-amber-200 bg-amber-50 text-amber-700',
  LOW: 'border-emerald-200 bg-emerald-50 text-emerald-700',
}

function efficiencyColor(ratio: number) {
  if (ratio >= 1.1) return 'text-emerald-600'
  if (ratio >= 0.9) return 'text-blue-600'
  if (ratio >= 0.7) return 'text-amber-600'
  return 'text-rose-600'
}

function efficiencyBg(ratio: number) {
  if (ratio >= 1.1) return 'bg-emerald-50 text-emerald-700'
  if (ratio >= 0.9) return 'bg-blue-50 text-blue-700'
  if (ratio >= 0.7) return 'bg-amber-50 text-amber-700'
  return 'bg-rose-50 text-rose-700'
}

function burnoutBadge(level: string) {
  if (level === 'HIGH') return 'bg-rose-50 text-rose-700'
  if (level === 'MEDIUM') return 'bg-amber-50 text-amber-700'
  return 'bg-emerald-50 text-emerald-700'
}

const MONTH_NAMES = [
  'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
  'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12',
]

export const OverviewPanel = () => {
  const [selectedDeptId, setSelectedDeptId] = useState<number | 'all'>('all')
  const [departments, setDepartments] = useState<DepartmentDto[]>([])
  const [companyData, setCompanyData] = useState<CompanyDashboardDto | null>(null)
  const [deptData, setDeptData] = useState<DepartmentDashboardDto | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    let isMounted = true
    const now = new Date()

    const loadDepartments = async () => {
      try {
        const response = await apiClient.get<ApiResponse<DepartmentDto[]>>('/departments')
        if (response.data.succeeded && response.data.data && isMounted) {
          setDepartments(response.data.data)
        }
      } catch {
        // Fail silently
      }
    }

    const loadData = async () => {
      setIsLoading(true)
      setErrorMessage(null)
      try {
        if (selectedDeptId === 'all') {
          const response = await apiClient.get<ApiResponse<CompanyDashboardDto>>('/dashboard/company', {
            params: {
              year: now.getFullYear(),
              month: now.getMonth() + 1,
            },
          })
          if (!response.data.succeeded || !response.data.data) {
            throw new Error(response.data.message || 'Không thể tải dashboard công ty.')
          }
          if (isMounted) {
            setCompanyData(response.data.data)
            setDeptData(null)
          }
        } else {
          const response = await apiClient.get<ApiResponse<DepartmentDashboardDto>>(`/dashboard/department/${selectedDeptId}`, {
            params: {
              year: now.getFullYear(),
              month: now.getMonth() + 1,
            },
          })
          if (!response.data.succeeded || !response.data.data) {
            throw new Error(response.data.message || 'Không thể tải dashboard phòng ban.')
          }
          if (isMounted) {
            setDeptData(response.data.data)
            setCompanyData(null)
          }
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Không thể tải dữ liệu dashboard.'
        if (isMounted) {
          setErrorMessage(message)
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void loadDepartments()
    void loadData()

    return () => {
      isMounted = false
    }
  }, [selectedDeptId, refreshKey])

  const trendBars = useMemo(() => {
    if (!companyData) return []

    return companyData.quarterlyTrend.map((point) => ({
      label: monthLabels[point.month - 1] ?? `${point.month}`,
      value: point.avgEfficiency,
      morale: point.avgMorale,
      stress: point.avgStress,
    }))
  }, [companyData])

  const deptTrendData = useMemo(() => {
    if (!deptData) return []
    return deptData.monthlyTrend.map((p) => ({
      date: p.date.slice(5), // MM-DD
      ratio: p.efficiencyRatio != null ? +(p.efficiencyRatio * 100).toFixed(1) : null,
    }))
  }, [deptData])

  const deptTeamBarData = useMemo(() => {
    if (!deptData) return []
    return deptData.teams.map((t) => ({
      name: t.teamName,
      hieuSuat: +(t.avgEfficiencyRatio * 100).toFixed(1),
    }))
  }, [deptData])

  const companyStats = useMemo(() => {
    if (!companyData) return []
    return [
      {
        label: 'Avg Efficiency',
        value: companyData.avgEfficiencyLabel,
        subtext: formatPercent(companyData.avgEfficiencyRatio),
        icon: TrendingUp,
        iconClass: 'text-emerald-600',
      },
      {
        label: 'Avg Morale',
        value: companyData.avgMoraleScore.toFixed(2),
        subtext: 'Wellbeing sentiment',
        icon: Brain,
        iconClass: 'text-blue-600',
      },
      {
        label: 'Avg Stress',
        value: companyData.avgStressScore.toFixed(2),
        subtext: 'Current pressure level',
        icon: AlertTriangle,
        iconClass: 'text-amber-600',
      },
      {
        label: 'Active Employees',
        value: companyData.totalActiveEmployees.toString(),
        subtext: `${companyData.departments.length} departments`,
        icon: Users,
        iconClass: 'text-slate-700',
      },
    ]
  }, [companyData])

  return (
    <div className="space-y-6">
      {/* Scope Selector Card */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Phạm vi dữ liệu</h3>
          <p className="text-sm text-slate-500">Xem tổng quan hiệu suất toàn bộ tổ chức hoặc chi tiết từng phòng ban.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold">
            <Building2 className="text-slate-400" size={17} />
            <select
              value={selectedDeptId}
              onChange={(e) => setSelectedDeptId(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="bg-transparent text-slate-700 font-bold outline-none cursor-pointer"
            >
              <option value="all">🏢 Toàn công ty</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  📂 {d.name}
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            onClick={() => setRefreshKey((k) => k + 1)}
            className="inline-flex items-center justify-center p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-800 transition shadow-sm"
            title="Làm mới dữ liệu"
          >
            <RefreshCw size={17} />
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex min-h-[420px] items-center justify-center rounded-2xl border border-slate-200 bg-white">
          <div className="flex items-center gap-3 text-slate-600">
            <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
            Đang tải dữ liệu dashboard...
          </div>
        </div>
      ) : errorMessage ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-700">
          <p className="font-semibold">Không tải được dashboard</p>
          <p className="mt-1 text-sm">{errorMessage}</p>
        </div>
      ) : selectedDeptId === 'all' && companyData ? (
        // ── Rendering Company Dashboard ──────────────────────────────────────
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            {companyStats.map((stat) => {
              const Icon = stat.icon
              return (
                <div key={stat.label} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                    <Icon className={stat.iconClass} size={18} />
                  </div>
                  <p className="mt-4 text-3xl font-bold text-slate-900">{stat.value}</p>
                  <p className="mt-1 text-xs text-slate-500">{stat.subtext}</p>
                </div>
              )
            })}
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            {/* Company quarterly trend */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Quarterly Trend</h3>
                  <p className="text-sm text-slate-500">
                    Tháng {companyData.month}/{companyData.year} snapshot
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                  <CalendarDays size={14} />
                  Last 3 months
                </div>
              </div>

              <div className="mt-6 flex h-72 items-end gap-3">
                {trendBars.map((bar) => (
                  <div key={bar.label} className="flex-1 flex flex-col items-center gap-2">
                    <div className="flex w-full items-end justify-center gap-1">
                      <div className="w-1/2 rounded-t-xl bg-slate-900" style={{ height: `${Math.max((bar.value / 1.5) * 100, 8)}%` }} title={`Efficiency ${bar.value.toFixed(2)}`} />
                      <div className="w-1/2 rounded-t-xl bg-emerald-400/80" style={{ height: `${Math.max((bar.morale / 5) * 100, 8)}%` }} title={`Morale ${bar.morale.toFixed(2)}`} />
                      <div className="w-1/2 rounded-t-xl bg-amber-400/80" style={{ height: `${Math.max((bar.stress / 5) * 100, 8)}%` }} title={`Stress ${bar.stress.toFixed(2)}`} />
                    </div>
                    <span className="text-xs font-medium text-slate-500">{bar.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Company burnout overview */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Burnout Overview</h3>
                  <p className="text-sm text-slate-500">Current unresolved risk signals</p>
                </div>
                <Brain className="text-slate-400" size={18} />
              </div>

              <div className="mt-6 space-y-4">
                {[
                  { label: 'High Risk', value: companyData.burnoutOverview.highRisk, className: 'text-rose-600' },
                  { label: 'Medium Risk', value: companyData.burnoutOverview.mediumRisk, className: 'text-amber-600' },
                  { label: 'Low Risk', value: companyData.burnoutOverview.lowRisk, className: 'text-emerald-600' },
                  { label: 'Resolved', value: companyData.burnoutOverview.resolved, className: 'text-slate-700' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                    <span className="text-sm font-medium text-slate-600">{item.label}</span>
                    <span className={`text-lg font-bold ${item.className}`}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            {/* Departments performance breakdown list */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Department Comparison</h3>
                  <p className="text-sm text-slate-500">Efficiency, morale and burnout pressure by department</p>
                </div>
                <Building2 className="text-slate-400" size={18} />
              </div>

              <div className="mt-5 space-y-3">
                {companyData.departments.map((department) => (
                  <div key={department.departmentId} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-900">{department.departmentName}</p>
                        <p className="text-sm text-slate-500">{department.headCount} employees</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-slate-900">{department.avgEfficiencyLabel}</p>
                        <p className="text-xs text-slate-500">Efficiency {department.avgEfficiencyRatio.toFixed(2)}</p>
                      </div>
                    </div>

                    <div className="mt-3 grid grid-cols-3 gap-3 text-sm">
                      <div className="rounded-lg bg-white px-3 py-2">
                        <p className="text-xs text-slate-500">Morale</p>
                        <p className="font-semibold text-slate-900">{department.avgMoraleScore.toFixed(2)}</p>
                      </div>
                      <div className="rounded-lg bg-white px-3 py-2">
                        <p className="text-xs text-slate-500">High Risk</p>
                        <p className="font-semibold text-rose-600">{department.highRiskBurnoutCount}</p>
                      </div>
                      <div className="rounded-lg bg-white px-3 py-2">
                        <p className="text-xs text-slate-500">Dept ID</p>
                        <p className="font-semibold text-slate-900">{department.departmentId}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Company System alerts */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">System Alerts</h3>
                  <p className="text-sm text-slate-500">Unread system notifications</p>
                </div>
                <ArrowUpRight className="text-slate-400" size={18} />
              </div>

              <div className="mt-5 space-y-3">
                {companyData.systemAlerts.length > 0 ? (
                  companyData.systemAlerts.map((alert) => (
                    <div key={alert.id} className={`rounded-xl border px-4 py-3 ${severityClassMap[alert.severity] ?? 'border-slate-200 bg-slate-50 text-slate-700'}`}>
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold">{alert.alertType}</p>
                        <span className="text-[11px] font-bold uppercase tracking-wide">{alert.severity}</span>
                      </div>
                      <p className="mt-1 text-sm">{alert.message}</p>
                    </div>
                  ))
                ) : (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
                    No unread system alerts.
                  </div>
                )}
              </div>

              {companyData.monthlyInsight && (
                <div className="mt-6 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-4 text-sm text-indigo-800">
                  <p className="mb-1 font-semibold">Monthly Insight</p>
                  <p>{companyData.monthlyInsight}</p>
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        // ── Rendering Department Dashboard ───────────────────────────────────
        deptData && (
          <>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              {/* Efficiency */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-500">Hiệu suất TB</p>
                  <TrendingUp className={efficiencyColor(deptData.avgEfficiencyRatio)} size={18} />
                </div>
                <p className={`mt-4 text-3xl font-bold ${efficiencyColor(deptData.avgEfficiencyRatio)}`}>
                  {(deptData.avgEfficiencyRatio * 100).toFixed(1)}%
                </p>
                <span className={`mt-2 inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${efficiencyBg(deptData.avgEfficiencyRatio)}`}>
                  {deptData.avgEfficiencyLabel}
                </span>
              </div>

              {/* Active Tasks */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-500">Task đang chạy</p>
                  <Clock className="text-blue-600" size={18} />
                </div>
                <p className="mt-4 text-3xl font-bold text-slate-900">{deptData.totalActiveTasks}</p>
                <p className="mt-1 text-xs text-slate-500">
                  <span className="font-semibold text-rose-600">{deptData.overdueTasks}</span> quá hạn
                </p>
              </div>

              {/* Completed */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-500">Hoàn thành tháng này</p>
                  <CheckCircle2 className="text-emerald-600" size={18} />
                </div>
                <p className="mt-4 text-3xl font-bold text-slate-900">{deptData.completedThisMonth}</p>
                <p className="mt-1 text-xs text-slate-500">task đã hoàn thành</p>
              </div>

              {/* Burnout */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-500">Burnout Risk</p>
                  <Brain className="text-rose-600" size={18} />
                </div>
                <div className="mt-4 flex items-end gap-3">
                  <div>
                    <p className="text-3xl font-bold text-rose-600">{deptData.highRiskBurnoutCount}</p>
                    <p className="text-xs text-slate-500">HIGH risk</p>
                  </div>
                  <div className="pb-1">
                    <p className="text-lg font-semibold text-amber-600">{deptData.mediumRiskBurnoutCount}</p>
                    <p className="text-xs text-slate-500">MEDIUM</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Department Charts and lists */}
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
              {/* Monthly Trend */}
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm xl:col-span-2">
                <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">Xu hướng hiệu suất phòng ban</h3>
                    <p className="text-sm text-slate-500">Tháng {deptData.month}/{deptData.year}</p>
                  </div>
                  <TrendingUp size={18} className="text-slate-400" />
                </div>
                <div className="p-6">
                  {deptTrendData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={220}>
                      <LineChart data={deptTrendData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis
                          dataKey="date"
                          tick={{ fontSize: 11, fill: "#94a3b8" }}
                          tickLine={false}
                          axisLine={false}
                          interval={4}
                        />
                        <YAxis
                          tick={{ fontSize: 11, fill: "#94a3b8" }}
                          tickLine={false}
                          axisLine={false}
                          tickFormatter={(v) => `${v}%`}
                          domain={[0, 130]}
                        />
                        <Tooltip
                          formatter={(v) => [`${v}%`, "Hiệu suất"]}
                          contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="ratio"
                          stroke="#3b82f6"
                          strokeWidth={2.5}
                          dot={false}
                          connectNulls
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                      <TrendingUp size={32} className="mb-3 opacity-40" />
                      <p className="text-sm">Chưa có dữ liệu xu hướng.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Burnout alerts list */}
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">Cảnh báo Burnout</h3>
                    <p className="text-sm text-slate-500">HIGH risk gần nhất trong phòng ban</p>
                  </div>
                  <AlertTriangle size={18} className="text-rose-500" />
                </div>
                <div className="divide-y divide-slate-100 max-h-[260px] overflow-y-auto">
                  {deptData.recentHighRiskAlerts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                      <CheckCircle2 size={28} className="mb-2 opacity-40" />
                      <p className="text-sm">Không có cảnh báo HIGH risk.</p>
                    </div>
                  ) : (
                    deptData.recentHighRiskAlerts.map((a) => (
                      <div key={a.signalId} className="flex items-start justify-between gap-3 px-6 py-3 hover:bg-slate-50">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-900">{a.userName}</p>
                          <p className="text-xs text-slate-500">{a.detectedDate}</p>
                        </div>
                        <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${burnoutBadge(a.riskLevel)}`}>
                          {a.riskScore}/100
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Department Team Comparison BarChart & Alerts */}
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
              {/* Teams breakdown */}
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm xl:col-span-2">
                <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">Hiệu suất từng nhóm (Teams)</h3>
                    <p className="text-sm text-slate-500">{deptData.teams.length} nhóm trực thuộc phòng ban</p>
                  </div>
                  <BarChart2 size={18} className="text-slate-400" />
                </div>
                <div className="p-6">
                  {deptTeamBarData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={deptTeamBarData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis
                          dataKey="name"
                          tick={{ fontSize: 12, fill: "#64748b" }}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis
                          tick={{ fontSize: 11, fill: "#94a3b8" }}
                          tickLine={false}
                          axisLine={false}
                          tickFormatter={(v) => `${v}%`}
                          domain={[0, 130]}
                        />
                        <Tooltip
                          formatter={(v) => [`${v}%`, "Hiệu suất"]}
                          contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }}
                        />
                        <Bar dataKey="hieuSuat" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                      <BarChart2 size={28} className="mb-2 opacity-40" />
                      <p className="text-sm">Chưa có dữ liệu nhóm.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Department Unread Alerts */}
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="flex items-center gap-2 border-b border-slate-200 px-6 py-4">
                  <Bell size={18} className="text-slate-400" />
                  <h3 className="text-lg font-semibold text-slate-900">Cảnh báo chưa đọc</h3>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
                    {deptData.unreadAlerts.length}
                  </span>
                </div>
                <div className="divide-y divide-slate-100 max-h-[220px] overflow-y-auto">
                  {deptData.unreadAlerts.length === 0 ? (
                    <div className="flex items-center justify-center py-8 text-slate-400">
                      <p className="text-xs">Không có cảnh báo chưa đọc.</p>
                    </div>
                  ) : (
                    deptData.unreadAlerts.map((alert) => {
                      const severityClass =
                        alert.severity === 'HIGH'
                          ? 'border-rose-200 bg-rose-50 text-rose-700'
                          : alert.severity === 'MEDIUM'
                          ? 'border-amber-200 bg-amber-50 text-amber-700'
                          : 'border-emerald-200 bg-emerald-50 text-emerald-700';
                      return (
                        <div key={alert.id} className="flex items-start gap-3 px-6 py-3">
                          <span className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold border ${severityClass}`}>
                            {alert.severity}
                          </span>
                          <div className="min-w-0">
                            <p className="text-xs text-slate-700 leading-relaxed">{alert.message}</p>
                            {alert.createdAt && (
                              <p className="mt-0.5 text-[10px] text-slate-400">
                                {new Date(alert.createdAt).toLocaleDateString('vi-VN')}
                              </p>
                            )}
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            </div>
          </>
        )
      )}
    </div>
  )
}
