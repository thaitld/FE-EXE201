import { useEffect, useMemo, useState } from 'react'
import { getDepartmentDashboard, listDepartments } from '../api'
import type { DepartmentDashboardDto, DepartmentDto } from '../types'
import { TrendingUp, AlertTriangle, Users, CheckSquare, ChevronDown, Activity, Zap, Clock } from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts"

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

  const formattedTrend = useMemo(() => {
    return trend.map((d) => ({
      date: d.date,
      ratio: typeof d.efficiencyRatio === "number" ? d.efficiencyRatio : 0,
    }));
  }, [trend]);

  return (
    <div className="min-h-screen bg-gray-50/60 px-6 py-6 font-sans">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700;800;900&display=swap');
        * { font-family: 'Geist', sans-serif; }

        .card {
          background: #fff;
          border: 1px solid #f0f0f0;
          border-radius: 16px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.03);
        }

        .kpi-card {
          background: #fff;
          border: 1px solid #f0f0f0;
          border-radius: 16px;
          padding: 20px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.04);
          transition: box-shadow 0.15s ease, transform 0.15s ease;
        }
        .kpi-card:hover {
          box-shadow: 0 4px 16px rgba(0,0,0,0.08);
          transform: translateY(-1px);
        }

        .dept-select {
          appearance: none;
          background: #f8f9fb;
          border: 1.5px solid #e8eaed;
          border-radius: 10px;
          padding: 8px 36px 8px 14px;
          font-size: 14px;
          font-weight: 600;
          color: #1a1a1a;
          outline: none;
          cursor: pointer;
          transition: border-color 0.15s;
          min-width: 200px;
        }
        .dept-select:focus { border-color: #4f8ef7; }

        .bar-wrap {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
        }
        .bar-track {
          position: relative;
          width: 24px;
          height: 120px;
          background: #f3f4f6;
          border-radius: 8px;
          overflow: hidden;
        }
        .bar-fill {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          border-radius: 8px;
          transition: height 0.4s cubic-bezier(0.34,1.56,0.64,1);
        }
        .bar-fill.active {
          background: linear-gradient(180deg, #60a5fa 0%, #3b82f6 100%);
        }
        .bar-fill.empty {
          background: #e5e7eb;
        }
        .bar-label {
          font-size: 9px;
          color: #9ca3af;
          font-weight: 500;
          letter-spacing: 0.02em;
        }

        .team-row {
          padding: 12px 14px;
          border-radius: 12px;
          border: 1px solid #f0f0f0;
          background: #fafafa;
          transition: background 0.12s;
        }
        .team-row:hover { background: #f5f7ff; border-color: #dbeafe; }

        .progress-track {
          height: 4px;
          background: #eff0f3;
          border-radius: 99px;
          overflow: hidden;
          flex: 1;
        }
        .progress-fill {
          height: 100%;
          border-radius: 99px;
          background: linear-gradient(90deg, #60a5fa, #3b82f6);
        }

        .burnout-item {
          padding: 12px 14px;
          border-radius: 12px;
          border: 1px solid #fee2e2;
          background: #fff8f8;
        }

        .risk-badge {
          font-size: 10px;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: 6px;
          letter-spacing: 0.05em;
        }
        .risk-HIGH { background: #fee2e2; color: #dc2626; }
        .risk-MEDIUM { background: #fef3c7; color: #d97706; }
        .risk-LOW { background: #d1fae5; color: #059669; }

        .pulse-dot {
          width: 6px;
          height: 6px;
          background: #22c55e;
          border-radius: 50%;
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.3); }
        }
      `}</style>

      {/* Header bar */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-500 mb-1">Manager · Department Dashboard</p>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Tổng quan phòng ban</h1>
          <p className="text-sm text-gray-400 mt-0.5">KPI, burnout alerts và xu hướng tháng</p>
        </div>
        {loading && (
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <div className="pulse-dot" />
            Đang tải...
          </div>
        )}
      </div>

      {/* Dept selector */}
      <div className="card flex items-center gap-3 px-5 py-3.5 mb-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50">
          <Activity size={14} className="text-blue-500" />
        </div>
        <div className="relative">
          <select
            value={departmentId}
            onChange={e => setDepartmentId(e.target.value ? Number(e.target.value) : '')}
            className="dept-select"
          >
            <option value="">Chọn phòng ban</option>
            {departments.map(dept => (
              <option key={dept.id} value={dept.id}>{dept.name}</option>
            ))}
          </select>
          <ChevronDown size={12} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>
        {dashboard && (
          <span className="ml-auto text-xs text-gray-400 font-medium">
            Tháng {dashboard.month}/{dashboard.year}
          </span>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-500 mb-5">
          <AlertTriangle size={14} className="shrink-0" /> {error}
        </div>
      )}

      {dashboard && (
        <div className="space-y-5">
          {/* KPI cards */}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              {
                label: 'Hiệu suất',
                value: dashboard.avgEfficiencyLabel,
                sub: `${(dashboard.avgEfficiencyRatio * 100).toFixed(1)}%`,
                icon: TrendingUp,
                color: '#3b82f6',
                bg: '#eff6ff',
              },
              {
                label: 'Tinh thần',
                value: dashboard.avgMoraleScore.toFixed(1),
                sub: 'Điểm trung bình',
                icon: Zap,
                color: '#10b981',
                bg: '#ecfdf5',
              },
              {
                label: 'Áp lực',
                value: dashboard.avgStressScore.toFixed(1),
                sub: 'Điểm trung bình',
                icon: AlertTriangle,
                color: '#f59e0b',
                bg: '#fffbeb',
              },
              {
                label: 'Nhiệm vụ',
                value: String(dashboard.totalActiveTasks),
                sub: `${dashboard.overdueTasks} quá hạn`,
                icon: CheckSquare,
                color: '#8b5cf6',
                bg: '#f5f3ff',
              },
            ].map(card => (
              <div key={card.label} className="kpi-card">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">{card.label}</p>
                  <div className="h-8 w-8 rounded-lg flex items-center justify-center" style={{ background: card.bg }}>
                    <card.icon size={14} style={{ color: card.color }} />
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-900 tracking-tight">{card.value}</p>
                <p className="mt-1 text-xs font-medium text-gray-400">{card.sub}</p>
              </div>
            ))}
          </div>

          {/* Trend + Right Column */}
          <div className="grid gap-5 xl:grid-cols-[1.5fr_1fr]">
            {/* Efficiency trend */}
            <div className="card p-5">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">Xu hướng hiệu suất</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Theo ngày trong tháng</p>
                </div>
                <span className="text-xs font-semibold text-blue-500 bg-blue-50 px-2.5 py-1 rounded-lg">
                  {dashboard.month}/{dashboard.year}
                </span>
              </div>
              <div className="h-[260px] w-full mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={formattedTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(v) => {
                        const d = new Date(v);
                        return isNaN(d.getTime()) ? v : `${d.getDate()}/${d.getMonth() + 1}`;
                      }}
                      stroke="#64748b"
                      tick={{ fill: "#64748b", fontSize: 11 }}
                      tickMargin={10}
                    />
                    <YAxis 
                      domain={[0, 2]} 
                      ticks={[0, 0.5, 1, 1.5, 2]} 
                      tickFormatter={(v) => Number(v).toFixed(1)} 
                      stroke="#64748b"
                      tick={{ fill: "#64748b", fontSize: 11 }}
                    />
                    <Tooltip
                      formatter={(value: any) =>
                        value === null ? "No data" : (value.toFixed?.(2) ?? value)
                      }
                      contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)" }}
                    />
                    <Line
                      type="monotone"
                      dataKey="ratio"
                      stroke="#3b82f6"
                      strokeWidth={3}
                      dot={{ r: 3, fill: "#3b82f6", strokeWidth: 0 }}
                      activeDot={{ r: 5, strokeWidth: 0 }}
                      connectNulls={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Right column */}
            <div className="space-y-5">
              {/* Burnout alerts */}
              <div className="card p-5">
                <div className="flex items-center gap-2 mb-4">
                  <h3 className="text-sm font-semibold text-gray-900">Cảnh báo Burnout</h3>
                  {dashboard.recentHighRiskAlerts.length > 0 && (
                    <span className="h-5 w-5 rounded-full bg-red-100 text-red-600 text-[10px] font-bold flex items-center justify-center">
                      {dashboard.recentHighRiskAlerts.length}
                    </span>
                  )}
                </div>
                <div className="space-y-2">
                  {dashboard.recentHighRiskAlerts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-6 text-center">
                      <div className="h-10 w-10 rounded-full bg-green-50 flex items-center justify-center mb-2">
                        <CheckSquare size={16} className="text-green-500" />
                      </div>
                      <p className="text-xs text-gray-400 font-medium">Không có cảnh báo rủi ro cao</p>
                    </div>
                  ) : dashboard.recentHighRiskAlerts.map(item => (
                    <div key={item.signalId} className="burnout-item">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-gray-900">{item.userName}</p>
                        <span className={`risk-badge risk-${item.riskLevel}`}>{item.riskLevel}</span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-1">
                        <Clock size={10} className="text-gray-400" />
                        <p className="text-xs text-gray-400">Score {item.riskScore} · {item.detectedDate}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Teams */}
              <div className="card p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-gray-900">Các team</h3>
                  <span className="text-xs text-gray-400">{dashboard.teams.length} nhóm</span>
                </div>
                <div className="space-y-2">
                  {dashboard.teams.map(team => (
                    <div key={team.teamId} className="team-row">
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <p className="text-sm font-semibold text-gray-800">{team.teamName}</p>
                        <div className="flex items-center gap-1 text-xs text-gray-400 font-medium">
                          <Users size={11} />
                          {team.memberCount}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="progress-track">
                          <div
                            className="progress-fill"
                            style={{ width: `${Math.min((team.avgEfficiencyRatio ?? 0) * 100, 100)}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-gray-400 font-medium whitespace-nowrap">
                          {team.pendingTasks} pending
                        </span>
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