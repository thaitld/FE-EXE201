import { useEffect, useState } from 'react'
import { X, AlertCircle } from 'lucide-react'
import { createTask, listTeams, getTeamPerformance, listTaskTypes } from '../api'
import type { CreateTaskInstanceDto } from '@/lib/api'

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

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    setError(null)
    if (!form.title.trim()) return setError('Title is required')
    if (!form.assignedUserId) return setError('Assignee id or email is required')
    if (!form.expectedCompletion) return setError('Due date is required')

    setIsSaving(true)
    try {
      await createTask(form)
      onSuccess()
      onClose()
    } catch (err: any) {
      setError(err?.message ?? 'Failed to create task')
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-bold text-slate-900">Create Task (Manager)</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          {error && (
            <div className="flex gap-3 rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
              <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
              <label className="form-label">Assignee</label>
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
      </div>
    </div>
  )
}
