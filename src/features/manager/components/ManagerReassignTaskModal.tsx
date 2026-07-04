import React, { useEffect, useState } from 'react'
import { X, Sparkles, Loader2, AlertCircle, UserCheck, MessageSquare } from 'lucide-react'
import { listTeams, getTeamPerformance, getAssigneeSuggestions, reassignTask, updateTask } from '../api'
import type { TaskInstanceDto, AssigneeSuggestionDto } from '../types'

interface Props {
  task: TaskInstanceDto
  onClose: () => void
  onSuccess: () => void
}

export default function ManagerReassignTaskModal({ task, onClose, onSuccess }: Props) {
  const [teams, setTeams] = useState<Array<{ id: number; name: string }>>([])
  const [selectedTeamId, setSelectedTeamId] = useState<number | ''>('')
  const [members, setMembers] = useState<Array<{ userId: string; userName: string }>>([])
  const [selectedUserId, setSelectedUserId] = useState<string>('')
  const [reason, setReason] = useState<string>('')

  // Format date helper
  const formatDateTimeLocal = (isoString?: string) => {
    if (!isoString) return ''
    const d = new Date(isoString)
    if (isNaN(d.getTime())) return ''
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    const hours = String(d.getHours()).padStart(2, '0')
    const minutes = String(d.getMinutes()).padStart(2, '0')
    return `${year}-${month}-${day}T${hours}:${minutes}`
  }

  const [expectedCompletion, setExpectedCompletion] = useState<string>(
    formatDateTimeLocal(task.expectedCompletion)
  )
  
  const [loadingConfig, setLoadingConfig] = useState(false)
  const [loadingMembers, setLoadingMembers] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // AI Suggestions states
  const [aiSuggestions, setAiSuggestions] = useState<AssigneeSuggestionDto[]>([])
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState<string | null>(null)
  const [showAiPanel, setShowAiPanel] = useState(false)

  // Load active teams
  useEffect(() => {
    let mounted = true
    setLoadingConfig(true)
    ;(async () => {
      try {
        const activeTeams = await listTeams({ isActive: true })
        if (mounted) {
          setTeams(activeTeams.map((x: any) => ({ id: x.id, name: x.name })))
        }
      } catch (err: any) {
        console.error('Failed to load teams', err)
      } finally {
        if (mounted) setLoadingConfig(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [])

  // Load team members when team changes
  useEffect(() => {
    if (!selectedTeamId) {
      setMembers([])
      setSelectedUserId('')
      return
    }
    let mounted = true
    setLoadingMembers(true)
    ;(async () => {
      try {
        const perf = await getTeamPerformance(Number(selectedTeamId))
        if (mounted) {
          if (perf && perf.members) {
            setMembers(perf.members.map((m: any) => ({ userId: m.userId, userName: m.userName })))
          } else {
            setMembers([])
          }
          setSelectedUserId('')
        }
      } catch (err: any) {
        console.error('Failed to load members', err)
        if (mounted) setMembers([])
      } finally {
        if (mounted) setLoadingMembers(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [selectedTeamId])

  // Get AI recommendations
  const handleAiSuggest = async () => {
    if (!selectedTeamId) {
      setAiError('Vui lòng chọn một team để gợi ý AI.')
      setShowAiPanel(true)
      return
    }
    setAiLoading(true)
    setAiError(null)
    setShowAiPanel(true)
    try {
      const suggestions = await getAssigneeSuggestions(task.taskTypeId, Number(selectedTeamId))
      setAiSuggestions(suggestions)
    } catch (err: any) {
      setAiError(err?.message ?? 'Không thể lấy gợi ý AI từ hệ thống.')
    } finally {
      setAiLoading(false)
    }
  }

  // Handle reassign submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!selectedUserId) {
      setError('Vui lòng chọn người thực hiện mới.')
      return
    }

    let completionUtc: string | undefined = undefined
    if (expectedCompletion) {
      const completionDate = new Date(expectedCompletion)
      if (isNaN(completionDate.getTime())) {
        setError('Ngày hoàn thành không hợp lệ.')
        return
      }
      if (completionDate <= new Date()) {
        setError('Ngày hoàn thành mới phải ở tương lai.')
        return
      }
      completionUtc = completionDate.toISOString()
    }

    setIsSaving(true)
    try {
      // 1. Reassign task assignee
      await reassignTask(task.id, {
        newAssignedUserId: selectedUserId,
        reason: reason.trim() || undefined,
      })

      // 2. If due date changed, update task info
      if (completionUtc && completionUtc !== task.expectedCompletion) {
        await updateTask(task.id, {
          expectedCompletion: completionUtc,
        })
      }

      onSuccess()
      onClose()
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.message ?? 'Giao lại hoặc cập nhật task thất bại.'
      setError(msg)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 backdrop-blur-sm p-4 font-sans">
      <div className={`relative w-full ${showAiPanel ? 'max-w-5xl' : 'max-w-xl'} rounded-3xl bg-white shadow-2xl flex flex-col border border-slate-100 transition-all duration-300 overflow-hidden`}>
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 flex items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <UserCheck size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Giao lại nhiệm vụ</h2>
              <p className="text-[11px] text-slate-500 mt-0.5">Thay đổi người thực hiện cho task: <strong className="text-slate-700">{task.taskCode}</strong></p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition active:scale-95">
            <X size={18} />
          </button>
        </div>

        <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-slate-100 overflow-hidden max-h-[75vh]">
          {/* Main Form */}
          <form onSubmit={(e) => void handleSubmit(e)} className="flex-1 space-y-4 p-6 overflow-y-auto">
            {error && (
              <div className="flex gap-2.5 rounded-2xl border border-rose-100 bg-rose-50 p-4 text-xs font-semibold text-rose-700">
                <AlertCircle size={15} className="shrink-0 mt-0.5" />
                {error}
              </div>
            )}

            {/* Task Info Banner */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tên công việc</p>
              <h4 className="text-sm font-bold text-slate-800 mt-1">{task.title}</h4>
              <p className="text-xs text-slate-500 mt-1">Người đang thực hiện: <strong>{task.assignedUserName}</strong></p>
            </div>

            {/* Select Team */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Chọn Nhóm (Team)</label>
              <select
                disabled={loadingConfig}
                value={selectedTeamId}
                onChange={(e) => {
                  setSelectedTeamId(e.target.value ? Number(e.target.value) : '')
                }}
                className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition"
              >
                <option value="">— Lựa chọn Team —</option>
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>

            {/* Select Assignee */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Người thực hiện mới</label>
                <button
                  type="button"
                  onClick={handleAiSuggest}
                  disabled={!selectedTeamId}
                  className="flex items-center gap-1 text-[11px] font-bold text-violet-600 hover:text-violet-750 disabled:opacity-40 transition"
                >
                  <Sparkles size={11} /> Gợi ý AI
                </button>
              </div>
              
              <select
                disabled={loadingMembers || !selectedTeamId}
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition disabled:opacity-50"
              >
                <option value="">
                  {loadingMembers ? 'Đang tải danh sách thành viên...' : '— Lựa chọn thành viên mới —'}
                </option>
                {members.map((m) => (
                  <option key={m.userId} value={m.userId}>{m.userName}</option>
                ))}
              </select>
            </div>

            {/* Expected Completion (New Due Date) */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Hạn hoàn thành mới</label>
              <input
                type="datetime-local"
                value={expectedCompletion}
                onChange={(e) => setExpectedCompletion(e.target.value)}
                className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition"
              />
            </div>

            {/* Reassign Reason */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                <MessageSquare size={13} className="text-slate-400" />
                Lý do giao lại (Không bắt buộc)
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Nhập lý do giao lại công việc..."
                rows={3}
                maxLength={200}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10 transition resize-none"
              />
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 justify-end border-t border-slate-100 pt-5 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="rounded-2xl border border-slate-200 hover:bg-slate-50 px-5 py-2.5 text-sm font-semibold text-slate-700 transition active:scale-95"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isSaving || !selectedUserId}
                className="flex items-center justify-center gap-1.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 px-6 py-2.5 text-sm font-bold text-white shadow-md shadow-blue-200/50 transition active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isSaving && <Loader2 size={14} className="animate-spin" />}
                {isSaving ? 'Đang thực hiện…' : 'Xác nhận'}
              </button>
            </div>
          </form>

          {/* AI Panel (Right Side) */}
          {showAiPanel && (
            <div className="w-full md:w-96 p-6 bg-slate-50 flex flex-col overflow-y-auto max-h-[75vh]">
              <div className="flex items-center justify-between mb-4 flex-shrink-0">
                <h3 className="text-sm font-bold text-slate-850 flex items-center gap-1.5">
                  <Sparkles size={14} className="text-violet-500 animate-pulse" />
                  Gợi ý giao việc AI
                </h3>
                <button onClick={() => setShowAiPanel(false)} className="text-slate-400 hover:text-slate-650 rounded-lg p-0.5 hover:bg-slate-200 transition">
                  <X size={15} />
                </button>
              </div>

              {aiLoading ? (
                <div className="flex-1 flex flex-col items-center justify-center py-20 text-slate-400">
                  <Loader2 className="h-6 w-6 animate-spin text-violet-500 mb-2" />
                  <p className="text-[11px] font-medium">AI đang phân tích workload & kỹ năng...</p>
                </div>
              ) : aiError ? (
                <div className="rounded-2xl border border-rose-100 bg-rose-50 p-4 text-xs text-rose-700">
                  {aiError}
                </div>
              ) : aiSuggestions.length === 0 ? (
                <p className="text-xs text-slate-500 py-16 text-center">Không tìm thấy gợi ý phù hợp.</p>
              ) : (
                <div className="space-y-3.5 pr-1">
                  {aiSuggestions.map((s) => (
                    <div key={s.userId} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:border-violet-300 transition duration-150">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="text-xs font-black text-slate-800">{s.userName}</h4>
                          <div className="mt-1.5 flex items-center gap-1.5">
                            <span className={`rounded-lg px-2 py-0.5 text-[9px] font-bold text-white ${
                              s.fitLabel === 'Rất phù hợp' ? 'bg-emerald-500' :
                              s.fitLabel === 'Phù hợp' ? 'bg-cyan-500' :
                              s.fitLabel === 'Có thể giao' ? 'bg-amber-500' : 'bg-rose-500'
                            }`}>
                              {s.fitLabel}
                            </span>
                            <span className="text-[10px] font-bold text-slate-450">Điểm: {s.fitScore}</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSelectedUserId(s.userId)}
                          className="rounded-xl bg-violet-650 px-3 py-1.5 text-xs font-bold text-white hover:bg-violet-750 active:scale-95 transition"
                        >
                          Chọn
                        </button>
                      </div>

                      <p className="mt-2.5 text-xs text-slate-650 leading-relaxed bg-slate-50 rounded-xl p-2.5 border border-slate-100 italic">
                        "{s.reasoning}"
                      </p>

                      <div className="mt-3 grid grid-cols-2 gap-x-2 gap-y-1.5 border-t border-slate-100 pt-2.5 text-[9px] font-semibold text-slate-500">
                        <div>Tasks chạy: <strong className="text-slate-700">{s.metrics.activeTaskCount}</strong></div>
                        <div>Kiệt sức: <strong className={`font-bold ${s.metrics.burnoutRiskLevel === 'HIGH' ? 'text-rose-500' : s.metrics.burnoutRiskLevel === 'MEDIUM' ? 'text-amber-500' : 'text-emerald-500'}`}>{s.metrics.burnoutRiskLevel}</strong></div>
                        <div>Số ngày OT: <strong className="text-slate-700">{s.metrics.overtimeDaysThisWeek}</strong></div>
                        <div>Kinh nghiệm: <strong className="text-slate-700">{s.metrics.taskTypeExperienceCount} lần</strong></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
