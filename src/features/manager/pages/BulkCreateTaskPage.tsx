import { useState, useEffect } from 'react'
import { bulkCreateTasks, listTaskTypes, listTeams, getTeamPerformance } from '../api'
import { Plus, Trash2, Send, AlertTriangle, CheckCircle2, AlertCircle } from 'lucide-react'
import type { TaskTypeDto } from '../types'

interface RowItem {
  taskTypeId: string
  title: string
  assignedUserId: string
  expectedCompletion: string
  priority: string
}

interface BulkCreateErrorDto {
  index: number
  field: string
  message: string
}

const emptyRow = (): RowItem => ({
  taskTypeId: '',
  title: '',
  assignedUserId: '',
  expectedCompletion: '',
  priority: 'MEDIUM',
})

const priorityColor: Record<string, string> = {
  LOW: 'text-blue-500 border-blue-100 bg-blue-50',
  MEDIUM: 'text-amber-600 border-amber-100 bg-amber-50',
  HIGH: 'text-orange-600 border-orange-100 bg-orange-50',
  CRITICAL: 'text-rose-600 border-rose-100 bg-rose-50',
}

export default function BulkCreateTaskPage() {
  const [rows, setRows] = useState<RowItem[]>([emptyRow(), emptyRow()])
  const [taskTypes, setTaskTypes] = useState<TaskTypeDto[]>([])
  const [users, setUsers] = useState<Array<{ id: string; name: string; teamName: string }>>([])
  
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<BulkCreateErrorDto[]>([])
  const [loading, setLoading] = useState(false)

  // Load Task Types and Users across all active teams
  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const types = await listTaskTypes()
        if (mounted) {
          setTaskTypes(types)
        }
      } catch (err) {
        console.error('Failed to load task types', err)
      }

      try {
        const activeTeams = await listTeams({ isActive: true })
        const membersPromises = activeTeams.map(async (team: any) => {
          try {
            const perf = await getTeamPerformance(team.id)
            return (perf.members ?? []).map((m: any) => ({
              id: m.userId,
              name: m.userName,
              teamName: team.name,
            }))
          } catch {
            return []
          }
        })
        const results = await Promise.all(membersPromises)
        const allUsers = results.flat()
        // Deduplicate users by ID
        const uniqUsers = Array.from(new Map(allUsers.map((u) => [u.id, u])).values())
        if (mounted) {
          setUsers(uniqUsers)
        }
      } catch (err) {
        console.error('Failed to load team members', err)
      }
    })()
    return () => {
      mounted = false
    }
  }, [])

  const updateRow = (index: number, patch: Partial<RowItem>) => {
    setRows((items) => items.map((row, i) => (i === index ? { ...row, ...patch } : row)))
    // Clear validation errors for this row when user edits it
    setValidationErrors((errs) => errs.filter((e) => e.index !== index))
  }

  const removeRow = (index: number) => {
    setRows((items) => items.filter((_, i) => i !== index))
    // Re-index validation errors
    setValidationErrors((errs) =>
      errs
        .filter((e) => e.index !== index)
        .map((e) => (e.index > index ? { ...e, index: e.index - 1 } : e))
    )
  }

  const submit = async () => {
    setLoading(true)
    setError(null)
    setResult(null)
    setValidationErrors([])

    // Basic frontend validations
    for (let i = 0; i < rows.length; i++) {
      const r = rows[i]
      if (!r.title.trim()) {
        setError(`Dòng ${i + 1}: Vui lòng nhập tiêu đề công việc.`)
        setLoading(false)
        return
      }
      if (!r.taskTypeId) {
        setError(`Dòng ${i + 1}: Vui lòng chọn loại task.`)
        setLoading(false)
        return
      }
      if (!r.assignedUserId) {
        setError(`Dòng ${i + 1}: Vui lòng chọn người thực hiện.`)
        setLoading(false)
        return
      }
      if (!r.expectedCompletion) {
        setError(`Dòng ${i + 1}: Vui lòng chọn ngày hoàn thành (Deadline).`)
        setLoading(false)
        return
      }
      const completionDate = new Date(r.expectedCompletion)
      if (isNaN(completionDate.getTime())) {
        setError(`Dòng ${i + 1}: Deadline không đúng định dạng.`)
        setLoading(false)
        return
      }
      if (completionDate <= new Date()) {
        setError(`Dòng ${i + 1}: Deadline phải ở tương lai.`)
        setLoading(false)
        return
      }
    }

    try {
      const payload = {
        tasks: rows.map((row) => ({
          taskTypeId: Number(row.taskTypeId),
          title: row.title.trim(),
          assignedUserId: row.assignedUserId,
          plannedQuantity: 1,
          expectedCompletion: new Date(row.expectedCompletion).toISOString(),
          priority: row.priority,
        })),
      }

      const response = await bulkCreateTasks(payload)
      
      if (response.errors && response.errors.length > 0) {
        setValidationErrors(response.errors)
        setError(`Không thể tạo. Có ${response.errors.length} lỗi xác thực dữ liệu từ server.`)
      } else {
        setResult(`Giao việc hàng loạt thành công! Đã tạo thành công ${response.successCount} công việc.`)
        setRows([emptyRow(), emptyRow()]) // Reset form
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.message ?? 'Đã xảy ra lỗi khi tạo task hàng loạt.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Giao Việc Hàng Loạt (Bulk Create Tasks)</h3>
          <p className="text-xs text-slate-500 mt-1">
            Giao tối đa 50 công việc cùng lúc. Hiện có <span className="font-bold text-slate-900">{rows.length} hàng</span>.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setRows((items) => [...items, emptyRow()])}
            disabled={rows.length >= 50}
            className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition active:scale-95 disabled:opacity-50"
          >
            <Plus size={16} /> Thêm hàng
          </button>
          <button
            type="button"
            onClick={() => void submit()}
            disabled={loading || rows.length === 0}
            className="flex items-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 px-5 py-2 text-sm font-semibold text-white transition active:scale-95 disabled:opacity-50"
          >
            <Send size={14} className={loading ? 'animate-pulse' : ''} />
            {loading ? 'Đang tạo...' : 'Bulk create'}
          </button>
        </div>
      </div>

      {/* Rows Container */}
      <div className="space-y-3">
        {rows.map((row, index) => {
          const rowErrors = validationErrors.filter((e) => e.index === index)
          const hasError = rowErrors.length > 0

          return (
            <div
              key={index}
              className={`flex flex-col gap-3 rounded-2xl border p-5 bg-white shadow-sm transition-all duration-200 ${
                hasError ? 'border-rose-300 ring-2 ring-rose-100 bg-rose-50/10' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              {/* Row Header Info */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <span className="text-xs font-bold text-slate-400">Hàng #{index + 1}</span>
                {hasError && (
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-rose-600">
                    <AlertCircle size={12} /> Dòng này có lỗi dữ liệu
                  </span>
                )}
              </div>

              {/* Grid Inputs */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-12 items-end">
                {/* Title */}
                <div className="lg:col-span-4">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Tiêu đề công việc</label>
                  <input
                    type="text"
                    value={row.title}
                    onChange={(e) => updateRow(index, { title: e.target.value })}
                    placeholder="Ví dụ: Fix bug login, Viết tài liệu..."
                    className="w-full h-10 rounded-xl border border-slate-200 px-3.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition"
                  />
                </div>

                {/* Task Type */}
                <div className="lg:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Loại Task</label>
                  <select
                    value={row.taskTypeId}
                    onChange={(e) => updateRow(index, { taskTypeId: e.target.value })}
                    className="w-full h-10 rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition bg-white"
                  >
                    <option value="">— Chọn loại —</option>
                    {taskTypes.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Assignee */}
                <div className="lg:col-span-3">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Người thực hiện</label>
                  <select
                    value={row.assignedUserId}
                    onChange={(e) => updateRow(index, { assignedUserId: e.target.value })}
                    className="w-full h-10 rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition bg-white"
                  >
                    <option value="">— Chọn nhân viên —</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.teamName})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Deadline */}
                <div className="lg:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Hạn chót (Deadline)</label>
                  <input
                    type="datetime-local"
                    value={row.expectedCompletion}
                    onChange={(e) => updateRow(index, { expectedCompletion: e.target.value })}
                    className="w-full h-10 rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition bg-white"
                  />
                </div>

                {/* Priority & Delete Actions */}
                <div className="lg:col-span-1 flex items-center gap-2">
                  <div className="flex-1">
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Ưu tiên</label>
                    <select
                      value={row.priority}
                      onChange={(e) => updateRow(index, { priority: e.target.value })}
                      className={`h-10 w-full rounded-xl border px-2.5 text-xs font-bold outline-none transition bg-white ${priorityColor[row.priority]}`}
                    >
                      {['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map((p) => (
                        <option key={p} className="text-slate-900 font-normal">
                          {p}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeRow(index)}
                    className="h-10 w-10 shrink-0 flex items-center justify-center rounded-xl border border-rose-100 text-rose-500 transition hover:border-rose-200 hover:bg-rose-50/50 mt-6"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              {/* Row-specific validation errors from server */}
              {hasError && (
                <div className="mt-2.5 bg-rose-50 rounded-xl p-3 border border-rose-100 text-xs text-rose-700 space-y-1">
                  {rowErrors.map((err, errIdx) => (
                    <div key={errIdx} className="flex items-center gap-1.5">
                      <div className="w-1 h-1 rounded-full bg-rose-500 shrink-0" />
                      <span>
                        Lỗi trường <strong>{err.field}</strong>: {err.message}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Global Feedback Notifications */}
      {result && (
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-semibold text-emerald-800 shadow-sm">
          <CheckCircle2 size={18} className="shrink-0 text-emerald-600" />
          {result}
        </div>
      )}
      {error && (
        <div className="flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-semibold text-rose-800 shadow-sm">
          <AlertTriangle size={18} className="shrink-0 text-rose-600" />
          {error}
        </div>
      )}
    </div>
  )
}