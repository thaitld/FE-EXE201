import { useEffect, useState } from 'react'
import { X, AlertCircle } from 'lucide-react'
import { createTask, listTeams, getTeamPerformance, listTaskTypes, getAssigneeSuggestions } from '../api'
import type { CreateTaskInstanceDto } from '@/lib/api'
import type { AssigneeSuggestionDto } from '../types'
import { Sparkles, Loader2 } from 'lucide-react'

interface Props {
  onClose: () => void
  onSuccess: () => void
}

export default function ManagerCreateTaskModal({ onClose, onSuccess }: Props) {
  const [form, setForm] = useState<CreateTaskInstanceDto>({
    taskTypeId: 0,
    title: '',
    assignedUserId: '',
    plannedQuantity: 1,
    expectedCompletion: '',
    priority: 'MEDIUM',
  })
  const [teams, setTeams] = useState<Array<{ id: number; name: string }>>([])
  const [members, setMembers] = useState<Array<{ userId: string; userName: string }>>([])
  const [taskTypes, setTaskTypes] = useState<Array<{ id: number; name: string }>>([])
  const [selectedTeamId, setSelectedTeamId] = useState<number | ''>('')
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [aiSuggestions, setAiSuggestions] = useState<AssigneeSuggestionDto[]>([])
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState<string | null>(null)
  const [showAiPanel, setShowAiPanel] = useState(false)

  const handleAiSuggest = async () => {
    if (!form.taskTypeId || !selectedTeamId) {
      setAiError('Vui lòng chọn loại task và team trước.')
      setShowAiPanel(true)
      return
    }
    setAiLoading(true)
    setAiError(null)
    setShowAiPanel(true)
    try {
      const suggestions = await getAssigneeSuggestions(form.taskTypeId, Number(selectedTeamId))
      setAiSuggestions(suggestions)
    } catch (err: any) {
      setAiError(err?.message ?? 'Không thể lấy gợi ý AI.')
    } finally {
      setAiLoading(false)
    }
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    setError(null)
    if (!form.title.trim()) return setError('Vui lòng nhập tiêu đề công việc')
    if (!form.taskTypeId) return setError('Vui lòng chọn loại task')
    if (!form.assignedUserId) return setError('Vui lòng chọn người thực hiện')
    if (!form.expectedCompletion) return setError('Vui lòng chọn ngày hoàn thành')

    // Convert datetime-local string to proper ISO 8601 UTC string
    // Input: "2026-06-03T16:32" → Output: "2026-06-03T16:32:00.000Z"
    const completionDate = new Date(form.expectedCompletion)
    if (isNaN(completionDate.getTime())) return setError('Ngày hoàn thành không hợp lệ')
    if (completionDate <= new Date()) return setError('Ngày hoàn thành phải ở tương lai')

    const payload = {
      ...form,
      expectedCompletion: completionDate.toISOString(),
    }

    setIsSaving(true)
    try {
      await createTask(payload)
      onSuccess()
      onClose()
    } catch (err: any) {
      // Show detailed error message from backend if available
      const msg = err?.response?.data?.message ?? err?.message ?? 'Tạo task thất bại'
      setError(msg)
    } finally {
      setIsSaving(false)
    }
  }


  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const t = await listTeams({ isActive: true })
        if (!mounted) return
        setTeams(t.map((x: any) => ({ id: x.id, name: x.name })))
      } catch {
        // ignore
      }

      try {
        const tt = await listTaskTypes()
        if (!mounted) return
        setTaskTypes(tt.map((x: any) => ({ id: x.id, name: x.name })))
        if (tt.length && form.taskTypeId === 0) setForm((f) => ({ ...f, taskTypeId: tt[0].id }))
      } catch {
        // ignore
      }
    })()
    return () => { mounted = false }
  }, [])

  useEffect(() => {
    if (!selectedTeamId) {
      setMembers([])
      return
    }
    let mounted = true
    ;(async () => {
      try {
        const perf = await getTeamPerformance(Number(selectedTeamId))
        if (!mounted) return
        if (!perf || !perf.members) {
          setMembers([])
        } else {
          setMembers((perf.members ?? []).map((m: any) => ({ userId: m.userId, userName: m.userName })))
        }
      } catch {
        setMembers([])
      }
    })()
    return () => { mounted = false }
  }, [selectedTeamId])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 overflow-y-auto p-4">
      <div className={`relative w-full ${showAiPanel ? 'max-w-5xl' : 'max-w-2xl'} rounded-2xl bg-white shadow-xl flex flex-col transition-all duration-300`}>
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-bold text-slate-900">Create Task (Manager)</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700"><X size={20} /></button>
        </div>

        <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-slate-200 overflow-hidden">
          <form onSubmit={handleSubmit} className="flex-1 space-y-4 p-6">
            {error && (
              <div className="flex gap-3 rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="form-label font-semibold">Task Title</label>
                <input
                  type="text"
                  placeholder="Nhập tiêu đề công việc..."
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="form-input"
                  required
                />
              </div>

              <div>
                <label className="form-label">Task type</label>
                <select value={form.taskTypeId} onChange={(e) => setForm({ ...form, taskTypeId: Number(e.target.value) })} className="form-input">
                  <option value={0}>— Select task type —</option>
                  {taskTypes.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label">Team</label>
                <select value={selectedTeamId ?? ''} onChange={(e) => { const v = e.target.value ? Number(e.target.value) : ''; setSelectedTeamId(v); setForm((f) => ({ ...f, assignedUserId: '' } as any)) }} className="form-input">
                  <option value="">— Select team —</option>
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="form-label">Assignee</label>
                  <button
                    type="button"
                    onClick={handleAiSuggest}
                    className="flex items-center gap-1 text-[11px] font-semibold text-violet-600 hover:text-violet-700 transition"
                  >
                    <Sparkles size={11} /> Gợi ý AI
                  </button>
                </div>
                <select value={form.assignedUserId} onChange={(e) => setForm({ ...form, assignedUserId: e.target.value })} className="form-input">
                  <option value="">— Select assignee —</option>
                  {members.map((m) => (
                    <option key={m.userId} value={m.userId}>{m.userName}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label">Due Date</label>
                <input type="datetime-local" value={form.expectedCompletion} onChange={(e) => setForm({ ...form, expectedCompletion: e.target.value })} className="form-input" />
              </div>

              <div>
                <label className="form-label">Priority</label>
                <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} className="form-input">
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="CRITICAL">Critical</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 justify-end border-t border-slate-200 pt-6">
              <button type="button" onClick={onClose} className="form-btn">Cancel</button>
              <button type="button" onClick={(e) => void handleSubmit(e)} disabled={isSaving} className="form-cta">{isSaving ? 'Creating…' : 'Create'}</button>
            </div>
          </form>

          {showAiPanel && (
            <div className="w-full md:w-96 p-6 bg-slate-50 flex flex-col max-h-[500px] overflow-hidden">
              <div className="flex items-center justify-between mb-4 flex-shrink-0">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                  <Sparkles size={14} className="text-violet-500" />
                  Gợi ý giao việc AI
                </h3>
                <button onClick={() => setShowAiPanel(false)} className="text-slate-400 hover:text-slate-600">
                  <X size={16} />
                </button>
              </div>

              {aiLoading ? (
                <div className="flex-1 flex flex-col items-center justify-center py-10 text-slate-500">
                  <Loader2 className="h-6 w-6 animate-spin text-violet-500 mb-2" />
                  <p className="text-xs">AI đang phân tích workload...</p>
                </div>
              ) : aiError ? (
                <div className="rounded-lg border border-rose-100 bg-rose-50 p-4 text-xs text-rose-600 overflow-y-auto">
                  {aiError}
                </div>
              ) : aiSuggestions.length === 0 ? (
                <p className="text-xs text-slate-500 py-10 text-center flex-1">Không có gợi ý khả thi nào.</p>
              ) : (
                <div className="space-y-3 flex-1 overflow-y-auto pr-1">
                  {aiSuggestions.map((s) => (
                    <div key={s.userId} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:border-violet-300 transition-colors">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="text-sm font-bold text-slate-800">{s.userName}</h4>
                          <div className="mt-1 flex items-center gap-1.5">
                            <span className={`rounded px-1.5 py-0.5 text-[9px] font-bold text-white ${
                              s.fitLabel === 'Rất phù hợp' ? 'bg-emerald-500' :
                              s.fitLabel === 'Phù hợp' ? 'bg-cyan-500' :
                              s.fitLabel === 'Có thể giao' ? 'bg-amber-500' : 'bg-rose-500'
                            }`}>
                              {s.fitLabel}
                            </span>
                            <span className="text-xs text-slate-500">Score: {s.fitScore}</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setForm((f) => ({ ...f, assignedUserId: s.userId }))}
                          className="rounded-lg bg-violet-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-violet-700 transition"
                        >
                          Chọn
                        </button>
                      </div>

                      <p className="mt-2.5 text-xs text-slate-600 leading-relaxed bg-slate-50 rounded-lg p-2 border border-slate-100">{s.reasoning}</p>

                      <div className="mt-3 grid grid-cols-2 gap-x-2 gap-y-1.5 border-t border-slate-100 pt-2.5 text-[10px] text-slate-500">
                        <div>Đang chạy: <strong className="text-slate-700">{s.metrics.activeTaskCount}</strong></div>
                        <div>Burnout: <strong className={`font-bold ${s.metrics.burnoutRiskLevel === 'HIGH' ? 'text-rose-500' : s.metrics.burnoutRiskLevel === 'MEDIUM' ? 'text-amber-500' : 'text-emerald-500'}`}>{s.metrics.burnoutRiskLevel}</strong></div>
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
