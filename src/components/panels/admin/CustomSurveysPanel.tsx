import React, { useEffect, useState } from 'react'
import {
  getMyCustomSurveys,
  createCustomSurvey,
  getCustomSurveyResults,
  closeCustomSurvey,
  getDepartments,
  getTeams,
  type DepartmentDto,
  type TeamDetailDto,
} from '@/lib/api'
import type {
  CustomSurveyDto,
  CustomSurveyResultDto,
  CreateCustomSurveyDto,
  CreateCustomSurveyQuestionDto,
} from '@/types/employee'
import {
  FileText,
  Plus,
  RefreshCw,
  Eye,
  Lock,
  ArrowLeft,
  Users,
  CheckCircle,
  HelpCircle,
  Star,
  Trash2,
  ChevronUp,
  ChevronDown,
  Calendar,
  AlertTriangle,
  AlignLeft,
} from 'lucide-react'

// Custom Toast/Notification
interface Toast {
  type: 'success' | 'error'
  message: string
}

export const CustomSurveysPanel = () => {
  const [view, setView] = useState<'list' | 'results'>('list')
  const [surveys, setSurveys] = useState<CustomSurveyDto[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Results view states
  const [selectedSurveyId, setSelectedSurveyId] = useState<number | null>(null)
  const [resultsData, setResultsData] = useState<CustomSurveyResultDto | null>(null)
  const [resultsLoading, setResultsLoading] = useState(false)

  // Modal create states
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [toast, setToast] = useState<Toast | null>(null)

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message })
    setTimeout(() => setToast(null), 3000)
  }

  const loadSurveys = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await getMyCustomSurveys()
      if (res.data?.succeeded) {
        setSurveys(res.data.data ?? [])
      } else {
        setError(res.data?.message ?? 'Không thể tải danh sách khảo sát')
      }
    } catch (err: any) {
      setError(err?.message ?? 'Đã xảy ra lỗi khi tải danh sách khảo sát')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSurveys()
  }, [])

  const handleCloseSurvey = async (id: number, title: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn đóng khảo sát "${title}"? Sau khi đóng, nhân viên sẽ không thể trả lời khảo sát này nữa.`)) {
      return
    }
    try {
      const res = await closeCustomSurvey(id)
      if (res.data?.succeeded) {
        showToast('success', 'Đóng khảo sát thành công')
        await loadSurveys()
      } else {
        showToast('error', res.data?.message ?? 'Không thể đóng khảo sát')
      }
    } catch (err: any) {
      showToast('error', err?.message ?? 'Lỗi kết nối khi đóng khảo sát')
    }
  }

  const handleViewResults = async (id: number) => {
    setSelectedSurveyId(id)
    setView('results')
    setResultsLoading(true)
    setResultsData(null)
    try {
      const res = await getCustomSurveyResults(id)
      if (res.data?.succeeded) {
        setResultsData(res.data.data)
      } else {
        showToast('error', res.data?.message ?? 'Không thể tải kết quả khảo sát')
      }
    } catch (err: any) {
      showToast('error', err?.message ?? 'Lỗi kết nối khi tải kết quả')
    } finally {
      setResultsLoading(false)
    }
  }

  return (
    <div className="space-y-6 font-sans">
      {/* Toast alert */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-2 rounded-2xl px-5 py-4 text-sm font-semibold shadow-lg transition-all transform duration-300 translate-y-0 ${
            toast.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border border-rose-200 text-rose-800'
          }`}
        >
          {toast.type === 'success' ? <CheckCircle size={18} className="text-emerald-600" /> : <AlertTriangle size={18} className="text-rose-600" />}
          {toast.message}
        </div>
      )}

      {view === 'list' && (
        <>
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Khảo sát tùy chỉnh (Custom Surveys)</h3>
              <p className="text-xs text-slate-500 mt-1">HR và Admin tự soạn khảo sát riêng để gửi nhân viên.</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={loadSurveys}
                disabled={loading}
                className="flex items-center justify-center h-10 w-10 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition active:scale-95 disabled:opacity-50"
              >
                <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              </button>
              <button
                type="button"
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 px-5 py-2.5 text-sm font-semibold text-white transition active:scale-95 shadow-sm"
              >
                <Plus size={16} /> Tạo khảo sát
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-semibold text-rose-800 shadow-sm">
              <AlertTriangle size={18} className="shrink-0 text-rose-600" />
              {error}
            </div>
          )}

          {/* Survey list */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Khảo sát</th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Đối tượng</th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Trạng thái</th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Tỷ lệ phản hồi</th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Thời gian hạn</th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500 text-right">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-10 text-center text-sm text-slate-500">
                        <div className="flex items-center justify-center gap-2">
                          <RefreshCw className="h-5 w-5 animate-spin text-slate-400" />
                          Đang tải danh sách khảo sát...
                        </div>
                      </td>
                    </tr>
                  ) : surveys.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-sm text-slate-500">
                        <FileText className="h-10 w-10 mx-auto text-slate-300 mb-3" />
                        <p className="font-semibold text-slate-700">Chưa có khảo sát nào được tạo</p>
                        <p className="text-xs text-slate-400 mt-1">Bấm nút "Tạo khảo sát" để soạn thảo mẫu khảo sát đầu tiên của bạn.</p>
                      </td>
                    </tr>
                  ) : (
                    surveys.map((survey) => {
                      const responsePct = survey.totalTargetCount > 0 ? Math.min((survey.responseCount / survey.totalTargetCount) * 100, 100) : 0
                      const targetLabel =
                        survey.targetType === 'All'
                          ? 'Toàn công ty'
                          : survey.targetType === 'Department'
                          ? `Phòng: ${survey.targetDepartmentName ?? 'N/A'}`
                          : `Team: ${survey.targetTeamName ?? 'N/A'}`

                      return (
                        <tr key={survey.id} className="hover:bg-slate-50/50 transition">
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-semibold text-slate-900 text-sm">{survey.title}</p>
                              {survey.description && (
                                <p className="text-xs text-slate-500 truncate max-w-xs mt-0.5">{survey.description}</p>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-700">
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 bg-slate-100 rounded-lg px-2.5 py-1">
                              <Users size={12} />
                              {targetLabel}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                                survey.status === 'Active'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                  : 'bg-slate-100 text-slate-600 border border-slate-200'
                              }`}
                            >
                              {survey.status === 'Active' ? 'Đang mở' : 'Đã đóng'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="w-32">
                              <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1">
                                <span>{survey.responseCount} / {survey.totalTargetCount}</span>
                                <span>{responsePct.toFixed(0)}%</span>
                              </div>
                              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
                                  style={{ width: `${responsePct}%` }}
                                />
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-xs text-slate-500">
                            <p>Bắt đầu: {new Date(survey.startDate).toLocaleDateString('vi-VN')}</p>
                            <p className="mt-0.5">Hết hạn: {new Date(survey.endDate).toLocaleDateString('vi-VN')}</p>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => void handleViewResults(survey.id)}
                                className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100/80 rounded-lg px-3 py-1.5 transition active:scale-95"
                              >
                                <Eye size={12} /> Kết quả
                              </button>
                              {survey.status === 'Active' && (
                                <button
                                  type="button"
                                  onClick={() => void handleCloseSurvey(survey.id, survey.title)}
                                  className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100/80 rounded-lg px-3 py-1.5 transition active:scale-95"
                                >
                                  <Lock size={12} /> Đóng
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {view === 'results' && (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setView('list')}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50 active:scale-95"
            >
              <ArrowLeft size={16} />
            </button>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Chi tiết kết quả khảo sát</h3>
              <p className="text-xs text-slate-500 mt-1">Dữ liệu tổng hợp ẩn danh thời gian thực.</p>
            </div>
          </div>

          {resultsLoading ? (
            <div className="flex flex-col items-center justify-center py-20 card">
              <RefreshCw className="h-8 w-8 animate-spin text-slate-400 mb-3" />
              <p className="text-sm text-slate-500 font-medium">Đang tổng hợp kết quả khảo sát...</p>
            </div>
          ) : !resultsData ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-700">
              Không tìm thấy dữ liệu kết quả hoặc bạn không có quyền xem kết quả khảo sát này.
            </div>
          ) : (
            <div className="space-y-6">
              {/* Summary widget */}
              <div className="card p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Tiêu đề khảo sát</h4>
                  <p className="text-lg font-bold text-slate-900 leading-snug">{resultsData.title}</p>
                </div>
                <div className="border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Số người phản hồi</h4>
                  <p className="text-2xl font-black text-slate-900 tracking-tight">
                    {resultsData.responseCount}
                    <span className="text-sm font-normal text-slate-500 ml-1">/ {resultsData.totalTargetCount} người</span>
                  </p>
                </div>
                <div className="border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Tỷ lệ phản hồi</h4>
                  <div className="flex items-center gap-3">
                    <p className="text-2xl font-black text-slate-900">{Math.min(resultsData.responseRate, 100).toFixed(0)}%</p>
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-500"
                        style={{ width: `${Math.min(resultsData.responseRate, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Questions results */}
              <div className="space-y-5">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Danh sách câu hỏi & Thống kê chi tiết</h3>
                {resultsData.questions.length === 0 ? (
                  <div className="card p-8 text-center text-sm text-slate-400">Không có câu hỏi nào trong khảo sát này.</div>
                ) : (
                  resultsData.questions.map((q, idx) => {
                    const isRating = q.questionType === 'Rating'
                    return (
                      <div key={q.questionId} className="card p-6 space-y-4">
                        <div className="flex items-start gap-3">
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-600 mt-0.5">
                            {idx + 1}
                          </span>
                          <div>
                            <p className="font-semibold text-slate-900 text-sm leading-snug">{q.questionText}</p>
                            <span className="inline-block text-[10px] font-bold text-slate-400 bg-slate-55 mt-1 uppercase tracking-wider">
                              {isRating ? 'Loại: Đánh giá (Rating)' : 'Loại: Câu hỏi tự luận (Text)'}
                            </span>
                          </div>
                        </div>

                        {isRating ? (
                          <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-6 pt-2">
                            {/* Average rating */}
                            <div className="flex flex-col items-center justify-center p-5 rounded-xl border border-slate-100 bg-slate-50/50 text-center">
                              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Điểm trung bình</span>
                              <span className="text-4xl font-black text-slate-900 tracking-tight">
                                {q.averageRating ? q.averageRating.toFixed(1) : '0.0'}
                              </span>
                              <div className="flex items-center gap-0.5 mt-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    size={14}
                                    className={
                                      star <= (q.averageRating ?? 0)
                                        ? 'fill-amber-400 text-amber-400'
                                        : 'text-slate-200'
                                    }
                                  />
                                ))}
                              </div>
                            </div>

                            {/* Distribution chart */}
                            <div className="space-y-2.5">
                              {[5, 4, 3, 2, 1].map((stars) => {
                                const count = q.ratingDistribution?.[stars] ?? 0
                                const pct = resultsData.responseCount > 0 ? (count / resultsData.responseCount) * 100 : 0
                                return (
                                  <div key={stars} className="flex items-center gap-4 text-xs font-medium text-slate-700">
                                    <span className="w-12 text-slate-500 flex items-center gap-1 font-semibold">
                                      {stars} <Star size={11} className="fill-amber-400 text-amber-400 shrink-0" />
                                    </span>
                                    <div className="flex-1 h-3 bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                                      <div
                                        className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-300"
                                        style={{ width: `${pct}%` }}
                                      />
                                    </div>
                                    <span className="w-24 text-right font-semibold text-slate-600">
                                      {count} lượt ({pct.toFixed(0)}%)
                                    </span>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        ) : (
                          /* Text responses list */
                          <div className="pt-2">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Các câu phản hồi tự do ({q.textAnswers?.length ?? 0}):</p>
                            {!q.textAnswers || q.textAnswers.length === 0 ? (
                              <p className="text-xs text-slate-400 italic bg-slate-50 border border-slate-100 rounded-xl px-4 py-3">Chưa có câu trả lời nào cho câu hỏi này.</p>
                            ) : (
                              <div className="max-h-[300px] overflow-y-auto space-y-2 pr-1">
                                {q.textAnswers.map((answer, ansIdx) => (
                                  <div
                                    key={ansIdx}
                                    className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition text-sm text-slate-700 leading-relaxed"
                                  >
                                    <div className="flex items-center gap-2 mb-1.5">
                                      <div className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ý kiến ẩn danh #{ansIdx + 1}</span>
                                    </div>
                                    <p className="whitespace-pre-wrap">{answer}</p>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Create custom survey Modal */}
      {showCreateModal && (
        <CreateCustomSurveyModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false)
            showToast('success', 'Tạo khảo sát thành công')
            void loadSurveys()
          }}
          showToast={showToast}
        />
      )}
    </div>
  )
}

// ─── Create Custom Survey Modal Component ─────────────────────────────────────
interface CreateSurveyModalProps {
  onClose: () => void
  onSuccess: () => void
  showToast: (type: 'success' | 'error', message: string) => void
}

const CreateCustomSurveyModal = ({ onClose, onSuccess, showToast }: CreateSurveyModalProps) => {
  const [departments, setDepartments] = useState<DepartmentDto[]>([])
  const [teams, setTeams] = useState<TeamDetailDto[]>([])
  const [loadingConfig, setLoadingConfig] = useState(false)

  // Form states
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [targetType, setTargetType] = useState<'All' | 'Department' | 'Team'>('All')
  const [targetDepartmentId, setTargetDepartmentId] = useState<number | ''>('')
  const [targetTeamId, setTargetTeamId] = useState<number | ''>('')
  
  // Date states
  const [startDate, setStartDate] = useState(() => {
    const now = new Date()
    return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
  })
  const [endDate, setEndDate] = useState(() => {
    const nextWeek = new Date()
    nextWeek.setDate(nextWeek.getDate() + 7)
    return new Date(nextWeek.getTime() - nextWeek.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
  })

  // Questions builder states
  const [questions, setQuestions] = useState<CreateCustomSurveyQuestionDto[]>([
    { questionText: '', questionType: 'Rating', isRequired: true, orderIndex: 0 }
  ])
  const [saving, setSaving] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    setLoadingConfig(true)
    ;(async () => {
      try {
        const [deptRes, teamRes] = await Promise.all([getDepartments(), getTeams()])
        if (mounted) {
          if (deptRes.data?.succeeded) setDepartments(deptRes.data.data ?? [])
          if (teamRes.data?.succeeded) setTeams(teamRes.data.data ?? [])
        }
      } catch (err) {
        console.error('Failed to load departments/teams config for Custom Survey Builder', err)
      } finally {
        if (mounted) setLoadingConfig(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [])

  const addQuestion = () => {
    if (questions.length >= 20) {
      showToast('error', 'Chỉ được tạo tối đa 20 câu hỏi cho 1 khảo sát.')
      return
    }
    setQuestions((prev) => [
      ...prev,
      {
        questionText: '',
        questionType: 'Rating',
        isRequired: true,
        orderIndex: prev.length,
      },
    ])
  }

  const removeQuestion = (idx: number) => {
    if (questions.length === 1) {
      showToast('error', 'Khảo sát phải có tối thiểu 1 câu hỏi.')
      return
    }
    const filtered = questions.filter((_, i) => i !== idx)
    // Re-index orderIndex
    const reindexed = filtered.map((q, i) => ({ ...q, orderIndex: i }))
    setQuestions(reindexed)
  }

  const updateQuestion = (idx: number, patch: Partial<CreateCustomSurveyQuestionDto>) => {
    setQuestions((prev) => prev.map((q, i) => (i === idx ? { ...q, ...patch } : q)))
  }

  const moveQuestion = (idx: number, direction: 'up' | 'down') => {
    if (direction === 'up' && idx === 0) return
    if (direction === 'down' && idx === questions.length - 1) return

    const targetIdx = direction === 'up' ? idx - 1 : idx + 1
    const copy = [...questions]
    const temp = copy[idx]
    copy[idx] = copy[targetIdx]
    copy[targetIdx] = temp

    // Reassign orderIndexes
    const reindexed = copy.map((q, i) => ({ ...q, orderIndex: i }))
    setQuestions(reindexed)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)

    // Validations
    if (!title.trim()) {
      setErrorMsg('Vui lòng nhập tiêu đề khảo sát.')
      return
    }
    if (targetType === 'Department' && !targetDepartmentId) {
      setErrorMsg('Vui lòng chọn phòng ban mục tiêu.')
      return
    }
    if (targetType === 'Team' && !targetTeamId) {
      setErrorMsg('Vui lòng chọn team mục tiêu.')
      return
    }

    const start = new Date(startDate)
    const end = new Date(endDate)
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      setErrorMsg('Định dạng thời gian không đúng.')
      return
    }
    if (end <= start) {
      setErrorMsg('Thời gian kết thúc phải lớn hơn thời gian bắt đầu.')
      return
    }

    // Questions validation
    for (let i = 0; i < questions.length; i++) {
      if (!questions[i].questionText.trim()) {
        setErrorMsg(`Câu hỏi số ${i + 1} chưa có nội dung.`)
        return
      }
    }

    setSaving(true)
    try {
      const payload: CreateCustomSurveyDto = {
        title: title.trim(),
        description: description.trim() || undefined,
        targetType,
        targetDepartmentId: targetType === 'Department' ? Number(targetDepartmentId) : undefined,
        targetTeamId: targetType === 'Team' ? Number(targetTeamId) : undefined,
        startDate: start.toISOString(),
        endDate: end.toISOString(),
        questions: questions.map((q) => ({
          ...q,
          questionText: q.questionText.trim(),
        })),
      }

      const res = await createCustomSurvey(payload)
      if (res.data?.succeeded) {
        onSuccess()
      } else {
        setErrorMsg(res.data?.message ?? 'Đã xảy ra lỗi khi tạo khảo sát.')
      }
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message ?? err?.message ?? 'Lỗi kết nối khi tạo khảo sát.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl flex flex-col border border-slate-100">
        
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Tạo khảo sát mới</h3>
            <p className="text-xs text-slate-500 mt-1">Thiết lập câu hỏi và chọn nhóm nhân viên mục tiêu nhận khảo sát.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 active:scale-95 transition"
          >
            Đóng
          </button>
        </div>

        {/* Content/Form */}
        <form onSubmit={(e) => void handleSubmit(e)} className="mt-4 flex-1 space-y-5">
          {/* Section 1: General Info */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-600">1. Thông tin chung</h4>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Tiêu đề khảo sát *</label>
                <input
                  type="text"
                  required
                  maxLength={200}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ví dụ: Khảo sát ý kiến về chế độ làm việc Hybrid"
                  className="w-full h-10 rounded-xl border border-slate-200 px-3.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Mô tả chi tiết</label>
                <textarea
                  maxLength={1000}
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Nhập thông điệp gửi tới nhân viên về mục đích của đợt khảo sát này..."
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition resize-none"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Target Audience & Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 border-t border-slate-100 pt-4">
            {/* Target audience */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-600">2. Đối tượng mục tiêu</h4>
              
              <div className="space-y-3">
                <div className="flex items-center gap-4 text-sm font-medium">
                  {([
                    { val: 'All', lbl: 'Toàn công ty' },
                    { val: 'Department', lbl: 'Phòng ban' },
                    { val: 'Team', lbl: 'Team cụ thể' },
                  ] as const).map((t) => (
                    <label key={t.val} className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="targetType"
                        checked={targetType === t.val}
                        onChange={() => setTargetType(t.val)}
                        className="h-4 w-4 text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer"
                      />
                      <span className="text-slate-700 text-xs font-semibold">{t.lbl}</span>
                    </label>
                  ))}
                </div>

                {targetType === 'Department' && (
                  <div className="relative">
                    <select
                      value={targetDepartmentId}
                      onChange={(e) => setTargetDepartmentId(e.target.value ? Number(e.target.value) : '')}
                      required
                      className="w-full h-10 rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition bg-white"
                    >
                      <option value="">— Lựa chọn phòng ban —</option>
                      {departments.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {targetType === 'Team' && (
                  <div className="relative">
                    <select
                      value={targetTeamId}
                      onChange={(e) => setTargetTeamId(e.target.value ? Number(e.target.value) : '')}
                      required
                      className="w-full h-10 rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition bg-white"
                    >
                      <option value="">— Lựa chọn Team —</option>
                      {teams.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name} ({t.departmentName})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* Time range */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-600">3. Thời gian hạn khảo sát</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Thời gian mở</label>
                  <div className="relative">
                    <input
                      type="datetime-local"
                      required
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full h-10 rounded-xl border border-slate-200 px-2.5 text-xs outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition bg-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Hạn chót</label>
                  <div className="relative">
                    <input
                      type="datetime-local"
                      required
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full h-10 rounded-xl border border-slate-200 px-2.5 text-xs outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition bg-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Question Builder */}
          <div className="border-t border-slate-100 pt-4 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-600">4. Thiết lập câu hỏi ({questions.length}/20)</h4>
              <button
                type="button"
                onClick={addQuestion}
                className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100/80 px-3 py-1.5 rounded-lg transition"
              >
                <Plus size={13} /> Thêm câu hỏi
              </button>
            </div>

            {/* Questions list */}
            <div className="space-y-3">
              {questions.map((q, idx) => (
                <div
                  key={idx}
                  className="group flex flex-col md:flex-row gap-3 rounded-2xl border border-slate-200 hover:border-slate-300 p-4 bg-white shadow-sm transition"
                >
                  {/* Left Controls (Reorder / Remove) */}
                  <div className="flex md:flex-col items-center justify-between md:justify-start gap-1 shrink-0">
                    <span className="text-xs font-bold text-slate-400">#{idx + 1}</span>
                    <div className="flex md:flex-col gap-1 items-center">
                      <button
                        type="button"
                        onClick={() => moveQuestion(idx, 'up')}
                        disabled={idx === 0}
                        className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 disabled:opacity-30"
                      >
                        <ChevronUp size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveQuestion(idx, 'down')}
                        disabled={idx === questions.length - 1}
                        className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 disabled:opacity-30"
                      >
                        <ChevronDown size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Question Text */}
                  <div className="flex-1">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Nội dung câu hỏi *</label>
                    <input
                      type="text"
                      required
                      maxLength={500}
                      value={q.questionText}
                      onChange={(e) => updateQuestion(idx, { questionText: e.target.value })}
                      placeholder={`Ví dụ: ${
                        q.questionType === 'Rating'
                          ? 'Đánh giá mức độ hài lòng về môi trường làm việc'
                          : 'Hãy chia sẻ mong muốn đóng góp của bạn đối với công ty'
                      }`}
                      className="w-full h-10 rounded-xl border border-slate-200 px-3.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition"
                    />
                  </div>

                  {/* Question Type selection */}
                  <div className="w-full md:w-36 shrink-0">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Loại phản hồi</label>
                    <select
                      value={q.questionType}
                      onChange={(e) => updateQuestion(idx, { questionType: e.target.value as 'Rating' | 'Text' })}
                      className="w-full h-10 rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition bg-white"
                    >
                      <option value="Rating">Rating (1-5 sao)</option>
                      <option value="Text">Tự luận (Text)</option>
                    </select>
                  </div>

                  {/* Required Toggle & Delete */}
                  <div className="flex items-center gap-4 justify-between md:justify-start mt-4 md:mt-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                    <label className="flex items-center gap-1.5 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={q.isRequired}
                        onChange={(e) => updateQuestion(idx, { isRequired: e.target.checked })}
                        className="h-4 w-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer"
                      />
                      <span className="text-slate-600 text-xs font-semibold whitespace-nowrap">Bắt buộc</span>
                    </label>

                    <button
                      type="button"
                      onClick={() => removeQuestion(idx)}
                      className="h-9 w-9 shrink-0 flex items-center justify-center rounded-xl border border-rose-100 text-rose-500 hover:border-rose-200 hover:bg-rose-50/50 transition active:scale-95"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Error message */}
          {errorMsg && (
            <div className="flex items-center gap-2 rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              <AlertTriangle size={14} className="shrink-0" /> {errorMsg}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition active:scale-95"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 px-6 py-2.5 text-sm font-semibold text-white transition active:scale-95 disabled:opacity-50"
            >
              {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : null}
              {saving ? 'Đang lưu...' : 'Tạo & Gửi Khảo Sát'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
