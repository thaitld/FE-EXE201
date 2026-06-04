import { useEffect, useState } from 'react'
import {
  approveTask, cancelTask, cloneTask, deleteTask,
  listManagerTasks, rejectTask, reassignTask, exportTasks,
} from '../api'
import type { TaskInstanceDto } from '@/lib/api'
import {
  SlidersHorizontal, RefreshCw, AlertTriangle, ClipboardList,
  ChevronDown, ChevronLeft, ChevronRight, Plus, Download,
  CheckCircle2, Clock, XCircle, Copy, UserCheck, Trash2,
} from 'lucide-react'
import ManagerCreateTaskModal from '../components/ManagerCreateTaskModal'

const statusOptions = ['ALL', 'PENDING', 'IN_PROGRESS', 'WAITING_FOR_APPROVAL', 'COMPLETED']
const priorityOptions = ['ALL', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL']
const PAGE_SIZE = 10

const priorityConfig: Record<string, { label: string; dot: string; text: string; bg: string; border: string }> = {
  CRITICAL: { label: 'Critical', dot: '#ef4444', text: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
  HIGH: { label: 'High', dot: '#f97316', text: '#ea580c', bg: '#fff7ed', border: '#fed7aa' },
  MEDIUM: { label: 'Medium', dot: '#eab308', text: '#ca8a04', bg: '#fefce8', border: '#fef08a' },
  LOW: { label: 'Low', dot: '#94a3b8', text: '#64748b', bg: '#f8fafc', border: '#e2e8f0' },
}

const statusConfig: Record<string, { label: string; text: string; bg: string; border: string }> = {
  WAITING_FOR_APPROVAL: { label: 'Chờ duyệt', text: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe' },
  IN_PROGRESS: { label: 'Đang làm', text: '#0284c7', bg: '#f0f9ff', border: '#bae6fd' },
  COMPLETED: { label: 'Hoàn thành', text: '#059669', bg: '#ecfdf5', border: '#a7f3d0' },
  PENDING: { label: 'Chờ xử lý', text: '#64748b', bg: '#f8fafc', border: '#e2e8f0' },
  CANCELLED: { label: 'Đã huỷ', text: '#9ca3af', bg: '#f9fafb', border: '#e5e7eb' },
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
  const [exporting, setExporting] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)

  const handleExport = async () => {
    setExporting(true)
    try {
      await exportTasks({
        status: status === 'ALL' ? undefined : status,
        priority: priority === 'ALL' ? undefined : priority,
        teamId: teamId ? Number(teamId) : undefined,
      })
    } catch (err: any) {
      setError(err?.message ?? 'Export failed')
    } finally {
      setExporting(false)
    }
  }

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

  const applyFilters = () => { setPage(1); void load(1) }
  const goToPage = (next: number) => {
    if (next < 1 || next > totalPages) return
    setPage(next); void load(next)
  }

  const onApprove = async (id: number) => { await approveTask(id); await load() }
  const onReject = async (id: number) => { const r = window.prompt('Rejection reason'); if (!r) return; await rejectTask(id, r); await load() }
  const onCancel = async (id: number) => { await cancelTask(id); await load() }
  const onDelete = async (id: number) => { await deleteTask(id); await load() }
  const onClone = async (id: number) => { await cloneTask(id, {}); await load() }
  const onReassign = async (id: number) => { const u = window.prompt('New assigned user GUID'); if (!u) return; await reassignTask(id, { newAssignedUserId: u }); await load() }

  const overdue = tasks.filter(t => t.isOverdue).length
  const pending = tasks.filter(t => t.status === 'WAITING_FOR_APPROVAL').length
  const startItem = totalCount === 0 ? 0 : (page - 1) * PAGE_SIZE + 1
  const endItem = Math.min(page * PAGE_SIZE, totalCount)

  return (
    <div className="min-h-screen bg-gray-50/60 px-6 py-6">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700&display=swap');
        * { font-family: 'Geist', sans-serif; }

        .card {
          background: #fff;
          border: 1px solid #f0f0f0;
          border-radius: 16px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.04);
        }

        .filter-select {
          appearance: none;
          background: #f8f9fb;
          border: 1.5px solid #e8eaed;
          border-radius: 10px;
          padding: 7px 32px 7px 12px;
          font-size: 13px;
          font-weight: 500;
          color: #374151;
          outline: none;
          cursor: pointer;
          transition: border-color 0.15s;
          min-width: 130px;
        }
        .filter-select:focus { border-color: #3b82f6; background: #fff; }

        .filter-input {
          background: #f8f9fb;
          border: 1.5px solid #e8eaed;
          border-radius: 10px;
          padding: 7px 12px;
          font-size: 13px;
          color: #374151;
          outline: none;
          transition: border-color 0.15s;
          width: 150px;
        }
        .filter-input:focus { border-color: #3b82f6; background: #fff; }
        .filter-input::placeholder { color: #9ca3af; }

        .table-row {
          border-bottom: 1px solid #f5f5f5;
          transition: background 0.1s;
        }
        .table-row:last-child { border-bottom: none; }
        .table-row:hover { background: #f9fafb; }

        .stat-card {
          background: #fff;
          border: 1px solid #f0f0f0;
          border-radius: 14px;
          padding: 16px 20px;
          box-shadow: 0 1px 2px rgba(0,0,0,0.03);
        }

        .btn-primary {
          display: flex;
          align-items: center;
          gap: 6px;
          background: #2563eb;
          color: #fff;
          border: none;
          border-radius: 10px;
          padding: 8px 16px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.15s, transform 0.1s;
          box-shadow: 0 2px 8px rgba(37,99,235,0.2);
        }
        .btn-primary:hover { background: #1d4ed8; }
        .btn-primary:active { transform: scale(0.97); }

        .btn-secondary {
          display: flex;
          align-items: center;
          gap: 6px;
          background: #fff;
          color: #374151;
          border: 1.5px solid #e5e7eb;
          border-radius: 10px;
          padding: 7px 14px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: border-color 0.15s, background 0.15s;
        }
        .btn-secondary:hover { border-color: #d1d5db; background: #f9fafb; }
        .btn-secondary:disabled { opacity: 0.4; cursor: not-allowed; }

        .btn-apply {
          display: flex;
          align-items: center;
          gap: 5px;
          background: #eff6ff;
          color: #2563eb;
          border: 1.5px solid #bfdbfe;
          border-radius: 10px;
          padding: 7px 14px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.15s;
        }
        .btn-apply:hover { background: #dbeafe; }
        .btn-apply:disabled { opacity: 0.5; cursor: not-allowed; }

        .action-btn {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 4px 10px;
          border-radius: 8px;
          font-size: 11px;
          font-weight: 600;
          cursor: pointer;
          border: 1px solid;
          transition: all 0.12s;
        }
        .action-btn:active { transform: scale(0.95); }

        .page-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 32px;
          height: 32px;
          padding: 0 8px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 600;
          border: 1px solid #e5e7eb;
          background: #fff;
          color: #4b5563;
          cursor: pointer;
          transition: all 0.12s;
        }
        .page-btn:hover:not(:disabled) { border-color: #3b82f6; color: #2563eb; background: #eff6ff; }
        .page-btn.active { background: #2563eb; color: #fff; border-color: #2563eb; }
        .page-btn:disabled { opacity: 0.3; cursor: not-allowed; }
      `}</style>

      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-500 mb-1">Manager · Tasks</p>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Quản lý Tasks</h1>
          <p className="text-sm text-gray-400 mt-0.5">Theo dõi và xử lý toàn bộ nhiệm vụ · {totalCount} task</p>
        </div>
        <div className="flex items-center gap-2.5">
          <button className="btn-secondary" onClick={handleExport} disabled={exporting}>
            <Download size={13} />
            {exporting ? 'Đang xuất...' : 'Xuất Excel'}
          </button>
          <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
            <Plus size={14} /> Tạo Task
          </button>
        </div>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { label: 'Tổng tasks', value: totalCount, color: '#2563eb', bg: '#eff6ff' },
          { label: 'Chờ duyệt', value: pending, color: '#7c3aed', bg: '#f5f3ff' },
          { label: 'Quá hạn', value: overdue, color: '#dc2626', bg: '#fef2f2' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-2">{s.label}</p>
            <p className="text-3xl font-bold tracking-tight" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <div className="card px-5 py-4 mb-5">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-gray-400 mr-1">
            <SlidersHorizontal size={13} />
            <span className="text-xs font-semibold uppercase tracking-widest">Lọc</span>
          </div>

          {[
            { label: 'Status', value: status, set: setStatus, opts: statusOptions },
            { label: 'Priority', value: priority, set: setPriority, opts: priorityOptions },
          ].map(f => (
            <div key={f.label} className="relative">
              <select value={f.value} onChange={e => f.set(e.target.value)} className="filter-select">
                {f.opts.map(o => <option key={o}>{o}</option>)}
              </select>
              <ChevronDown size={11} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          ))}

          <input
            value={teamId}
            onChange={e => setTeamId(e.target.value)}
            placeholder="Team ID"
            className="filter-input"
          />

          <button className="btn-apply ml-auto" onClick={applyFilters} disabled={loading}>
            <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
            {loading ? 'Đang tải...' : 'Áp dụng'}
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-500 mb-5">
          <AlertTriangle size={13} className="shrink-0" /> {error}
        </div>
      )}

      {/* Table */}
      <div className="card overflow-hidden mb-5">
        {/* Table header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
          <div>
            <h3 className="text-sm font-semibold text-gray-800">Danh sách Task</h3>
            <p className="text-xs text-gray-400 mt-0.5">Theo bộ lọc hiện tại</p>
          </div>
          <span className="text-xs font-semibold text-gray-400 bg-gray-100 px-2.5 py-1 rounded-lg">
            {tasks.length} hàng
          </span>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <RefreshCw size={20} className="animate-spin mb-3 opacity-40" />
            <p className="text-sm">Đang tải tasks...</p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <ClipboardList size={28} className="mb-3 opacity-30" />
            <p className="text-sm font-medium">Không có task nào khớp bộ lọc</p>
            <p className="text-xs mt-1 opacity-60">Thử thay đổi bộ lọc hoặc tạo task mới</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/70">
                  {['Task', 'Assigned To', 'Status', 'Priority', 'Due Date', 'Actions'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-gray-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => {
                  const sc = statusConfig[task.status] ?? statusConfig.PENDING
                  const pc = priorityConfig[task.priority] ?? priorityConfig.LOW
                  return (
                    <tr key={task.id} className="table-row">
                      <td className="px-5 py-3.5">
                        <p className="text-sm font-semibold text-gray-900">{task.title}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{task.taskCode}</p>
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="text-sm font-medium text-gray-800">{task.assignedUserName}</p>
                        <p className="text-xs text-gray-400">{task.assignedUserDepartment ?? 'N/A'}</p>
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className="inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-semibold"
                          style={{ color: sc.text, background: sc.bg, border: `1px solid ${sc.border}` }}
                        >
                          {sc.label}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold"
                          style={{ color: pc.text, background: pc.bg, border: `1px solid ${pc.border}` }}
                        >
                          <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: pc.dot }} />
                          {pc.label}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="text-sm text-gray-700">{new Date(task.expectedCompletion).toLocaleDateString('vi-VN')}</p>
                        {task.isOverdue && (
                          <p className="text-[10px] font-semibold text-red-500 mt-0.5 flex items-center gap-1">
                            <span className="w-1 h-1 rounded-full bg-red-500 inline-block" />
                            Overdue
                          </p>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {task.status === 'WAITING_FOR_APPROVAL' && (
                            <>
                              <button
                                className="action-btn"
                                style={{ color: '#059669', background: '#ecfdf5', borderColor: '#a7f3d0' }}
                                onClick={() => void onApprove(task.id)}
                              >
                                <CheckCircle2 size={10} /> Duyệt
                              </button>
                              <button
                                className="action-btn"
                                style={{ color: '#dc2626', background: '#fef2f2', borderColor: '#fecaca' }}
                                onClick={() => void onReject(task.id)}
                              >
                                <XCircle size={10} /> Từ chối
                              </button>
                            </>
                          )}
                          <button
                            className="action-btn"
                            style={{ color: '#374151', background: '#f9fafb', borderColor: '#e5e7eb' }}
                            onClick={() => void onReassign(task.id)}
                          >
                            <UserCheck size={10} /> Giao lại
                          </button>
                          <button
                            className="action-btn"
                            style={{ color: '#374151', background: '#f9fafb', borderColor: '#e5e7eb' }}
                            onClick={() => void onClone(task.id)}
                          >
                            <Copy size={10} /> Clone
                          </button>
                          <button
                            className="action-btn"
                            style={{ color: '#374151', background: '#f9fafb', borderColor: '#e5e7eb' }}
                            onClick={() => void onCancel(task.id)}
                          >
                            <Clock size={10} /> Huỷ
                          </button>
                          <button
                            className="action-btn"
                            style={{ color: '#dc2626', background: '#fff', borderColor: '#fecaca' }}
                            onClick={() => void onDelete(task.id)}
                          >
                            <Trash2 size={10} /> Xoá
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalCount > 0 && (
        <div className="card flex flex-wrap items-center justify-between gap-3 px-5 py-3.5">
          <p className="text-xs text-gray-400">
            Hiển thị <span className="font-semibold text-gray-700">{startItem}–{endItem}</span> / <span className="font-semibold text-gray-700">{totalCount}</span> tasks
          </p>
          <div className="flex items-center gap-1.5">
            <button className="page-btn" onClick={() => goToPage(page - 1)} disabled={page === 1}>
              <ChevronLeft size={13} />
            </button>
            {buildPageRange(page, totalPages).map((item, i) =>
              item === '...' ? (
                <span key={`e-${i}`} className="px-1 text-xs text-gray-400">…</span>
              ) : (
                <button
                  key={item}
                  className={`page-btn ${item === page ? 'active' : ''}`}
                  onClick={() => goToPage(item as number)}
                >
                  {item}
                </button>
              )
            )}
            <button className="page-btn" onClick={() => goToPage(page + 1)} disabled={page === totalPages}>
              <ChevronRight size={13} />
            </button>
          </div>
        </div>
      )}

      {showCreateModal && (
        <ManagerCreateTaskModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => void load()}
        />
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