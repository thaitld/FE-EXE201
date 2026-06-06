import { useState } from 'react'
import { bulkCreateTasks } from '../api'
import { Plus, Trash2, Send, AlertTriangle, CheckCircle2 } from 'lucide-react'

interface RowItem {
  taskTypeId: string
  title: string
  assignedUserId: string
  expectedCompletion: string
  priority: string
}

const emptyRow = (): RowItem => ({
  taskTypeId: '', title: '', assignedUserId: '', expectedCompletion: '', priority: 'MEDIUM',
})

const priorityColor: Record<string, string> = {
  LOW: 'text-slate-400', MEDIUM: 'text-amber-400', HIGH: 'text-orange-400', CRITICAL: 'text-rose-400',
}

export default function BulkCreateTaskPage() {
  const [rows, setRows] = useState<RowItem[]>([emptyRow()])
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const updateRow = (index: number, patch: Partial<RowItem>) =>
    setRows(items => items.map((row, i) => (i === index ? { ...row, ...patch } : row)))

  const removeRow = (index: number) =>
    setRows(items => items.filter((_, i) => i !== index))

  const submit = async () => {
    setLoading(true); setError(null); setResult(null)
    try {
      const tasks = rows.map(row => ({
        taskTypeId: Number(row.taskTypeId),
        title: row.title,
        assignedUserId: row.assignedUserId,
        expectedCompletion: row.expectedCompletion,
        priority: row.priority,
      }))
      const response = await bulkCreateTasks({ tasks })
      if (!response) throw new Error('Empty response')
      setResult(`✓ ${response.successCount} thành công · ${response.failCount} thất bại`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create tasks')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-5">
      {/* Header row */}
      <div className="flex items-center justify-between gap-4">
        <p className="text-xs text-slate-500">
          Tạo tối đa 50 tasks cùng lúc. <span className="text-slate-400">{rows.length} hàng</span>
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setRows(items => [...items, emptyRow()])}
            disabled={rows.length >= 50}
            className="form-btn"
          >
            <Plus size={14} /> Thêm hàng
          </button>
          <button
            type="button"
            onClick={() => void submit()}
            disabled={loading || rows.length === 0}
            className="form-cta"
          >
            <Send size={13} className={loading ? 'animate-pulse' : ''} />
            {loading ? 'Đang tạo...' : 'Bulk create'}
          </button>
        </div>
      </div>

      {/* Column headers */}
      <div className="hidden grid-cols-[1fr_2fr_1fr_1.3fr_auto] gap-3 px-4 xl:grid">
        {['Task Type ID', 'Tiêu đề', 'Assigned User ID', 'Deadline', 'Priority / Xoá'].map(h => (
          <p key={h} className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">{h}</p>
        ))}
      </div>

      {/* Rows */}
      <div className="space-y-2">
        {rows.map((row, index) => (
          <div
            key={index}
            className="grid gap-2.5 rounded-2xl border border-slate-200 bg-white p-3.5 xl:grid-cols-[1fr_2fr_1fr_1.3fr_auto] xl:items-center shadow-sm"
          >
            <Input
              value={row.taskTypeId}
              onChange={v => updateRow(index, { taskTypeId: v })}
              placeholder="ID loại task"
              type="number"
            />
            <Input
              value={row.title}
              onChange={v => updateRow(index, { title: v })}
              placeholder="Tiêu đề task"
            />
            <Input
              value={row.assignedUserId}
              onChange={v => updateRow(index, { assignedUserId: v })}
              placeholder="User GUID"
            />
            <Input
              value={row.expectedCompletion}
              onChange={v => updateRow(index, { expectedCompletion: v })}
              placeholder="2026-06-01T17:00:00"
            />
            <div className="flex items-center gap-2">
              <div className="relative flex-1 xl:w-32 xl:flex-none">
                <select
                  value={row.priority}
                  onChange={e => updateRow(index, { priority: e.target.value })}
                  className={`h-9 w-full appearance-none rounded-xl border border-slate-300 bg-white pl-3 pr-7 text-sm font-semibold outline-none ${priorityColor[row.priority]}`}
                >
                  {['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map(p => (
                    <option key={p}>{p}</option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                onClick={() => removeRow(index)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-rose-200 text-rose-500 transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Feedback */}
      {result && (
        <div className="flex items-center gap-2.5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          <CheckCircle2 size={15} className="shrink-0" />
          {result}
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2.5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
          <AlertTriangle size={15} className="shrink-0" />
          {error}
        </div>
      )}
    </div>
  )
}

function Input({ value, onChange, placeholder, type = 'text' }: {
  value: string; onChange: (v: string) => void; placeholder: string; type?: string
}) {
  return (
            <input
              type={type}
              value={value}
              onChange={e => onChange(e.target.value)}
              placeholder={placeholder}
              className="form-input"
            />
  )
}