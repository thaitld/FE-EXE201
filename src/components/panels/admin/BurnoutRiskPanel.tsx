import { useEffect, useState, useMemo } from 'react'
import {
  Heart,
  AlertTriangle,
  CheckCircle,
  Filter,
  Calendar,
  Building2,
  Users,
  Search,
} from 'lucide-react'
import {
  apiClient,
  type ApiResponse,
  type DepartmentDto,
  type ApiBehavioralPatternDto,
} from '@/lib/api'
import type { BurnoutSignalDto } from '@/features/manager/types'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts'

export const BurnoutRiskPanel = () => {
  const [departments, setDepartments] = useState<DepartmentDto[]>([])
  const [selectedDeptId, setSelectedDeptId] = useState<number | ''>('')
  const [severity, setSeverity] = useState<string>('')
  const [isResolved, setIsResolved] = useState<string>('false')
  
  const [fromDate, setFromDate] = useState<string>(() => {
    const d = new Date()
    d.setDate(d.getDate() - 30)
    return d.toISOString().split('T')[0]
  })
  const [toDate, setToDate] = useState<string>(() => new Date().toISOString().split('T')[0])

  const [patterns, setPatterns] = useState<ApiBehavioralPatternDto[]>([])
  const [signals, setSignals] = useState<BurnoutSignalDto[]>([])
  
  const [loading, setLoading] = useState<boolean>(false)
  const [resolvingId, setResolvingId] = useState<number | null>(null)
  const [resolutionNote, setResolutionNote] = useState<string>('')
  const [showResolveModal, setShowResolveModal] = useState<boolean>(false)
  const [selectedSignal, setSelectedSignal] = useState<BurnoutSignalDto | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Load departments
    apiClient
      .get<ApiResponse<DepartmentDto[]>>('/departments')
      .then((res) => {
        setDepartments(res.data.data ?? [])
      })
      .catch((err) => console.error('Failed to load departments', err))
  }, [])

  const fetchBurnoutData = async () => {
    setLoading(true)
    setError(null)
    try {
      // 1. Fetch Patterns
      const patternsRes = await apiClient.get<ApiResponse<ApiBehavioralPatternDto[]>>('/burnout/patterns', {
        params: {
          severity: severity || undefined,
          from: fromDate || undefined,
          to: toDate || undefined,
        },
      })
      
      let filteredPatterns = patternsRes.data.data ?? []
      if (selectedDeptId) {
        // If department is chosen, call dept-specific patterns or filter client-side
        const deptPatternsRes = await apiClient.get<ApiResponse<ApiBehavioralPatternDto[]>>(`/burnout/patterns/department/${selectedDeptId}`, {
          params: {
            from: fromDate || undefined,
            to: toDate || undefined,
          },
        })
        filteredPatterns = deptPatternsRes.data.data ?? []
        if (severity) {
          filteredPatterns = filteredPatterns.filter(p => p.severity.toUpperCase() === severity.toUpperCase())
        }
      }
      setPatterns(filteredPatterns)

      // 2. Fetch Signals
      const signalsRes = await apiClient.get<ApiResponse<{ items: BurnoutSignalDto[] }>>('/burnout/signals', {
        params: {
          riskLevel: severity || undefined,
          isResolved: isResolved === 'all' ? undefined : isResolved === 'true',
          departmentId: selectedDeptId || undefined,
          page: 1,
          pageSize: 50,
        },
      })
      setSignals(signalsRes.data.data?.items ?? [])
    } catch (err: any) {
      setError(err.message ?? 'Không thể tải dữ liệu burnout.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void fetchBurnoutData()
  }, [selectedDeptId, severity, isResolved, fromDate, toDate])

  const patternStats = useMemo(() => {
    const counts: Record<string, number> = {}
    patterns.forEach((p) => {
      counts[p.patternCode] = (counts[p.patternCode] || 0) + 1
    })
    return Object.entries(counts).map(([code, count]) => ({
      code: code.replace(/_/g, ' '),
      count,
    }))
  }, [patterns])

  const handleOpenResolve = (signal: BurnoutSignalDto) => {
    setSelectedSignal(signal)
    setResolutionNote('')
    setShowResolveModal(true)
  }

  const handleResolve = async () => {
    if (!selectedSignal) return
    setResolvingId(selectedSignal.id)
    try {
      await apiClient.patch(`/burnout/signals/${selectedSignal.id}/resolve`, {
        resolutionNote,
      })
      setShowResolveModal(false)
      setSelectedSignal(null)
      void fetchBurnoutData()
    } catch (err: any) {
      alert(err.message ?? 'Không thể xử lý tín hiệu.')
    } finally {
      setResolvingId(null)
    }
  }

  const riskBadgeColor = (level: string) => {
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
      {/* Filters */}
      <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
            <AlertTriangle size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Giám Sát Rủi Ro Burnout</h3>
            <p className="text-xs text-slate-500">Phát hiện sớm các tín hiệu quá tải và hành vi burnout</p>
          </div>
        </div>

        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 md:grid-cols-5 pt-2 border-t border-slate-100">
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Phòng ban</span>
            <select
              value={selectedDeptId}
              onChange={(e) => setSelectedDeptId(e.target.value ? Number(e.target.value) : '')}
              className="h-9 px-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 outline-none"
            >
              <option value="">Tất cả phòng ban</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mức độ rủi ro</span>
            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value)}
              className="h-9 px-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 outline-none"
            >
              <option value="">Tất cả</option>
              <option value="HIGH">Rủi ro cao (HIGH)</option>
              <option value="MEDIUM">Rủi ro vừa (MEDIUM)</option>
              <option value="LOW">Rủi ro thấp (LOW)</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Trạng thái</span>
            <select
              value={isResolved}
              onChange={(e) => setIsResolved(e.target.value)}
              className="h-9 px-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 outline-none"
            >
              <option value="false">Chưa xử lý</option>
              <option value="true">Đã xử lý</option>
              <option value="all">Tất cả</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Từ ngày</span>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="h-9 px-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 outline-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Đến ngày</span>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="h-9 px-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 outline-none"
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-sm text-rose-600">{error}</div>
      )}

      {/* Pattern code stats / charts */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 p-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
          <h4 className="text-sm font-bold text-slate-800 mb-6">Thống Kê Mô Hình Hành Vi Phổ Biến</h4>
          {loading ? (
            <div className="h-60 flex items-center justify-center text-slate-400 animate-pulse text-xs">Đang tải...</div>
          ) : patternStats.length === 0 ? (
            <div className="h-60 flex items-center justify-center text-slate-400 text-xs">Chưa phát hiện mô hình bất thường.</div>
          ) : (
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={patternStats} layout="vertical" margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                  <YAxis dataKey="code" type="category" width={140} stroke="#94a3b8" tick={{ fontSize: 9 }} />
                  <Tooltip
                    contentStyle={{ border: 'none', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="count" fill="#8b5cf6" radius={[0, 4, 4, 0]} name="Số nhân sự" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Quick legend */}
        <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-sm space-y-4">
          <h4 className="text-sm font-bold text-slate-800">Các Tín Hiệu Đáng Chú Ý</h4>
          <div className="space-y-3 text-xs leading-relaxed text-slate-600">
            <div>
              <span className="font-bold text-slate-800">OVERTIME_3_DAYS:</span>
              <p className="text-slate-500 text-[11px] mt-0.5">Nhân viên làm thêm giờ liên tục trong 3 ngày làm việc gần nhất.</p>
            </div>
            <div>
              <span className="font-bold text-slate-800">LOW_COMPLETION_RATE:</span>
              <p className="text-slate-500 text-[11px] mt-0.5">Tỷ lệ hoàn thành nhiệm vụ giảm sút rõ rệt (&lt; 60%).</p>
            </div>
            <div>
              <span className="font-bold text-slate-800">HIGH_MEETING_LOAD:</span>
              <p className="text-slate-500 text-[11px] mt-0.5">Thời gian họp chiếm quá 40% quỹ thời gian làm việc tiêu chuẩn.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Burnout Signals Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-slate-800">Danh Sách Tín Hiệu Cảnh Báo</h4>
            <p className="text-xs text-slate-400 mt-0.5">Các trường hợp cần HR/Manager can thiệp</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Nhân viên</th>
                <th className="px-6 py-3.5">Phòng ban / Nhóm</th>
                <th className="px-6 py-3.5">Điểm rủi ro</th>
                <th className="px-6 py-3.5">Mức độ</th>
                <th className="px-6 py-3.5">Yếu tố kích hoạt</th>
                <th className="px-6 py-3.5">Ngày phát hiện</th>
                <th className="px-6 py-3.5">Trạng thái</th>
                <th className="px-6 py-3.5 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-slate-400">
                    Đang tải tín hiệu rủi ro...
                  </td>
                </tr>
              ) : signals.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-slate-400">
                    Không tìm thấy tín hiệu cảnh báo nào.
                  </td>
                </tr>
              ) : (
                signals.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-900">{s.userName}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs text-slate-500">
                        {s.department || 'N/A'} {s.team ? `· ${s.team}` : ''}
                      </p>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-800">{s.riskScore.toFixed(1)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold ${riskBadgeColor(s.riskLevel)}`}>
                        {s.riskLevel}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {s.triggerFactors.map((f, i) => (
                          <span key={i} className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded text-[9px]">
                            {f}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs">
                      {new Date(s.detectedDate).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-6 py-4">
                      {s.isResolved ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold text-xs">
                          <CheckCircle size={12} /> Đã giải quyết
                        </span>
                      ) : (
                        <span className="text-amber-600 font-semibold text-xs animate-pulse">Cần xử lý</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {!s.isResolved && (
                        <button
                          onClick={() => handleOpenResolve(s)}
                          className="px-3 py-1 bg-violet-600 text-white text-xs font-semibold rounded-lg hover:bg-violet-500 active:scale-95 transition"
                        >
                          Giải quyết
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Resolve Modal */}
      {showResolveModal && selectedSignal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 border border-slate-200 shadow-xl space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Giải Quyết Rủi Ro Burnout</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Xác nhận đã thảo luận và đưa ra giải pháp giảm tải cho {selectedSignal.userName}
              </p>
            </div>

            <textarea
              rows={4}
              value={resolutionNote}
              onChange={(e) => setResolutionNote(e.target.value)}
              placeholder="Nhập ghi chú giải pháp (ví dụ: Đồng ý giãn deadline dự án, cho phép nghỉ bù 1 ngày...)"
              className="w-full p-3 border border-slate-200 rounded-xl text-sm outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
            />

            <div className="flex justify-end gap-2.5">
              <button
                onClick={() => setShowResolveModal(false)}
                className="px-4 py-2 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-50"
              >
                Hủy
              </button>
              <button
                onClick={() => void handleResolve()}
                disabled={resolvingId !== null || !resolutionNote.trim()}
                className="px-4 py-2 bg-violet-600 text-white text-xs font-semibold rounded-xl hover:bg-violet-500 disabled:opacity-40 transition"
              >
                {resolvingId ? 'Đang lưu...' : 'Xác nhận'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
