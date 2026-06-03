import { useEffect, useState } from 'react'
import {
  approveTask, cancelTask, cloneTask, deleteTask,
  listManagerTasks, rejectTask, reassignTask,
} from '../api'
import type { TaskInstanceDto } from '@/lib/api'
import { SlidersHorizontal, RefreshCw, AlertTriangle, ClipboardList, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'

const statusOptions = ['ALL', 'PENDING', 'IN_PROGRESS', 'WAITING_FOR_APPROVAL', 'COMPLETED']
const priorityOptions = ['ALL', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL']
const PAGE_SIZE = 10

const priorityStyle: Record<string, string> = {
  CRITICAL: 'bg-rose-500/15 text-rose-400 border-rose-500/20',
  HIGH:     'bg-orange-400/12 text-orange-400 border-orange-400/20',
  MEDIUM:   'bg-amber-400/12 text-amber-400 border-amber-400/20',
  LOW:      'bg-slate-400/10 text-slate-400 border-slate-400/15',
}

const statusStyle: Record<string, string> = {
  WAITING_FOR_APPROVAL: 'bg-violet-400/12 text-violet-400 border-violet-400/20',
  IN_PROGRESS:          'bg-cyan-400/12 text-cyan-400 border-cyan-400/20',
  COMPLETED:            'bg-emerald-400/12 text-emerald-400 border-emerald-400/20',
  PENDING:              'bg-slate-400/10 text-slate-400 border-slate-400/15',
  CANCELLED:            'bg-slate-600/10 text-slate-600 border-slate-600/15',
}

export default function TaskManagementPage() {
  const [tasks, setTasks] = useState<TaskInstanceDto[]>([])
  const [status, setStatus] = useState('ALL')
  const [priority, setPriority] = useState('ALL')
  const [teamId, setTeamId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))

  const load = async (targetPage = page) => {
    setLoading(true); setError(null)
    try {
      const result = await listManagerTasks({
        status: status === 'ALL' ? undefined : status,
        priority: priority === 'ALL' ? undefined : priority,
        teamId: teamId ? Number(teamId) : undefined,
        page: targetPage,
        pageSize: PAGE_SIZE,
        sortBy: 'expectedCompletion',
        sortDir: 'asc',
      })
      setTasks(result?.items ?? [])
      const total = (result as any)?.totalCount ?? (result?.items?.length ?? 0)
      setTotalCount(total)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tasks')
    } finally { setLoading(false) }
  }

  useEffect(() => { void load(1) }, [])

  const applyFilters = () => {
    setPage(1)
    void load(1)
  }

  const goToPage = (next: number) => {
    if (next < 1 || next > totalPages) return
    setPage(next)
    void load(next)
  }

  const onApprove  = async (id: number) => { await approveTask(id); await load() }
  const onReject   = async (id: number) => { const r = window.prompt('Rejection reason'); if (!r) return; await rejectTask(id, r); await load() }
  const onCancel   = async (id: number) => { await cancelTask(id); await load() }
  const onDelete   = async (id: number) => { await deleteTask(id); await load() }
  const onClone    = async (id: number) => { await cloneTask(id, {}); await load() }
  const onReassign = async (id: number) => { const u = window.prompt('New assigned user GUID'); if (!u) return; await reassignTask(id, { newAssignedUserId: u }); await load() }

  const overdue = tasks.filter(t => t.isOverdue).length
  const pending = tasks.filter(t => t.status === 'WAITING_FOR_APPROVAL').length
  const startItem = totalCount === 0 ? 0 : (page - 1) * PAGE_SIZE + 1
  const endItem = Math.min(page * PAGE_SIZE, totalCount)

  return (
    <div className="space-y-5">
      {/* Page header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-slate-500">Manager / Tasks</p>
          <h2 className="mt-1 text-2xl font-bold text-slate-900">Tasks</h2>
          <p className="text-sm text-slate-500">Manage and track all tasks ({totalCount} total)</p>
        </div>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Tổng tasks', value: totalCount, color: 'text-blue-800' },
          { label: 'Chờ duyệt',  value: pending,    color: 'text-violet-600' },
          { label: 'Quá hạn',    value: overdue,    color: 'text-rose-700'   },
        ].map(s => (
          <div key={s.label} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <p className="text-[10px] uppercase tracking-widest text-slate-500">{s.label}</p>
            <p className={`mt-1 text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-end gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
        <div className="mr-1 flex items-center gap-2 text-slate-500">
          <SlidersHorizontal size={14} />
          <span className="text-xs font-semibold uppercase tracking-widest">Lọc</span>
        </div>

        {[
          { label: 'Status',   value: status,   set: setStatus,   opts: statusOptions   },
          { label: 'Priority', value: priority, set: setPriority, opts: priorityOptions },
        ].map(f => (
          <div key={f.label} className="relative">
              <select
                value={f.value}
                onChange={e => f.set(e.target.value)}
                className="form-select"
              >
              {f.opts.map(o => <option key={o} className="bg-white text-slate-900">{o}</option>)}
            </select>
            <ChevronDown size={12} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
          </div>
        ))}

        <input
          value={teamId}
          onChange={e => setTeamId(e.target.value)}
          placeholder="Team ID (tuỳ chọn)"
            className="form-input"
          />

        <button
          type="button"
          onClick={applyFilters}
          disabled={loading}
            className="ml-auto form-cta"
          >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          {loading ? 'Đang tải...' : 'Áp dụng'}
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
          <AlertTriangle size={15} className="shrink-0" />{error}
        </div>
      )}

      {/* Task table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-700">Task Table</h3>
              <p className="text-xs text-slate-500">Danh sách task theo bộ lọc hiện tại</p>
            </div>
            <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
              {tasks.length} rows
            </span>
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading tasks...</div>
        ) : tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 text-slate-400">
            <ClipboardList size={28} className="mb-3 opacity-40" />
            <p className="text-sm">Không có task nào khớp bộ lọc.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Task</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Assigned To</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Priority</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Due Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {tasks.map((task) => (
                  <tr key={task.id} className="transition hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-semibold text-slate-900">{task.title}</p>
                        <p className="text-xs text-slate-500">{task.taskCode}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-slate-900">{task.assignedUserName}</p>
                        <p className="text-xs text-slate-500">{task.assignedUserDepartment ?? 'N/A'}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest ${statusStyle[task.status] ?? statusStyle.PENDING}`}>
                        {task.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest ${priorityStyle[task.priority] ?? priorityStyle.LOW}`}>
                        {task.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm text-slate-900">{new Date(task.expectedCompletion).toLocaleDateString('vi-VN')}</p>
                        {task.isOverdue && <p className="text-xs font-semibold text-rose-600">Overdue</p>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {task.status === 'WAITING_FOR_APPROVAL' && (
                          <>
                            <ActionBtn onClick={() => void onApprove(task.id)} variant="success">Duyệt</ActionBtn>
                            <ActionBtn onClick={() => void onReject(task.id)} variant="danger">Từ chối</ActionBtn>
                          </>
                        )}
                        <ActionBtn onClick={() => void onReassign(task.id)} variant="ghost">Giao lại</ActionBtn>
                        <ActionBtn onClick={() => void onClone(task.id)} variant="ghost">Clone</ActionBtn>
                        <ActionBtn onClick={() => void onCancel(task.id)} variant="ghost">Huỷ</ActionBtn>
                        <ActionBtn onClick={() => void onDelete(task.id)} variant="danger-ghost">Xoá</ActionBtn>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalCount > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-3 shadow-sm">
          <p className="text-xs text-slate-500">
            Hiển thị <span className="font-semibold text-slate-700">{startItem}–{endItem}</span> trong tổng{' '}
            <span className="font-semibold text-slate-700">{totalCount}</span> tasks
          </p>

          <div className="flex items-center gap-1.5">
            <PageBtn onClick={() => goToPage(page - 1)} disabled={page === 1}>
              <ChevronLeft size={14} />
            </PageBtn>

            {buildPageRange(page, totalPages).map((item, i) =>
              item === '...' ? (
                <span key={`ellipsis-${i}`} className="px-1 text-xs text-slate-400">…</span>
              ) : (
                <PageBtn
                  key={item}
                  onClick={() => goToPage(item as number)}
                  active={item === page}
                  disabled={false}
                >
                  {item}
                </PageBtn>
              )
            )}

            <PageBtn onClick={() => goToPage(page + 1)} disabled={page === totalPages}>
              <ChevronRight size={14} />
            </PageBtn>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildPageRange(current: number, total: number): (number | '...')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const result: (number | '...')[] = []
  const add = (p: number) => { if (!result.includes(p)) result.push(p) }
  const ellipsis = () => { if (result[result.length - 1] !== '...') result.push('...') }

  add(1)
  if (current > 3) ellipsis()
  for (let p = Math.max(2, current - 1); p <= Math.min(total - 1, current + 1); p++) add(p)
  if (current < total - 2) ellipsis()
  add(total)

  return result
}

function PageBtn({
  children, onClick, disabled, active = false,
}: {
  children: React.ReactNode
  onClick: () => void
  disabled: boolean
  active?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex h-8 min-w-[2rem] items-center justify-center rounded-lg border px-2 text-xs font-semibold transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-30
        ${active
          ? 'border-cyan-200 bg-cyan-50 text-cyan-700'
          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
        }`}
    >
      {children}
    </button>
  )
}

function ActionBtn({
  children, onClick, variant,
}: {
  children: React.ReactNode
  onClick: () => void
  variant: 'success' | 'danger' | 'ghost' | 'danger-ghost'
}) {
  const cls: Record<string, string> = {
    success:       'bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100',
    danger:        'bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100',
    ghost:         'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50',
    'danger-ghost':'border border-rose-200 bg-white text-rose-600 hover:bg-rose-50',
  }
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition active:scale-95 ${cls[variant]}`}
    >
      {children}
    </button>
  )
}