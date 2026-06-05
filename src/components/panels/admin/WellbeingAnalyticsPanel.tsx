import { useEffect, useState, useMemo } from 'react'
import {
  Heart,
  Smile,
  Frown,
  Activity,
  Users,
  ChevronDown,
  Sparkles,
} from 'lucide-react'
import {
  apiClient,
  type ApiResponse,
  type DepartmentDto,
  type SurveyAggregationDto,
} from '@/lib/api'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
  Legend,
} from 'recharts'

export const WellbeingAnalyticsPanel = () => {
  const [departments, setDepartments] = useState<DepartmentDto[]>([])
  const [selectedDeptId, setSelectedDeptId] = useState<number | ''>('')
  
  const now = useMemo(() => new Date(), [])
  const [year, setYear] = useState<number>(now.getFullYear())
  const [month, setMonth] = useState<number>(now.getMonth() + 1)
  
  const [monthsTrend, setMonthsTrend] = useState<number>(6)
  
  const [aggData, setAggData] = useState<SurveyAggregationDto | null>(null)
  const [trendData, setTrendData] = useState<SurveyAggregationDto[]>([])
  
  const [loadingAgg, setLoadingAgg] = useState<boolean>(false)
  const [loadingTrend, setLoadingTrend] = useState<boolean>(false)
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

  // Fetch Aggregation
  useEffect(() => {
    const fetchAggregation = async () => {
      setLoadingAgg(true)
      setError(null)
      try {
        const res = await apiClient.get<ApiResponse<SurveyAggregationDto>>('/survey/aggregation', {
          params: {
            year,
            month,
            departmentId: selectedDeptId || undefined,
          },
        })
        setAggData(res.data.data ?? null)
      } catch (err: any) {
        setError(err.message ?? 'Không thể tải thống kê khảo sát.')
      } finally {
        setLoadingAgg(false)
      }
    }
    void fetchAggregation()
  }, [year, month, selectedDeptId])

  // Fetch Trend
  useEffect(() => {
    const fetchTrend = async () => {
      setLoadingTrend(true)
      try {
        const res = await apiClient.get<ApiResponse<SurveyAggregationDto[]>>('/survey/aggregation/trend', {
          params: {
            months: monthsTrend,
            departmentId: selectedDeptId || undefined,
          },
        })
        setTrendData(res.data.data ?? [])
      } catch (err) {
        console.error('Failed to load wellbeing trend', err)
      } finally {
        setLoadingTrend(false)
      }
    }
    void fetchTrend()
  }, [monthsTrend, selectedDeptId])

  const moraleDistributionData = useMemo(() => {
    if (!aggData?.moraleDistribution) return []
    const dist = aggData.moraleDistribution
    return [
      { score: '1 sao', count: dist.score1 || 0 },
      { score: '2 sao', count: dist.score2 || 0 },
      { score: '3 sao', count: dist.score3 || 0 },
      { score: '4 sao', count: dist.score4 || 0 },
      { score: '5 sao', count: dist.score5 || 0 },
    ]
  }, [aggData])

  const stressDistributionData = useMemo(() => {
    if (!aggData?.stressDistribution) return []
    const dist = aggData.stressDistribution
    return [
      { score: '1 sao', count: dist.score1 || 0 },
      { score: '2 sao', count: dist.score2 || 0 },
      { score: '3 sao', count: dist.score3 || 0 },
      { score: '4 sao', count: dist.score4 || 0 },
      { score: '5 sao', count: dist.score5 || 0 },
    ]
  }, [aggData])

  const chartTrendData = useMemo(() => {
    return [...trendData].reverse()
  }, [trendData])

  const responseRatePct = aggData ? Math.round(aggData.responseRate * 100) : 0

  return (
    <div className="space-y-6">
      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-500">
            <Heart size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Sức Khỏe & Tinh Thần Tổ Chức</h3>
            <p className="text-xs text-slate-500">Thống kê chỉ số hài lòng và stress từ khảo sát nhân viên</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Department filter */}
          <select
            value={selectedDeptId}
            onChange={(e) => setSelectedDeptId(e.target.value ? Number(e.target.value) : '')}
            className="h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 outline-none focus:border-rose-500"
          >
            <option value="">Toàn công ty</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>

          {/* Month picker */}
          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 outline-none"
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <option key={m} value={m}>
                Tháng {m}
              </option>
            ))}
          </select>

          {/* Year picker */}
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 outline-none"
          >
            <option value={year - 1}>{year - 1}</option>
            <option value={year}>{year}</option>
            <option value={year + 1}>{year + 1}</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-sm text-rose-600">{error}</div>
      )}

      {/* Primary Metrics Cards */}
      {aggData && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">Tinh thần</span>
              <p className="text-3xl font-extrabold text-slate-900 mt-1">{aggData.avgMoraleScore.toFixed(2)}</p>
              <span className="text-[10px] text-slate-400 mt-2 block">Thang điểm 1 - 5</span>
            </div>
            <div className="h-10 w-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Smile size={20} />
            </div>
          </div>

          <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">Áp lực (Stress)</span>
              <p className="text-3xl font-extrabold text-slate-900 mt-1">{aggData.avgStressScore.toFixed(2)}</p>
              <span className="text-[10px] text-slate-400 mt-2 block">Thang điểm 1 - 5</span>
            </div>
            <div className="h-10 w-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
              <Frown size={20} />
            </div>
          </div>

          <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-sm lg:col-span-2">
            <div className="flex justify-between items-center text-xs text-slate-400 mb-2 font-semibold uppercase tracking-wider">
              <span>Tỷ lệ tham gia khảo sát</span>
              <span>{aggData.responseCount} / {aggData.totalEligible} nhân sự</span>
            </div>
            <div className="flex items-center gap-3 mt-3">
              <div className="flex-1 h-3 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-rose-500 to-rose-400 rounded-full transition-all duration-500"
                  style={{ width: `${responseRatePct}%` }}
                />
              </div>
              <span className="text-sm font-bold text-rose-600">{responseRatePct}%</span>
            </div>
          </div>
        </div>
      )}

      {/* Distributions (Bar Charts) */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
          <h4 className="text-sm font-bold text-slate-800 mb-6">Phân Phối Điểm Tinh Thần</h4>
          {loadingAgg ? (
            <div className="h-60 flex items-center justify-center text-slate-400 animate-pulse text-xs">Đang tải...</div>
          ) : moraleDistributionData.length === 0 ? (
            <div className="h-60 flex items-center justify-center text-slate-400 text-xs">Chưa có dữ liệu phân phối.</div>
          ) : (
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={moraleDistributionData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="score" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} />
                  <Tooltip
                    cursor={{ fill: 'rgba(241, 245, 249, 0.5)' }}
                    contentStyle={{ border: 'none', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} name="Số lượng" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
          <h4 className="text-sm font-bold text-slate-800 mb-6">Phân Phối Điểm Stress</h4>
          {loadingAgg ? (
            <div className="h-60 flex items-center justify-center text-slate-400 animate-pulse text-xs">Đang tải...</div>
          ) : stressDistributionData.length === 0 ? (
            <div className="h-60 flex items-center justify-center text-slate-400 text-xs">Chưa có dữ liệu phân phối.</div>
          ) : (
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stressDistributionData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="score" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} />
                  <Tooltip
                    cursor={{ fill: 'rgba(241, 245, 249, 0.5)' }}
                    contentStyle={{ border: 'none', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="count" fill="#ef4444" radius={[4, 4, 0, 0]} name="Số lượng" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Trend Analysis (Line Chart) */}
      <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h4 className="text-sm font-bold text-slate-800">Biến Động Tinh Thần & Stress Theo Thời Gian</h4>
            <p className="text-xs text-slate-400 mt-0.5">Xu hướng nhiều tháng qua</p>
          </div>

          <select
            value={monthsTrend}
            onChange={(e) => setMonthsTrend(Number(e.target.value))}
            className="h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 outline-none"
          >
            <option value={4}>4 tháng</option>
            <option value={6}>6 tháng</option>
            <option value={12}>12 tháng</option>
          </select>
        </div>

        {loadingTrend ? (
          <div className="h-64 w-full flex items-center justify-center text-slate-400 animate-pulse text-xs">Đang tải xu hướng...</div>
        ) : chartTrendData.length === 0 ? (
          <div className="h-64 w-full flex items-center justify-center text-slate-400 text-xs">Chưa có dữ liệu xu hướng.</div>
        ) : (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartTrendData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="monthLabel" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    background: '#fff',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Line type="monotone" name="Tinh thần trung bình" dataKey="avgMoraleScore" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} />
                <Line type="monotone" name="Stress trung bình" dataKey="avgStressScore" stroke="#ef4444" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  )
}
