import { useEffect, useState } from 'react'
import {
  Brain,
  Sparkles,
  Building2,
  Calendar,
  Clock,
  ChevronRight,
  ListRestart,
  Zap,
} from 'lucide-react'
import {
  apiClient,
  type ApiResponse,
  type DepartmentDto,
  type DepartmentInsightDto,
} from '@/lib/api'

// Simple Markdown Renderer
function Markdown({ text }: { text: string }) {
  if (!text) return null

  // Function to process simple bold text like **bold**
  const formatText = (str: string) => {
    const parts = str.split(/\*\*([^*]+)\*\*/g)
    return parts.map((part, index) => {
      if (index % 2 === 1) {
        return <strong key={index} className="font-bold text-slate-900">{part}</strong>
      }
      return part
    })
  }

  const lines = text.split('\n')
  return (
    <div className="space-y-3">
      {lines.map((line, i) => {
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
            <h1 key={i} className="text-lg font-bold text-slate-900 mt-6">
              {formatText(trimmed.replace('# ', ''))}
            </h1>
          )
        }
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          return (
            <div key={i} className="flex gap-2 text-sm text-slate-600 pl-2">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-500" />
              <span className="leading-relaxed">{formatText(trimmed.substring(2))}</span>
            </div>
          )
        }
        if (trimmed === '') {
          return <div key={i} className="h-1.5" />
        }
        return (
          <p key={i} className="text-sm leading-relaxed text-slate-600">
            {formatText(line)}
          </p>
        )
      })}
    </div>
  )
}

export const AIInsightsPanel = () => {
  const [scope, setScope] = useState<'company' | 'department'>('company')
  const [departments, setDepartments] = useState<DepartmentDto[]>([])
  const [selectedDeptId, setSelectedDeptId] = useState<number | ''>('')
  
  const [latestInsight, setLatestInsight] = useState<DepartmentInsightDto | null>(null)
  const [historyInsights, setHistoryInsights] = useState<DepartmentInsightDto[]>([])
  
  const [showHistory, setShowHistory] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)
  const [loadingHistory, setLoadingHistory] = useState<boolean>(false)
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

  // Fetch Latest Insight
  const fetchLatestInsight = async () => {
    setLoading(true)
    setError(null)
    setLatestInsight(null)
    try {
      let res
      if (scope === 'company') {
        res = await apiClient.get<ApiResponse<DepartmentInsightDto | null>>('/insights/company/latest')
      } else {
        if (!selectedDeptId) return
        res = await apiClient.get<ApiResponse<DepartmentInsightDto | null>>(`/insights/department/${selectedDeptId}/latest`)
      }
      setLatestInsight(res.data.data ?? null)
    } catch (err: any) {
      setError(err.message ?? 'Không thể tải AI insight mới nhất.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void fetchLatestInsight()
    setShowHistory(false)
  }, [scope, selectedDeptId])

  // Fetch History Insights
  const fetchHistory = async () => {
    setLoadingHistory(true)
    try {
      let res
      if (scope === 'company') {
        // Company has no specific history endpoint except list by dept, or we fallback
        setHistoryInsights([])
      } else {
        if (!selectedDeptId) return
        res = await apiClient.get<ApiResponse<DepartmentInsightDto[]>>(`/insights/department/${selectedDeptId}`)
        setHistoryInsights(res.data.data ?? [])
      }
      setShowHistory(true)
    } catch (err) {
      console.error('Failed to fetch historical insights', err)
    } finally {
      setLoadingHistory(false)
    }
  }

  const severityBadgeColor = (level: string) => {
    switch (level?.toUpperCase()) {
      case 'HIGH':
        return 'text-rose-600 bg-rose-50 border-rose-200'
      case 'MEDIUM':
        return 'text-amber-600 bg-amber-50 border-amber-200'
      default:
        return 'text-emerald-600 bg-emerald-50 border-emerald-200'
    }
  }

  return (
    <div className="space-y-6">
      {/* Scope Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
            <Brain size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Thông Tin Phân Tích AI</h3>
            <p className="text-xs text-slate-500">Phát hiện và cảnh báo tự động về hiệu suất từ Gemini AI</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Scope selection */}
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
              className="h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 outline-none"
            >
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-sm text-rose-600">{error}</div>
      )}

      {/* Latest Insight Card */}
      <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-sm space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-violet-500" />
            <h4 className="text-sm font-bold text-slate-800">Cảnh Báo & Phân Tích Mới Nhất</h4>
          </div>
          {latestInsight && (
            <div className="flex items-center gap-3">
              <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold ${severityBadgeColor(latestInsight.severity)}`}>
                Độ nghiêm trọng: {latestInsight.severity}
              </span>
              <div className="flex items-center gap-1 text-xs text-slate-400">
                <Clock size={12} />
                <span>{new Date(latestInsight.generatedAt).toLocaleString('vi-VN')}</span>
              </div>
            </div>
          )}
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-400 animate-pulse text-sm">Gemini AI đang tải phân tích mới nhất...</div>
        ) : !latestInsight ? (
          <div className="py-12 flex flex-col items-center justify-center text-slate-400 text-sm space-y-3">
            <Zap size={24} className="text-slate-300" />
            <span>Chưa có insight nào được tạo trong tháng này.</span>
          </div>
        ) : (
          <div className="prose max-w-none">
            <Markdown text={latestInsight.insightText} />
          </div>
        )}

        {scope === 'department' && (
          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              onClick={() => void fetchHistory()}
              disabled={loadingHistory}
              className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              <ListRestart size={14} />
              {loadingHistory ? 'Đang tải...' : 'Xem các insights cũ hơn'}
            </button>
          </div>
        )}
      </div>

      {/* History view */}
      {showHistory && (
        <div className="space-y-4">
          <h4 className="text-sm font-bold text-slate-800">Lịch Sử Phân Tích Phòng Ban</h4>
          {historyInsights.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400 border border-slate-100 bg-white rounded-2xl">
              Không có dữ liệu lịch sử.
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {historyInsights.map((insight, idx) => (
                <div key={idx} className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-700">Tháng {insight.insightMonth}/{insight.insightYear}</span>
                    <span className={`px-2 py-0.5 rounded-full border text-[9px] font-bold ${severityBadgeColor(insight.severity)}`}>
                      {insight.severity}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 line-clamp-4 leading-relaxed">
                    {insight.insightText.replace(/[#*`-]/g, '')}
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-slate-400 border-t border-slate-100 pt-2.5">
                    <span>Tạo: {new Date(insight.generatedAt).toLocaleDateString('vi-VN')}</span>
                    <button
                      onClick={() => {
                        setLatestInsight(insight)
                        window.scrollTo({ top: 100, behavior: 'smooth' })
                      }}
                      className="text-violet-600 font-bold flex items-center gap-0.5 hover:text-violet-500"
                    >
                      Xem chi tiết <ChevronRight size={10} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
