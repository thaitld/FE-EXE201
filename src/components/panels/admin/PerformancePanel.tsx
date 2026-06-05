import { useEffect, useState, useMemo } from 'react'
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  Building2,
  Users,
  Activity,
  Zap,
  Clock,
  Sparkles,
  ArrowRight,
} from 'lucide-react'
import { usePermission } from '@/features/auth/usePermission'
import {
  apiClient,
  type ApiResponse,
  type DepartmentDto,
  type KpiTrendDto,
  type MonthlyKpiDto,
  type PerformanceRangeDto,
} from '@/lib/api'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  BarChart,
  Bar,
  Cell,
} from 'recharts'

export const PerformancePanel = () => {
  const { isEmployee, currentRole } = usePermission()

  if (isEmployee()) {
    return <PersonalPerformancePage />
  }

  return <KpiTrendPage />
}

// ==========================================
// 1. LEADERSHIP VIEW: KPI TREND PAGE
// ==========================================
function KpiTrendPage() {
  const [scope, setScope] = useState<'company' | 'department'>('company')
  const [departments, setDepartments] = useState<DepartmentDto[]>([])
  const [selectedDeptId, setSelectedDeptId] = useState<number | ''>('')
  const [months, setMonths] = useState<number>(6)
  const [kpiData, setKpiData] = useState<KpiTrendDto | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Load departments
    apiClient
      .get<ApiResponse<DepartmentDto[]>>('/departments')
      .then((res) => {
        const list = res.data.data ?? []
        setDepartments(list)
        if (list.length > 0) setSelectedDeptId(list[0].id)
      })
      .catch((err) => console.error('Failed to load departments', err))
  }, [])

  useEffect(() => {
    const fetchKpi = async () => {
      setLoading(true)
      setError(null)
      try {
        let res
        if (scope === 'company') {
          res = await apiClient.get<ApiResponse<KpiTrendDto>>('/kpi/company', {
            params: { months },
          })
        } else {
          if (!selectedDeptId) return
          res = await apiClient.get<ApiResponse<KpiTrendDto>>(`/kpi/department/${selectedDeptId}`, {
            params: { months },
          })
        }
        setKpiData(res.data.data ?? null)
      } catch (err: any) {
        setError(err.message ?? 'Không thể tải dữ liệu KPI.')
      } finally {
        setLoading(false)
      }
    }
    void fetchKpi()
  }, [scope, selectedDeptId, months])

  const chartData = useMemo(() => {
    if (!kpiData?.months) return []
    // Reverse to chronological order for chart display
    return [...kpiData.months].reverse()
  }, [kpiData])

  const renderTrendBadge = (trendVal: number | null, label: string) => {
    if (trendVal === null || trendVal === undefined) return null
    const isPositive = trendVal > 0
    const colorClass = isPositive
      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
      : trendVal < 0
      ? 'bg-rose-50 text-rose-700 border-rose-200'
      : 'bg-slate-50 text-slate-600 border-slate-200'

    return (
      <div className={`flex items-center gap-1 px-3 py-1.5 rounded-full border text-xs font-semibold ${colorClass}`}>
        {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
        <span>
          {label}: {isPositive ? '+' : ''}
          {trendVal.toFixed(1)}%
        </span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Top Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <Activity size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Xu Hướng Hiệu Suất & Tinh Thần</h3>
            <p className="text-xs text-slate-500">Phân tích KPI toàn công ty hoặc phòng ban</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Scope Toggle */}
          <div className="flex rounded-xl bg-slate-100 p-1">
            <button
              onClick={() => setScope('company')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                scope === 'company' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Công ty
            </button>
            <button
              onClick={() => setScope('department')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                scope === 'department' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Phòng ban
            </button>
          </div>

          {/* Department Select */}
          {scope === 'department' && (
            <select
              value={selectedDeptId}
              onChange={(e) => setSelectedDeptId(Number(e.target.value))}
              className="h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 outline-none focus:border-blue-500"
            >
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          )}

          {/* Months select */}
          <select
            value={months}
            onChange={(e) => setMonths(Number(e.target.value))}
            className="h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 outline-none focus:border-blue-500"
          >
            <option value={3}>3 tháng gần đây</option>
            <option value={6}>6 tháng gần đây</option>
            <option value={12}>12 tháng gần đây</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-sm text-rose-600">{error}</div>
      )}

      {/* Main KPI Graph Section */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Graph Card */}
        <div className="lg:col-span-2 p-6 rounded-2xl border border-slate-200 bg-white shadow-sm space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h4 className="text-sm font-bold text-slate-800">Biểu đồ Xu Hướng KPI</h4>
              <p className="text-xs text-slate-400">Hiệu suất, Tinh thần và Stress</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {renderTrendBadge(kpiData?.efficiencyTrend ?? null, 'Hiệu suất')}
              {renderTrendBadge(kpiData?.moraleTrend ?? null, 'Tinh thần')}
            </div>
          </div>

          {loading ? (
            <div className="h-72 w-full flex items-center justify-center">
              <span className="text-sm text-slate-400 animate-pulse">Đang tải biểu đồ xu hướng...</span>
            </div>
          ) : chartData.length === 0 ? (
            <div className="h-72 w-full flex flex-col items-center justify-center text-slate-400 text-sm">
              <Zap size={24} className="mb-2 text-slate-300" />
              Chưa có dữ liệu xu hướng cho giai đoạn này.
            </div>
          ) : (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="monthLabel" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 5]} ticks={[0, 1, 2, 3, 4, 5]} stroke="#94a3b8" tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      background: '#fff',
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Line
                    type="monotone"
                    name="Hiệu suất (x3)"
                    dataKey={(d: MonthlyKpiDto) => (d.avgEfficiency !== null ? d.avgEfficiency * 3 : null)}
                    stroke="#3b82f6"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                  />
                  <Line type="monotone" name="Tinh thần" dataKey="avgMorale" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} />
                  <Line type="monotone" name="Stress" dataKey="avgStress" stroke="#ef4444" strokeWidth={3} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Breakdown Card */}
        <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-bold text-slate-800 mb-4">Mô tả Thang Đo KPI</h4>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="w-1.5 rounded bg-blue-500 shrink-0" />
                <div>
                  <h5 className="text-xs font-bold text-slate-800">Hiệu suất (Efficiency Ratio)</h5>
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                    Tỷ lệ giữa thời gian tiêu chuẩn và thời gian thực tế. Trên biểu đồ được nhân 3 lần để khớp thang điểm 5.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-1.5 rounded bg-emerald-500 shrink-0" />
                <div>
                  <h5 className="text-xs font-bold text-slate-800">Tinh thần (Morale Score)</h5>
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                    Đánh giá từ khảo sát định kỳ (thang 1 - 5). Điểm càng cao biểu thị nhân sự có tinh thần tốt.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-1.5 rounded bg-red-500 shrink-0" />
                <div>
                  <h5 className="text-xs font-bold text-slate-800">Stress (Stress Score)</h5>
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                    Đánh giá áp lực công việc (thang 1 - 5). Điểm cao kéo dài cảnh báo nguy cơ burnout.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 text-[11px] text-slate-500 flex items-center gap-2 mt-4">
            <Sparkles size={14} className="text-amber-500 shrink-0" />
            Dữ liệu KPI được tổng hợp tự động vào cuối mỗi tháng.
          </div>
        </div>
      </div>

      {/* Month-by-month Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <h4 className="text-sm font-bold text-slate-800">Chi Tiết KPI Từng Tháng</h4>
          <p className="text-xs text-slate-400 mt-0.5">Dữ liệu chi tiết dạng bảng</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Tháng</th>
                {scope === 'department' && <th className="px-6 py-3.5">Phòng ban</th>}
                <th className="px-6 py-3.5">Hiệu suất trung bình</th>
                <th className="px-6 py-3.5">Tinh thần trung bình</th>
                <th className="px-6 py-3.5">Stress trung bình</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                    Đang tải dữ liệu chi tiết...
                  </td>
                </tr>
              ) : kpiData?.months.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                    Không tìm thấy dữ liệu.
                  </td>
                </tr>
              ) : (
                kpiData?.months.map((m, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="px-6 py-4 font-semibold text-slate-900">{m.monthLabel}</td>
                    {scope === 'department' && (
                      <td className="px-6 py-4">{m.departmentName ?? 'N/A'}</td>
                    )}
                    <td className="px-6 py-4">
                      {m.avgEfficiency !== null ? (
                        <span className="font-semibold text-blue-600">{(m.avgEfficiency * 100).toFixed(1)}%</span>
                      ) : (
                        'N/A'
                      )}
                    </td>
                    <td className="px-6 py-4 font-semibold text-emerald-600">
                      {m.avgMorale !== null ? m.avgMorale.toFixed(2) : 'N/A'}
                    </td>
                    <td className="px-6 py-4 font-semibold text-rose-600">
                      {m.avgStress !== null ? m.avgStress.toFixed(2) : 'N/A'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ==========================================
// 2. EMPLOYEE VIEW: PERSONAL PERFORMANCE PAGE
// ==========================================
function PersonalPerformancePage() {
  const [fromDate, setFromDate] = useState<string>(() => {
    const d = new Date()
    d.setDate(d.getDate() - 14)
    return d.toISOString().split('T')[0]
  })
  const [toDate, setToDate] = useState<string>(() => new Date().toISOString().split('T')[0])
  const [perfData, setPerfData] = useState<PerformanceRangeDto | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPerformance = async () => {
      if (!fromDate || !toDate) return
      setLoading(true)
      setError(null)
      try {
        const res = await apiClient.get<ApiResponse<PerformanceRangeDto>>('/performance/me/range', {
          params: { from: fromDate, to: toDate },
        })
        setPerfData(res.data.data ?? null)
      } catch (err: any) {
        setError(err.message ?? 'Không tải được hiệu suất cá nhân.')
      } finally {
        setLoading(false)
      }
    }
    void fetchPerformance()
  }, [fromDate, toDate])

  const getBarColor = (val: number) => {
    if (val >= 1.2) return '#3b82f6' // Excellent (Blue)
    if (val >= 0.9) return '#10b981' // Good (Green)
    if (val >= 0.7) return '#f59e0b' // Average (Yellow)
    return '#ef4444' // Poor (Red)
  }

  const performanceLabelColor = (label: string) => {
    switch (label?.toUpperCase()) {
      case 'EXCELLENT':
        return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'GOOD':
        return 'text-emerald-600 bg-emerald-50 border-emerald-200'
      case 'AVERAGE':
        return 'text-amber-600 bg-amber-50 border-amber-200'
      default:
        return 'text-rose-600 bg-rose-50 border-rose-200'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <Zap size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Hiệu Suất Cá Nhân</h3>
            <p className="text-xs text-slate-500">Xem breakdown hiệu suất làm việc hàng ngày của bạn</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Calendar size={14} className="text-slate-400" />
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="h-9 px-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 outline-none focus:border-indigo-500"
          />
          <ArrowRight size={12} className="text-slate-400" />
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="h-9 px-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-sm text-rose-600">{error}</div>
      )}

      {/* Overview Cards */}
      {perfData && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex justify-between items-center text-slate-400 mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider">Hiệu Suất Trung Bình</span>
              <TrendingUp size={16} />
            </div>
            <p className="text-3xl font-extrabold text-slate-900">
              {(perfData.avgEfficiencyRatio * 100).toFixed(1)}%
            </p>
            <span
              className={`inline-block mt-2 text-[10px] font-bold px-2 py-0.5 rounded-full border ${performanceLabelColor(
                perfData.avgEfficiencyLabel
              )}`}
            >
              {perfData.avgEfficiencyLabel}
            </span>
          </div>

          <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex justify-between items-center text-slate-400 mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider">Tổng Nhiệm Vụ</span>
              <Activity size={16} />
            </div>
            <p className="text-3xl font-extrabold text-slate-900">{perfData.totalTasks}</p>
            <span className="text-xs text-slate-400 inline-block mt-2">Đã hoàn thành trong giai đoạn</span>
          </div>

          <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex justify-between items-center text-slate-400 mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider">Tổng Giờ Tiêu Chuẩn</span>
              <Clock size={16} />
            </div>
            <p className="text-3xl font-extrabold text-slate-900">
              {(perfData.totalStandardMinutes / 60).toFixed(1)}h
            </p>
            <span className="text-xs text-slate-400 inline-block mt-2">Dựa trên định mức tác vụ</span>
          </div>

          <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex justify-between items-center text-slate-400 mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider">Tổng Giờ Thực Tế</span>
              <Clock size={16} />
            </div>
            <p className="text-3xl font-extrabold text-slate-900">
              {(perfData.totalActualMinutes / 60).toFixed(1)}h
            </p>
            <span className="text-xs text-slate-400 inline-block mt-2">Tổng thời gian time-tracking</span>
          </div>
        </div>
      )}

      {/* Graph Area */}
      <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
        <h4 className="text-sm font-bold text-slate-800 mb-6">Biểu Đồ Hiệu Suất Hàng Ngày</h4>

        {loading ? (
          <div className="h-72 w-full flex items-center justify-center">
            <span className="text-sm text-slate-400 animate-pulse">Đang phân tích hiệu suất...</span>
          </div>
        ) : !perfData || perfData.dailyBreakdown.length === 0 ? (
          <div className="h-72 w-full flex flex-col items-center justify-center text-slate-400 text-sm">
            <Activity size={24} className="mb-2 text-slate-300" />
            Chưa có ghi nhận hiệu suất nào trong khoảng thời gian này.
          </div>
        ) : (
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={perfData.dailyBreakdown} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="reportDate"
                  tickFormatter={(val) => {
                    const d = new Date(val)
                    return isNaN(d.getTime()) ? val : `${d.getDate()}/${d.getMonth() + 1}`
                  }}
                  stroke="#94a3b8"
                  tick={{ fontSize: 11 }}
                />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(val: any) => [`${(val * 100).toFixed(1)}%`, 'Hiệu suất']}
                  labelFormatter={(lbl) => new Date(lbl).toLocaleDateString('vi-VN')}
                  contentStyle={{
                    background: '#fff',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                  }}
                />
                <Bar dataKey="efficiencyRatio" radius={[4, 4, 0, 0]}>
                  {perfData.dailyBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getBarColor(entry.efficiencyRatio)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Legend */}
        <div className="flex flex-wrap gap-4 justify-center items-center mt-6 text-xs text-slate-500 border-t border-slate-100 pt-4">
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-sm bg-blue-500" />
            <span>Xuất sắc (≥ 1.2)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-sm bg-emerald-500" />
            <span>Tốt (0.9 - 1.2)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-sm bg-amber-500" />
            <span>Trung bình (0.7 - 0.9)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-sm bg-red-500" />
            <span>Kém (&lt; 0.7)</span>
          </div>
        </div>
      </div>
    </div>
  )
}
