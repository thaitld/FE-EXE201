import { useEffect, useMemo, useState } from 'react'
import { getDepartmentDashboard, listDepartments } from '../api'
import type { DepartmentDashboardDto, DepartmentDto } from '../types'
import { TrendingUp, AlertTriangle, Users, CheckSquare, ChevronDown, Activity } from 'lucide-react'

const currentDateParts = () => {
  const now = new Date()
  return { year: now.getFullYear(), month: now.getMonth() + 1 }
}

export default function DepartmentDashboardPage() {
  const [departments, setDepartments] = useState<DepartmentDto[]>([])
  const [departmentId, setDepartmentId] = useState<number | ''>('')
  const [dashboard, setDashboard] = useState<DepartmentDashboardDto | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { year, month } = currentDateParts()

  useEffect(() => {
    listDepartments()
      .then(items => {
        setDepartments(items)
        if (items[0]) setDepartmentId(items[0].id)
      })
      .catch((err: Error) => setError(err.message))
  }, [])

  useEffect(() => {
    if (!departmentId) return
    setLoading(true); setError(null)
    getDepartmentDashboard(Number(departmentId), year, month)
      .then(setDashboard)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false))
  }, [departmentId, month, year])

  const trend = useMemo(() => dashboard?.monthlyTrend ?? [], [dashboard])
  const maxRatio = useMemo(() => Math.max(...trend.map(p => p.efficiencyRatio ?? 0), 0.01), [trend])

  return (
    <div className="space-y-5">
      {/* Dept selector */}
      <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-3.5 shadow-sm">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-400/10">
          <Activity size={15} className="text-cyan-400" />
        </div>
        <div className="relative">
          <select
            value={departmentId}
            onChange={e => setDepartmentId(e.target.value ? Number(e.target.value) : '')}
            className="h-9 appearance-none rounded-xl border border-slate-300 bg-white pl-3 pr-8 text-sm font-semibold text-slate-900 outline-none focus:border-cyan-400/60"
          >
            <option value="">Chọn phòng ban</option>
            {departments.map(dept => (
              <option key={dept.id} value={dept.id}>{dept.name}</option>
            ))}
          </select>
          <ChevronDown size={12} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
        </div>
        {loading && <span className="ml-auto text-xs text-slate-500 animate-pulse">Đang tải...</span>}
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
          <AlertTriangle size={15} className="shrink-0" />{error}
        </div>
      )}

      {dashboard && (
        <div className="space-y-5">
          {/* KPI cards */}
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { label: 'Hiệu suất', value: dashboard.avgEfficiencyLabel, sub: `${(dashboard.avgEfficiencyRatio * 100).toFixed(1)}%`, icon: TrendingUp, accent: '#22d3ee' },
              { label: 'Tinh thần', value: dashboard.avgMoraleScore.toFixed(1), sub: 'Điểm TB', icon: Activity, accent: '#34d399' },
              { label: 'Áp lực', value: dashboard.avgStressScore.toFixed(1), sub: 'Điểm TB', icon: AlertTriangle, accent: '#fbbf24' },
              { label: 'Tasks', value: String(dashboard.totalActiveTasks), sub: `${dashboard.overdueTasks} quá hạn`, icon: CheckSquare, accent: '#818cf8' },
            ].map(card => (
              <div key={card.label} className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="pointer-events-none absolute -right-4 -top-4 h-16 w-16 rounded-full opacity-10 blur-xl"
                  style={{ background: card.accent }} />
                <div className="flex items-start justify-between">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">{card.label}</p>
                  <card.icon size={15} style={{ color: card.accent }} />
                </div>
                <p className="mt-3 text-2xl font-bold text-slate-900">{card.value}</p>
                <p className="mt-0.5 text-xs text-slate-500">{card.sub}</p>
              </div>
            ))}
          </div>

          {/* Trend + Burnout/Teams */}
          <div className="grid gap-5 xl:grid-cols-[1.4fr_1fr]">
            {/* Efficiency trend */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-900">Xu hướng hiệu suất tháng</h3>
                <span className="text-xs text-slate-500">{dashboard.month}/{dashboard.year}</span>
              </div>
              <div className="mt-5 overflow-x-auto">
                <div className="flex min-w-max items-end gap-1.5 pb-6">
                  {trend.map(point => {
                    const pct = ((point.efficiencyRatio ?? 0) / maxRatio) * 100
                    const hasData = point.efficiencyRatio != null
                    return (
                      <div key={point.date} className="group flex flex-col items-center gap-1.5">
                        <div className="relative flex h-36 w-7 items-end">
                          <div className="absolute inset-0 rounded-lg bg-slate-100" />
                          <div
                            className={`relative w-full rounded-lg transition-all group-hover:opacity-90 ${hasData ? 'bg-gradient-to-t from-cyan-500 to-cyan-300' : 'bg-slate-700'}`}
                            style={{ height: `${Math.max(pct, hasData ? 4 : 0)}%` }}
                          />
                        </div>
                        <span className="text-[9px] text-slate-400">{point.date.slice(5)}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Right column */}
            <div className="space-y-5">
              {/* Burnout alerts */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="text-sm font-semibold text-slate-900">Cảnh báo Burnout</h3>
                <div className="mt-4 space-y-2">
                  {dashboard.recentHighRiskAlerts.length === 0 ? (
                    <p className="text-xs text-slate-500">Không có cảnh báo rủi ro cao.</p>
                  ) : dashboard.recentHighRiskAlerts.map(item => (
                    <div key={item.signalId} className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-slate-900">{item.userName}</p>
                        <span className="rounded-md border border-rose-200 bg-white px-2 py-0.5 text-[10px] font-bold text-rose-600">
                          {item.riskLevel}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-slate-500">Score {item.riskScore} · {item.detectedDate}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Teams */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="text-sm font-semibold text-slate-900">Các team</h3>
                <div className="mt-4 space-y-2">
                  {dashboard.teams.map(team => (
                    <div key={team.teamId} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-slate-900">{team.teamName}</p>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                          <Users size={12} />
                          {team.memberCount}
                        </div>
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <div className="h-1 flex-1 overflow-hidden rounded-full bg-slate-200">
                          <div
                            className="h-full rounded-full bg-cyan-400"
                            style={{ width: `${Math.min((team.avgEfficiencyRatio ?? 0) * 100, 100)}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-slate-500">{team.pendingTasks} pending</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}