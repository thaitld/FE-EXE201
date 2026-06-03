import { useEffect, useState } from 'react'
import { getTeamPerformance, listTeams, listOvertimeReports } from '../api'
import type { TeamDetailDto, TeamPerformanceDto, OvertimeReportDto } from '../types'
import { Users, TrendingUp, Clock, AlertTriangle, ChevronDown } from 'lucide-react'

export default function TeamPerformancePage() {
  const [teams, setTeams] = useState<TeamDetailDto[]>([])
  const [teamId, setTeamId] = useState<number | ''>('')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [performance, setPerformance] = useState<TeamPerformanceDto | null>(null)
  const [overtime, setOvertime] = useState<OvertimeReportDto[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    listTeams({ isActive: true })
      .then(items => { setTeams(items); if (items[0]) setTeamId(items[0].id) })
      .catch((err: Error) => setError(err.message))
  }, [])

  useEffect(() => {
    if (!teamId) return
    setError(null); setLoading(true)
    Promise.all([
      getTeamPerformance(Number(teamId), date),
      listOvertimeReports(Number(teamId), date, date),
    ])
      .then(([perf, over]) => { setPerformance(perf); setOvertime(over) })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false))
  }, [teamId, date])

  const totalOvertimeMin = Array.isArray(overtime) ? overtime.reduce((sum, item) => sum + (item?.overtimeMinutes ?? 0), 0) : 0
  const memberEffs = Array.isArray(performance?.members) ? performance!.members.map(m => m.efficiencyRatio ?? 0) : [1]
  const maxEff = Math.max(...memberEffs, 0.01)

  return (
    <div className="space-y-5">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-3.5 shadow-sm">
        <div className="relative">
          <select
            value={teamId}
            onChange={e => setTeamId(e.target.value ? Number(e.target.value) : '')}
            className="h-9 appearance-none rounded-xl border border-slate-300 bg-white pl-3 pr-8 text-sm text-slate-900 outline-none focus:border-cyan-400/60"
          >
            <option value="">Chọn team</option>
            {teams.map(team => (
              <option key={team.id} value={team.id}>{team.code} — {team.name}</option>
            ))}
          </select>
          <ChevronDown size={12} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
        </div>

        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          className="h-9 rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-cyan-400/60"
        />

        {loading && <span className="ml-auto text-xs text-slate-500 animate-pulse">Đang tải...</span>}
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
          <AlertTriangle size={15} className="shrink-0" />{error}
        </div>
      )}

      {performance && (
        <>
          {/* KPI strip */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Hiệu suất TB', value: performance.avgEfficiencyRatio.toFixed(2), sub: performance.avgEfficiencyLabel, icon: TrendingUp, color: '#22d3ee' },
              { label: 'Thành viên', value: `${performance.activeMembers}/${performance.totalMembers}`, sub: 'đang hoạt động', icon: Users, color: '#818cf8' },
              { label: 'Tổng OT', value: `${totalOvertimeMin}p`, sub: `${Array.isArray(overtime) ? overtime.filter(o => o.hasOvertime).length : 0} người OT`, icon: Clock, color: '#fbbf24' },
            ].map(card => (
              <div key={card.label} className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="pointer-events-none absolute -right-3 -top-3 h-12 w-12 rounded-full opacity-12 blur-xl"
                  style={{ background: card.color }} />
                <div className="flex items-start justify-between">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">{card.label}</p>
                  <card.icon size={14} style={{ color: card.color }} />
                </div>
                <p className="mt-3 text-2xl font-bold text-slate-900">{card.value}</p>
                <p className="mt-0.5 text-xs text-slate-500">{card.sub}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-5 xl:grid-cols-[1.4fr_1fr]">
            {/* Member breakdown */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-sm font-semibold text-slate-900">{performance.teamName}</h3>
                <span className="text-xs text-slate-500">{performance.reportDate}</span>
              </div>
              <div className="space-y-3">
                {(performance.members ?? []).map(member => {
                  const pct = Math.min((member.efficiencyRatio / maxEff) * 100, 100)
                  return (
                    <div key={member.userId} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                      <div className="flex items-center justify-between gap-3 mb-2.5">
                        <p className="text-sm font-semibold text-slate-900">{member.userName}</p>
                        <span className="text-xs text-slate-500">{member.totalTasks} tasks</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-cyan-300 transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-xs font-semibold text-cyan-400">{(member.efficiencyRatio * 100).toFixed(0)}%</span>
                      </div>
                      <p className="mt-1.5 text-xs text-slate-500">{member.efficiencyLabel}</p>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Overtime */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-900 mb-4">Báo cáo OT</h3>
              {overtime.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-slate-500">
                  <Clock size={24} className="mb-2 opacity-40" />
                  <p className="text-xs">Không có dữ liệu OT.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {overtime.map(item => (
                    <div
                      key={`${item.userId}-${item.reportDate}`}
                      className={`flex items-center justify-between rounded-xl border px-4 py-3 ${
                        item.hasOvertime
                          ? 'border-amber-200 bg-amber-50'
                          : 'border-slate-200 bg-slate-50'
                      }`}
                    >
                      <p className="text-sm text-slate-900">{item.userName}</p>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-semibold ${item.hasOvertime ? 'text-amber-600' : 'text-slate-500'}`}>
                          {item.overtimeMinutes}p
                        </span>
                        {item.hasOvertime && (
                          <span className="rounded-md border border-amber-200 bg-amber-50 px-1.5 py-0.5 text-[9px] font-bold uppercase text-amber-700">OT</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}