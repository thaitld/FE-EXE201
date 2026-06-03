import { useEffect, useState } from 'react'
import { Users, TrendingUp, Sparkles, CalendarDays, AlertTriangle, Brain, ArrowUpRight } from 'lucide-react'
import { apiClient, type ApiResponse, type PersonalDashboardDto } from '@/lib/api'
import { MetricCard, InfoPill, EmptyBlock, SimpleTrendChart } from './DashboardHelpers'

export default function PersonalDashboardView({ dashboard: initialDashboard }: { dashboard?: PersonalDashboardDto } = {}) {
  const [dashboard, setDashboard] = useState<PersonalDashboardDto | null>(initialDashboard ?? null)
  const [isLoading, setIsLoading] = useState(initialDashboard == null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (initialDashboard) return
    let cancelled = false
    const load = async () => {
      setIsLoading(true)
      try {
        const res = await apiClient.get<ApiResponse<PersonalDashboardDto>>('/dashboard/personal')
        if (!cancelled) setDashboard(res.data.data ?? null)
      } catch (err) {
        if (!cancelled) setError('Không thể tải personal dashboard')
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [initialDashboard])

  if (isLoading) return <div>Loading personal dashboard...</div>
  if (error) return <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-700">{error}</div>
  if (!dashboard) return null
  const stats = [
    { label: 'Pending tasks', value: dashboard.pendingTasks, hint: 'Tasks waiting for action', icon: Users, tone: 'text-blue-600' },
    { label: 'In progress', value: dashboard.inProgressTasks, hint: 'Currently being worked on', icon: TrendingUp, tone: 'text-emerald-600' },
    { label: 'Completed this week', value: dashboard.completedThisWeek, hint: 'Weekly finished work', icon: Sparkles, tone: 'text-cyan-600' },
    { label: 'Deadlines soon', value: dashboard.upcomingDeadlines.length, hint: 'Upcoming due tasks', icon: CalendarDays, tone: 'text-amber-600' },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <MetricCard key={stat.label} label={stat.label} value={String(stat.value)} hint={stat.hint} icon={stat.icon} iconClassName={stat.tone} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Today performance</h3>
              <p className="text-sm text-slate-500">Hiệu suất hiện tại và mức hoàn thành trong ngày.</p>
            </div>
            <Brain size={18} className="text-slate-400" />
          </div>

          {dashboard.todayPerformance ? (
            <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-4">
              <InfoPill label="Efficiency" value={dashboard.todayPerformance.efficiencyLabel} />
              <InfoPill label="Standard minutes" value={`${dashboard.todayPerformance.totalStandardMinutes}m`} />
              <InfoPill label="Actual minutes" value={`${dashboard.todayPerformance.totalActualMinutes}m`} />
              <InfoPill label="Tasks" value={String(dashboard.todayPerformance.totalTasks)} />
            </div>
          ) : (
            <EmptyBlock message="Chưa có dữ liệu hiệu suất trong ngày." />
          )}

          <div className="mt-6">
            <SimpleTrendChart title="Weekly trend" description="Xu hướng hiệu suất 7 ngày gần nhất" points={dashboard.weeklyTrend} />
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Burnout insight</h3>
              <p className="text-sm text-slate-500">Cảnh báo sớm theo dữ liệu cá nhân.</p>
            </div>
            <AlertTriangle size={18} className="text-slate-400" />
          </div>

          {dashboard.burnoutInsight ? (
            <div className="mt-5 space-y-4">
              <div className={`rounded-2xl border px-4 py-4 ${dashboard.burnoutInsight.riskLevel ?? ''}`}>
                <p className="text-xs font-semibold uppercase tracking-wide">Risk level</p>
                <p className="mt-1 text-2xl font-bold">{dashboard.burnoutInsight.riskLevel}</p>
                <p className="mt-1 text-sm">Score: {dashboard.burnoutInsight.riskScore.toFixed(1)}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Detected date</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">{new Date(dashboard.burnoutInsight.detectedDate).toLocaleString('vi-VN')}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Trigger factors</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {dashboard.burnoutInsight.triggerFactors.length > 0 ? (
                    dashboard.burnoutInsight.triggerFactors.map((factor) => (
                      <span key={factor} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                        {factor}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-slate-500">No trigger factors reported.</span>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <EmptyBlock message="Không có insight burnout cá nhân." />
          )}
        </section>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Upcoming deadlines</h3>
              <p className="text-sm text-slate-500">Danh sách task sắp đến hạn cần ưu tiên.</p>
            </div>
            <ArrowUpRight size={18} className="text-slate-400" />
          </div>

          <div className="mt-5 space-y-3">
            {dashboard.upcomingDeadlines.length > 0 ? (
              dashboard.upcomingDeadlines.map((task) => (
                <div key={task.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-slate-900">{task.title}</p>
                        <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-slate-600">{task.status}</span>
                      </div>
                      <p className="mt-1 text-sm text-slate-500">
                        {task.taskCode} · {task.taskTypeName} · {task.assignedUserName}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-semibold ${task.isOverdue ? 'text-rose-600' : 'text-slate-900'}`}>
                        {new Date(task.expectedCompletion).toLocaleString('vi-VN')}
                      </p>
                      <p className="text-xs text-slate-500">{task.priority}{task.isOverdue ? ' · Overdue' : ''}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <EmptyBlock message="Không có deadline sắp tới." />
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Quick summary</h3>
              <p className="text-sm text-slate-500">Tổng hợp nhanh hôm nay.</p>
            </div>
            <Users size={18} className="text-slate-400" />
          </div>

          <div className="mt-5 space-y-3">
            {dashboard.todayPerformance ? (
              <>
                <InfoPill label="User" value={dashboard.todayPerformance.userName} />
                <InfoPill label="Date" value={new Date(dashboard.todayPerformance.reportDate).toLocaleDateString('vi-VN')} />
                <InfoPill label="Efficiency" value={dashboard.todayPerformance.efficiencyLabel} />
              </>
            ) : (
              <EmptyBlock message="Chưa có today performance." />
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
