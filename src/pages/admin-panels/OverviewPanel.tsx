import { useEffect, useMemo, useState } from 'react'
import { AlertTriangle, ArrowUpRight, Brain, Building2, CalendarDays, Loader2, TrendingUp, Users } from 'lucide-react'
import { apiClient, type ApiResponse, type CompanyDashboardDto } from '@/lib/api'

const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const formatPercent = (value: number) => `${(value * 100).toFixed(1)}%`

const severityClassMap: Record<string, string> = {
  HIGH: 'border-rose-200 bg-rose-50 text-rose-700',
  MEDIUM: 'border-amber-200 bg-amber-50 text-amber-700',
  LOW: 'border-emerald-200 bg-emerald-50 text-emerald-700',
}

export const OverviewPanel = () => {
  const [dashboard, setDashboard] = useState<CompanyDashboardDto | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true
    const now = new Date()

    const loadDashboard = async () => {
      setIsLoading(true)
      setErrorMessage(null)

      try {
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
          setDashboard(response.data.data)
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Không thể tải dashboard công ty.'
        if (isMounted) {
          setErrorMessage(message)
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void loadDashboard()

    return () => {
      isMounted = false
    }
  }, [])

  const trendBars = useMemo(() => {
    if (!dashboard) return []

    return dashboard.quarterlyTrend.map((point) => ({
      label: monthLabels[point.month - 1] ?? `${point.month}`,
      value: point.avgEfficiency,
      morale: point.avgMorale,
      stress: point.avgStress,
    }))
  }, [dashboard])

  if (isLoading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center rounded-2xl border border-slate-200 bg-white">
        <div className="flex items-center gap-3 text-slate-600">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading company dashboard...
        </div>
      </div>
    )
  }

  if (errorMessage || !dashboard) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-700">
        <p className="font-semibold">Không tải được dashboard</p>
        <p className="mt-1 text-sm">{errorMessage || 'Dữ liệu dashboard không hợp lệ.'}</p>
      </div>
    )
  }

  const stats = [
    {
      label: 'Avg Efficiency',
      value: dashboard.avgEfficiencyLabel,
      subtext: formatPercent(dashboard.avgEfficiencyRatio),
      icon: TrendingUp,
      iconClass: 'text-emerald-600',
    },
    {
      label: 'Avg Morale',
      value: dashboard.avgMoraleScore.toFixed(2),
      subtext: 'Wellbeing sentiment',
      icon: Brain,
      iconClass: 'text-blue-600',
    },
    {
      label: 'Avg Stress',
      value: dashboard.avgStressScore.toFixed(2),
      subtext: 'Current pressure level',
      icon: AlertTriangle,
      iconClass: 'text-amber-600',
    },
    {
      label: 'Active Employees',
      value: dashboard.totalActiveEmployees.toString(),
      subtext: `${dashboard.departments.length} departments`,
      icon: Users,
      iconClass: 'text-slate-700',
    },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
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
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Quarterly Trend</h3>
              <p className="text-sm text-slate-500">{dashboard.year}-{String(dashboard.month).padStart(2, '0')} snapshot</p>
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
              { label: 'High Risk', value: dashboard.burnoutOverview.highRisk, className: 'text-rose-600' },
              { label: 'Medium Risk', value: dashboard.burnoutOverview.mediumRisk, className: 'text-amber-600' },
              { label: 'Low Risk', value: dashboard.burnoutOverview.lowRisk, className: 'text-emerald-600' },
              { label: 'Resolved', value: dashboard.burnoutOverview.resolved, className: 'text-slate-700' },
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
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Department Comparison</h3>
              <p className="text-sm text-slate-500">Efficiency, morale and burnout pressure by department</p>
            </div>
            <Building2 className="text-slate-400" size={18} />
          </div>

          <div className="mt-5 space-y-3">
            {dashboard.departments.map((department) => (
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

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">System Alerts</h3>
              <p className="text-sm text-slate-500">Unread system notifications</p>
            </div>
            <ArrowUpRight className="text-slate-400" size={18} />
          </div>

          <div className="mt-5 space-y-3">
            {dashboard.systemAlerts.length > 0 ? (
              dashboard.systemAlerts.map((alert) => (
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

          {dashboard.monthlyInsight ? (
            <div className="mt-6 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-4 text-sm text-indigo-800">
              <p className="mb-1 font-semibold">Monthly Insight</p>
              <p>{dashboard.monthlyInsight}</p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
