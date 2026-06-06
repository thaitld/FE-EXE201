import { useEffect, useState } from 'react'
import { FileText, Filter, Plus, RefreshCw, AlertCircle, CheckCircle2, Clock, XCircle } from 'lucide-react'
import { apiClient, type ApiResponse, type TaskInstanceDto, type PagedResult, type TaskInstanceFilter } from '@/lib/api'
import { CreateTaskModal } from './CreateTaskModal'
import TaskDetailModal from '@/components/TaskDetailModal'

export default function TaskListPage() {
  const [tasks, setTasks] = useState<TaskInstanceDto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filters
  const [filters, setFilters] = useState<TaskInstanceFilter>({
    page: 1,
    pageSize: 20,
    sortBy: 'expectedCompletion',
    sortDir: 'asc',
  })
  const [totalPages, setTotalPages] = useState(0)
  const [totalCount, setTotalCount] = useState(0)

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedTask, setSelectedTask] = useState<TaskInstanceDto | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)

  // Load tasks
  useEffect(() => {
    const load = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const params = new URLSearchParams()
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            params.append(key, String(value))
          }
        })
        const res = await apiClient.get<ApiResponse<PagedResult<TaskInstanceDto>>>('/tasks', { params })
        if (res.data.data) {
          setTasks(res.data.data.items)
          setTotalPages(res.data.data.totalPages)
          setTotalCount(res.data.data.totalCount)
        }
      } catch (err: any) {
        setError(err.response?.data?.message ?? 'Failed to load tasks')
      } finally {
        setIsLoading(false)
      }
    }
    void load()
  }, [filters])

  const statusOptions = ['PENDING', 'IN_PROGRESS', 'PAUSED', 'COMPLETED', 'CANCELLED', 'WAITING_FOR_APPROVAL', 'REJECTED']
  const priorityOptions = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']

  const getStatusBadge = (status: string) => {
    const styles: Record<string, { bg: string; text: string; icon: any }> = {
      PENDING: { bg: 'bg-slate-100', text: 'text-slate-700', icon: Clock },
      IN_PROGRESS: { bg: 'bg-blue-100', text: 'text-blue-700', icon: Clock },
      PAUSED: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: AlertCircle },
      COMPLETED: { bg: 'bg-emerald-100', text: 'text-emerald-700', icon: CheckCircle2 },
      CANCELLED: { bg: 'bg-rose-100', text: 'text-rose-700', icon: XCircle },
      WAITING_FOR_APPROVAL: { bg: 'bg-amber-100', text: 'text-amber-700', icon: Clock },
      REJECTED: { bg: 'bg-rose-100', text: 'text-rose-700', icon: XCircle },
    }
    const style = styles[status] || styles.PENDING
    const Icon = style.icon
    return (
      <div className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${style.bg} ${style.text}`}>
        <Icon size={12} />
        {status}
      </div>
    )
  }

  const getPriorityBadge = (priority: string) => {
    const styles: Record<string, string> = {
      LOW: 'bg-blue-100 text-blue-700',
      MEDIUM: 'bg-slate-100 text-slate-700',
      HIGH: 'bg-amber-100 text-amber-700',
      CRITICAL: 'bg-rose-100 text-rose-700',
    }
    return (
      <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${styles[priority] || styles.MEDIUM}`}>
        {priority}
      </span>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Tasks</h2>
          <p className="text-sm text-slate-500">Manage and track all tasks ({totalCount} total)</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 font-semibold text-white transition hover:bg-blue-700"
        >
          <Plus size={18} />
          New Task
        </button>
      </div>

      {/* Filters */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Filter size={18} className="text-slate-600" />
          <h3 className="font-semibold text-slate-900">Filters</h3>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {/* Status Filter */}
          <label className="space-y-1.5">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-600">Status</span>
            <select
              value={filters.status ?? ''}
              onChange={(e) => setFilters({ ...filters, status: e.target.value || undefined, page: 1 })}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none"
            >
              <option value="">All Status</option>
              {statusOptions.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>

          {/* Priority Filter */}
          <label className="space-y-1.5">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-600">Priority</span>
            <select
              value={filters.priority ?? ''}
              onChange={(e) => setFilters({ ...filters, priority: e.target.value || undefined, page: 1 })}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none"
            >
              <option value="">All Priorities</option>
              {priorityOptions.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </label>

          {/* Overdue Filter */}
          <label className="space-y-1.5">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-600">Overdue</span>
            <select
              value={filters.isOverdue !== undefined ? (filters.isOverdue ? 'true' : 'false') : ''}
              onChange={(e) => setFilters({ ...filters, isOverdue: e.target.value === 'true' ? true : e.target.value === 'false' ? false : undefined, page: 1 })}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none"
            >
              <option value="">All</option>
              <option value="true">Overdue Only</option>
              <option value="false">Not Overdue</option>
            </select>
          </label>

          {/* Sort */}
          <label className="space-y-1.5">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-600">Sort By</span>
            <select
              value={filters.sortBy ?? 'expectedCompletion'}
              onChange={(e) => setFilters({ ...filters, sortBy: e.target.value, page: 1 })}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none"
            >
              <option value="expectedCompletion">Due Date</option>
              <option value="priority">Priority</option>
              <option value="status">Status</option>
              <option value="createdAt">Created Date</option>
            </select>
          </label>
        </div>
        <div className="mt-4 flex items-center gap-2">
          <button
            onClick={() => setFilters({ page: 1, pageSize: 20, sortBy: 'expectedCompletion', sortDir: 'asc' })}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700"
          >
            Clear Filters
          </button>
          <button
            onClick={() => setFilters({ ...filters, page: 1 })}
            className="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            <RefreshCw size={14} />
            Refresh
          </button>
        </div>
      </div>

      {/* Error */}
      {error && <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div>}

      {/* Task Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-slate-500">Loading tasks...</div>
        ) : tasks.length === 0 ? (
          <div className="p-12 text-center">
            <FileText size={32} className="mx-auto mb-3 text-slate-300" />
            <p className="text-slate-500">No tasks found</p>
          </div>
        ) : (
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
                <tr key={task.id} className="hover:bg-slate-50 transition">
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
                  <td className="px-4 py-3">{getStatusBadge(task.status)}</td>
                  <td className="px-4 py-3">{getPriorityBadge(task.priority)}</td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-sm text-slate-900">{new Date(task.expectedCompletion).toLocaleDateString('vi-VN')}</p>
                      {task.isOverdue && <p className="text-xs text-rose-600 font-semibold">Overdue</p>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => {
                        setSelectedTask(task)
                        setShowDetailModal(true)
                      }}
                      className="text-sm font-semibold text-blue-600 hover:text-blue-700"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setFilters({ ...filters, page: Math.max(1, (filters.page ?? 1) - 1) })}
            disabled={!filters.page || filters.page <= 1}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            Previous
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setFilters({ ...filters, page })}
              className={`rounded-lg px-3 py-2 text-sm font-semibold ${
                page === filters.page ? 'bg-blue-600 text-white' : 'border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => setFilters({ ...filters, page: Math.min(totalPages, (filters.page ?? 1) + 1) })}
            disabled={!filters.page || filters.page >= totalPages}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {/* Modals */}
      {showCreateModal && <CreateTaskModal onClose={() => setShowCreateModal(false)} onCreated={() => setFilters({ ...filters, page: 1 })} />}
      {showDetailModal && selectedTask && <TaskDetailModal task={selectedTask} onClose={() => setShowDetailModal(false)} />}
    </div>
  )
}
