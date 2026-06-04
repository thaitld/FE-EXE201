import { useEffect, useState } from 'react'
import { getTeamPerformance, listTeams, listOvertimeReports, exportTeamPerformance } from '../api'
import type { TeamDetailDto, TeamPerformanceDto, OvertimeReportDto } from '../types'
import { Users, TrendingUp, Clock, AlertTriangle, ChevronDown, Download } from 'lucide-react'

export default function TeamPerformancePage() {
  const [teams, setTeams] = useState<TeamDetailDto[]>([])
  const [teamId, setTeamId] = useState<number | ''>('')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [performance, setPerformance] = useState<TeamPerformanceDto | null>(null)
  const [overtime, setOvertime] = useState<OvertimeReportDto[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [exporting, setExporting] = useState(false)

  const handleExport = async () => {
    if (!teamId) return
    setExporting(true)
    try {
      const yearMonth = date.slice(0, 7)
      await exportTeamPerformance(Number(teamId), `${yearMonth}-01`, `${yearMonth}-31`)
    } catch (err: any) {
      setError(err?.message ?? 'Export failed')
    } finally {
      setExporting(false)
    }
  }

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

  const totalOvertimeMin = Array.isArray(overtime)
    ? overtime.reduce((sum, item) => sum + (item?.overtimeMinutes ?? 0), 0)
    : 0
  const memberEffs = Array.isArray(performance?.members)
    ? performance!.members.map(m => m.efficiencyRatio ?? 0)
    : [1]
  const maxEff = Math.max(...memberEffs, 0.01)
  const otCount = Array.isArray(overtime) ? overtime.filter(o => o.hasOvertime).length : 0

  return (
    <div className="min-h-screen bg-gray-50/60 px-6 py-6">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700&display=swap');
        * { font-family: 'Geist', sans-serif; }

        .card {
          background: #fff;
          border: 1px solid #f0f0f0;
          border-radius: 16px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.04);
        }

        .ctrl-select {
          appearance: none;
          background: #f8f9fb;
          border: 1.5px solid #e8eaed;
          border-radius: 10px;
          padding: 7px 32px 7px 12px;
          font-size: 13px;
          font-weight: 500;
          color: #374151;
          outline: none;
          cursor: pointer;
          transition: border-color 0.15s;
          min-width: 200px;
        }
        .ctrl-select:focus { border-color: #3b82f6; background: #fff; }

        .ctrl-date {
          appearance: none;
          background: #f8f9fb;
          border: 1.5px solid #e8eaed;
          border-radius: 10px;
          padding: 7px 12px;
          font-size: 13px;
          font-weight: 500;
          color: #374151;
          outline: none;
          transition: border-color 0.15s;
        }
        .ctrl-date:focus { border-color: #3b82f6; background: #fff; }

        .btn-export {
          display: flex;
          align-items: center;
          gap: 6px;
          background: #fff;
          color: #374151;
          border: 1.5px solid #e5e7eb;
          border-radius: 10px;
          padding: 7px 14px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: border-color 0.15s, background 0.15s;
        }
        .btn-export:hover:not(:disabled) { border-color: #d1d5db; background: #f9fafb; }
        .btn-export:disabled { opacity: 0.4; cursor: not-allowed; }

        .kpi-card {
          background: #fff;
          border: 1px solid #f0f0f0;
          border-radius: 14px;
          padding: 20px;
          box-shadow: 0 1px 2px rgba(0,0,0,0.03);
          transition: box-shadow 0.15s, transform 0.15s;
        }
        .kpi-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.07); transform: translateY(-1px); }

        .member-row {
          padding: 14px 16px;
          border-radius: 12px;
          border: 1px solid #f0f0f0;
          background: #fafafa;
          transition: background 0.1s, border-color 0.1s;
        }
        .member-row:hover { background: #f5f7ff; border-color: #dbeafe; }

        .ot-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 14px;
          border-radius: 12px;
          border: 1px solid #f0f0f0;
          background: #fafafa;
          transition: background 0.1s;
        }
        .ot-row.has-ot {
          border-color: #fde68a;
          background: #fffbeb;
        }

        .ot-badge {
          font-size: 10px;
          font-weight: 700;
          padding: 2px 7px;
          border-radius: 6px;
          letter-spacing: 0.05em;
          background: #fef3c7;
          color: #d97706;
          border: 1px solid #fde68a;
        }

        .progress-track {
          flex: 1;
          height: 5px;
          background: #f0f0f0;
          border-radius: 99px;
          overflow: hidden;
        }
        .progress-fill {
          height: 100%;
          border-radius: 99px;
          background: linear-gradient(90deg, #60a5fa, #2563eb);
          transition: width 0.5s cubic-bezier(0.34,1.56,0.64,1);
        }

        .pulse-dot {
          width: 6px; height: 6px;
          background: #22c55e;
          border-radius: 50%;
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0%,100% { opacity:1; transform:scale(1); }
          50% { opacity:0.5; transform:scale(1.4); }
        }
      `}</style>

      {/* Page header */}
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-500 mb-1">Manager · Teams</p>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Hiệu suất Team</h1>
          <p className="text-sm text-gray-400 mt-0.5">Phân tích hiệu suất thành viên và báo cáo OT</p>
        </div>
        {loading && (
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <div className="pulse-dot" /> Đang tải...
          </div>
        )}
      </div>

      {/* Controls bar */}
      <div className="card flex flex-wrap items-center gap-3 px-5 py-3.5 mb-5">
        <div className="relative">
          <select
            value={teamId}
            onChange={e => setTeamId(e.target.value ? Number(e.target.value) : '')}
            className="ctrl-select"
          >
            <option value="">Chọn team</option>
            {teams.map(team => (
              <option key={team.id} value={team.id}>{team.code} — {team.name}</option>
            ))}
          </select>
          <ChevronDown size={11} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>

        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          className="ctrl-date"
        />

        <button
          className="btn-export ml-auto"
          onClick={handleExport}
          disabled={exporting || !teamId}
        >
          <Download size={13} />
          {exporting ? 'Đang xuất...' : 'Xuất Excel'}
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-500 mb-5">
          <AlertTriangle size={13} className="shrink-0" /> {error}
        </div>
      )}

      {performance && (
        <>
          {/* KPI strip */}
          <div className="grid grid-cols-3 gap-4 mb-5">
            {[
              {
                label: 'Hiệu suất TB',
                value: `${(performance.avgEfficiencyRatio * 100).toFixed(1)}%`,
                sub: performance.avgEfficiencyLabel,
                icon: TrendingUp,
                color: '#2563eb', bg: '#eff6ff',
              },
              {
                label: 'Thành viên',
                value: `${performance.activeMembers}/${performance.totalMembers}`,
                sub: 'đang hoạt động',
                icon: Users,
                color: '#7c3aed', bg: '#f5f3ff',
              },
              {
                label: 'Tổng OT',
                value: `${totalOvertimeMin}p`,
                sub: `${otCount} người có OT`,
                icon: Clock,
                color: '#d97706', bg: '#fffbeb',
              },
            ].map(card => (
              <div key={card.label} className="kpi-card">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">{card.label}</p>
                  <div className="h-8 w-8 rounded-lg flex items-center justify-center" style={{ background: card.bg }}>
                    <card.icon size={14} style={{ color: card.color }} />
                  </div>
                </div>
                <p className="text-3xl font-bold tracking-tight text-gray-900">{card.value}</p>
                <p className="mt-1 text-xs font-medium text-gray-400">{card.sub}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-5 xl:grid-cols-[1.4fr_1fr]">
            {/* Member breakdown */}
            <div className="card p-5">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">{performance.teamName}</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Hiệu suất từng thành viên</p>
                </div>
                <span className="text-xs font-semibold text-blue-500 bg-blue-50 px-2.5 py-1 rounded-lg">
                  {performance.reportDate}
                </span>
              </div>

              <div className="space-y-2.5">
                {(performance.members ?? []).map(member => {
                  const pct = Math.min((member.efficiencyRatio / maxEff) * 100, 100)
                  const effPct = (member.efficiencyRatio * 100).toFixed(0)
                  const isHigh = member.efficiencyRatio >= 0.9
                  const isLow = member.efficiencyRatio < 0.6
                  return (
                    <div key={member.userId} className="member-row">
                      <div className="flex items-center justify-between gap-3 mb-2.5">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                            style={{ background: isHigh ? '#2563eb' : isLow ? '#ef4444' : '#6b7280' }}
                          >
                            {member.userName?.charAt(0)?.toUpperCase()}
                          </div>
                          <p className="text-sm font-semibold text-gray-900">{member.userName}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-400">{member.totalTasks} tasks</span>
                          <span
                            className="text-xs font-bold"
                            style={{ color: isHigh ? '#2563eb' : isLow ? '#ef4444' : '#374151' }}
                          >
                            {effPct}%
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="progress-track">
                          <div className="progress-fill" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                      <p className="mt-1.5 text-[11px] text-gray-400">{member.efficiencyLabel}</p>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Overtime */}
            <div className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-900">Báo cáo OT</h3>
                {otCount > 0 && (
                  <span className="h-5 w-5 rounded-full bg-amber-100 text-amber-600 text-[10px] font-bold flex items-center justify-center">
                    {otCount}
                  </span>
                )}
              </div>

              {overtime.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                  <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center mb-2">
                    <Clock size={16} className="opacity-40" />
                  </div>
                  <p className="text-xs font-medium">Không có dữ liệu OT</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {overtime.map(item => (
                    <div
                      key={`${item.userId}-${item.reportDate}`}
                      className={`ot-row ${item.hasOvertime ? 'has-ot' : ''}`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className="h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
                          style={{ background: item.hasOvertime ? '#d97706' : '#9ca3af' }}
                        >
                          {item.userName?.charAt(0)?.toUpperCase()}
                        </div>
                        <p className="text-sm font-medium text-gray-800">{item.userName}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-bold ${item.hasOvertime ? 'text-amber-600' : 'text-gray-400'}`}>
                          {item.overtimeMinutes}p
                        </span>
                        {item.hasOvertime && <span className="ot-badge">OT</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {overtime.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                  <p className="text-xs text-gray-400">Tổng cộng</p>
                  <p className="text-sm font-bold text-gray-700">{totalOvertimeMin} phút</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}