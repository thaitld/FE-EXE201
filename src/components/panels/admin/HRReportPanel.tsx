import { useEffect, useState, useMemo } from 'react'
import {
  Sparkles,
  Heart,
  TrendingUp,
  AlertTriangle,
  Users,
  Compass,
  Zap,
  CheckCircle,
  FileText,
} from 'lucide-react'
import {
  apiClient,
  type ApiResponse,
  type HrReportDto,
} from '@/lib/api'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts'

// Markdown formatting helper
function Markdown({ text }: { text: string }) {
  if (!text) return null
  const formatText = (str: string) => {
    const parts = str.split(/\*\*([^*]+)\*\*/g)
    return parts.map((part, index) => {
      if (index % 2 === 1) {
        return <strong key={index} className="font-bold text-slate-900">{part}</strong>
      }
      return part
    })
  }

  return (
    <div className="space-y-3">
      {text.split('\n').map((line, i) => {
        const trimmed = line.trim()
        if (trimmed.startsWith('### ')) {
          return (
            <h3 key={i} className="text-sm font-bold text-slate-900 mt-4 border-b border-slate-100 pb-1">
              {formatText(trimmed.replace('### ', ''))}
            </h3>
          )
        }
        if (trimmed.startsWith('## ')) {
          return (
            <h2 key={i} className="text-base font-bold text-slate-900 mt-5">
              {formatText(trimmed.replace('## ', ''))}
            </h2>
          )
        }
        if (trimmed.startsWith('# ')) {
          return (
            <h1 key={i} className="text-lg font-bold text-slate-950 mt-6">
              {formatText(trimmed.replace('# ', ''))}
            </h1>
          )
        }
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          return (
            <div key={i} className="flex gap-2 text-sm text-slate-600 pl-2">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500" />
              <span className="leading-relaxed">{formatText(trimmed.substring(2))}</span>
            </div>
          )
        }
        if (trimmed === '') return <div key={i} className="h-1.5" />
        return (
          <p key={i} className="text-sm leading-relaxed text-slate-600">
            {formatText(line)}
          </p>
        )
      })}
    </div>
  )
}

export function HRReportPanel() {
  const now = useMemo(() => new Date(), [])
  const [year, setYear] = useState<number>(now.getFullYear())
  const [month, setMonth] = useState<number>(now.getMonth() + 1)
  
  const [report, setReport] = useState<HrReportDto | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const loadReport = async () => {
    setLoading(true)
    setError(null)
    setReport(null)
    try {
      const res = await apiClient.get<ApiResponse<HrReportDto>>('/hr-report', {
        params: { year, month },
      })
      setReport(res.data.data ?? null)
    } catch (err: any) {
      setError(err.message ?? 'Không thể tạo hoặc tải HR report từ Gemini AI.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadReport()
  }, [year, month])

  const sentimentChartData = useMemo(() => {
    if (!report?.departmentSentiment) return []
    return report.departmentSentiment.map((dept) => ({
      name: dept.departmentName,
      'Tinh thần': dept.avgMorale,
      Stress: dept.avgStress,
    }))
  }, [report])

  const riskLevelBadge = (level: string) => {
    switch (level?.toUpperCase()) {
      case 'HIGH':
      case 'CRITICAL':
        return 'text-rose-600 bg-rose-50 border-rose-200'
      case 'MEDIUM':
      case 'WARNING':
        return 'text-amber-600 bg-amber-50 border-amber-200'
      default:
        return 'text-emerald-600 bg-emerald-50 border-emerald-200'
    }
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
            <Sparkles size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Báo Cáo Sức Khỏe Doanh Nghiệp (AI HR Report)</h3>
            <p className="text-xs text-slate-500">Gemini AI phân tích toàn bộ dữ liệu khảo sát và hiệu suất vận hành</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
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

          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 outline-none"
          >
            <option value={year - 1}>{year - 1}</option>
            <option value={year}>{year}</option>
            <option value={year + 1}>{year + 1}</option>
          </select>

          <button
            onClick={() => void loadReport()}
            disabled={loading}
            className="h-9 px-4 bg-violet-600 text-white rounded-xl text-xs font-semibold hover:bg-violet-500 disabled:opacity-40 transition"
          >
            Re-generate
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-sm text-rose-600">{error}</div>
      )}

      {/* Loading Skeleton */}
      {loading && (
        <div className="space-y-6 animate-pulse">
          <div className="grid gap-4 sm:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-28 rounded-2xl bg-white border border-slate-200 p-5 space-y-3">
                <div className="h-3 w-16 bg-slate-100 rounded" />
                <div className="h-6 w-12 bg-slate-200 rounded" />
                <div className="h-3 w-28 bg-slate-100 rounded" />
              </div>
            ))}
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-2 h-80 bg-white border border-slate-200 rounded-2xl p-6" />
            <div className="h-80 bg-white border border-slate-200 rounded-2xl p-6" />
          </div>
          <div className="h-96 bg-white border border-slate-200 rounded-2xl p-6" />
        </div>
      )}

      {/* Report Data */}
      {!loading && report && (
        <div className="space-y-6 animate-fade-in">
          {/* Org Health score card & Key indicators */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Điểm sức khỏe tổ chức</span>
                <p className="text-3xl font-extrabold text-slate-900 mt-2">{report.orgHealth.score.toFixed(1)} / 100</p>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className={`px-2 py-0.5 rounded-full border text-[9px] font-bold ${riskLevelBadge(report.orgHealth.healthLevel)}`}>
                  Mức: {report.orgHealth.healthLevel}
                </span>
                {report.orgHealth.scoreChangePct !== null && (
                  <span className={`text-xs font-semibold ${report.orgHealth.scoreChangePct >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {report.orgHealth.scoreChangePct >= 0 ? '+' : ''}{report.orgHealth.scoreChangePct.toFixed(1)}% vs tháng trước
                  </span>
                )}
              </div>
            </div>

            <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Hiệu suất / Tinh thần</span>
                <p className="text-2xl font-extrabold text-slate-900 mt-2">
                  {report.orgHealth.avgEfficiency !== null ? `${(report.orgHealth.avgEfficiency * 100).toFixed(0)}%` : 'N/A'} / {report.orgHealth.avgMorale?.toFixed(1) ?? 'N/A'}
                </p>
                <span className="text-[10px] text-slate-400 mt-1 block">Stress trung bình: {report.orgHealth.avgStress?.toFixed(1) ?? 'N/A'}</span>
              </div>
              <div className="h-10 w-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <TrendingUp size={18} />
              </div>
            </div>

            <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Rủi Ro Burnout</span>
                <p className="text-2xl font-extrabold text-slate-900 mt-2">
                  {report.orgHealth.totalHighBurnout} High / {report.orgHealth.totalMediumBurnout} Med
                </p>
                <span className="text-[10px] text-slate-400 mt-1 block">Yêu cầu can thiệp khẩn cấp</span>
              </div>
              <div className="h-10 w-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
                <AlertTriangle size={18} />
              </div>
            </div>

            <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Khảo sát phản hồi</span>
                <p className="text-2xl font-extrabold text-slate-900 mt-2">{(report.orgHealth.surveyResponseRate * 100).toFixed(0)}%</p>
                <span className="text-[10px] text-slate-400 mt-1 block">Trên tổng số {report.orgHealth.totalActiveEmployees} nhân viên</span>
              </div>
              <div className="h-10 w-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Users size={18} />
              </div>
            </div>
          </div>

          {/* Sentiment Heatmap chart & Flight Risk */}
          <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-2 p-6 rounded-2xl border border-slate-200 bg-white shadow-sm space-y-4">
              <div>
                <h4 className="text-sm font-bold text-slate-800">Chỉ Số Tinh Thần & Stress Từng Phòng Ban</h4>
                <p className="text-xs text-slate-400 mt-0.5">So sánh sentiment theo từng khu vực</p>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sentimentChartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 10 }} />
                    <YAxis domain={[0, 5]} stroke="#94a3b8" tick={{ fontSize: 11 }} />
                    <Tooltip contentStyle={{ border: 'none', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                    <Bar dataKey="Tinh thần" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Stress" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Flight Risk Departments highlight */}
            <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-800 mb-4">Nhóm Có Nguy Cơ Flight Risk Cao</h4>
                <div className="space-y-3">
                  {report.flightRiskDepartments.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 text-xs">Chưa ghi nhận rủi ro đáng kể.</div>
                  ) : (
                    report.flightRiskDepartments.map((dept, i) => (
                      <div key={i} className="p-3 bg-rose-50/50 border border-rose-100 rounded-xl space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-slate-800 text-xs">{dept.departmentName}</span>
                          <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            At Risk: {dept.atRiskCount}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 leading-relaxed">Drivers: {dept.riskDrivers.join(', ')}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
              <div className="text-[10px] text-slate-400 bg-slate-50 p-2.5 rounded-lg border border-slate-100 flex items-center gap-1.5 mt-4">
                <Compass size={13} className="text-indigo-500 shrink-0" />
                Vui lòng ưu tiên tổ chức đối thoại 1:1 tại các nhóm trên.
              </div>
            </div>
          </div>

          {/* Intervention Queue table */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100">
              <h4 className="text-sm font-bold text-slate-800">Danh Sách Nhân Sự Cần Can Thiệp Khẩn Cấp</h4>
              <p className="text-xs text-slate-400 mt-0.5">Xử lý ngay để tránh gián đoạn nguồn lực</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                  <tr>
                    <th className="px-6 py-3.5">Nhân sự</th>
                    <th className="px-6 py-3.5">Phòng ban</th>
                    <th className="px-6 py-3.5">Độ ưu tiên</th>
                    <th className="px-6 py-3.5">Lý do cảnh báo</th>
                    <th className="px-6 py-3.5">Hành động khuyến nghị</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {report.interventionQueue.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-slate-400">Không có nhân sự cần can thiệp trong tháng.</td>
                    </tr>
                  ) : (
                    report.interventionQueue.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="px-6 py-4 font-semibold text-slate-900">{item.fullName}</td>
                        <td className="px-6 py-4">{item.departmentName}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${item.priority === 'HIGH' || item.priority === 'CRITICAL' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                            {item.priority}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs">{item.reasons.join(', ')}</td>
                        <td className="px-6 py-4 text-xs font-semibold text-indigo-600">
                          {item.recommendedAction}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* AI Report Markdown section */}
          <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Sparkles size={16} className="text-violet-500" />
              <h4 className="text-sm font-bold text-slate-800">Khuyến Nghị Chính Sách & Đánh Giá Chi Tiết Từ Gemini</h4>
            </div>
            <div className="prose max-w-none">
              <Markdown text={report.aiReport} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
