import { useEffect, useState } from 'react'
import { ListTodo, AlertCircle, CheckCircle2, Clock, RefreshCw } from 'lucide-react'
import { apiClient, type ApiResponse, type TaskInstanceDto } from '@/lib/api'
import TaskDetailModal from '../../components/TaskDetailModal'

export default function MyTasksPage() {
  const [tasks, setTasks] = useState<TaskInstanceDto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedTask, setSelectedTask] = useState<TaskInstanceDto | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)

  const loadTasks = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await apiClient.get<ApiResponse<TaskInstanceDto[]>>('/tasks/my')
      setTasks(res.data.data ?? [])
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Failed to load tasks')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadTasks()
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle2 size={14} className="text-emerald-600" />
      case 'WAITING_FOR_APPROVAL':
        return <Clock size={14} className="text-amber-600" />
      case 'REJECTED':
        return <AlertCircle size={14} className="text-rose-600" />
      default:
        return <Clock size={14} className="text-blue-600" />
    }
  }

  const groupedTasks = {
    pending: tasks.filter((t) => t.status === 'PENDING'),
    inProgress: tasks.filter((t) => t.status === 'IN_PROGRESS'),
    waitingApproval: tasks.filter((t) => t.status === 'WAITING_FOR_APPROVAL'),
    completed: tasks.filter((t) => t.status === 'COMPLETED'),
    other: tasks.filter((t) => !['PENDING', 'IN_PROGRESS', 'WAITING_FOR_APPROVAL', 'COMPLETED'].includes(t.status)),
  }

  const TaskCard = ({ task }: { task: TaskInstanceDto }) => (
    <div
      onClick={() => {
        setSelectedTask(task)
        setShowDetailModal(true)
      }}
      className="rounded-lg border border-slate-200 bg-white p-4 hover:shadow-md transition cursor-pointer"
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <p className="font-semibold text-slate-900">{task.title}</p>
          <p className="text-xs text-slate-500">{task.taskCode}</p>
        </div>
        <div className="flex items-center gap-2">
          {getStatusIcon(task.status)}
          <span className="text-xs font-bold text-slate-600">{task.priority}</span>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between text-xs text-slate-600">
        <span>{task.taskTypeName}</span>
        <span>Due: {new Date(task.expectedCompletion).toLocaleDateString('vi-VN')}</span>
      </div>
      {task.isOverdue && (
        <div className="mt-2 rounded bg-rose-50 px-2 py-1 text-xs font-semibold text-rose-600">Overdue</div>
      )}
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">My Tasks</h2>
          <p className="text-sm text-slate-500">Your assigned tasks ({tasks.length} total)</p>
        </div>
        <button
          onClick={() => void loadTasks()}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 flex gap-2">
          <AlertCircle size={18} className="flex-shrink-0" />
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-12 text-slate-500">Loading your tasks...</div>
      ) : tasks.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-12 text-center">
          <ListTodo size={32} className="mx-auto mb-3 text-slate-300" />
          <p className="text-slate-600 font-medium">No tasks assigned yet</p>
          <p className="text-sm text-slate-500 mt-1">Your assigned tasks will appear here</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Pending */}
          {groupedTasks.pending.length > 0 && (
            <div>
              <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                <Clock size={18} className="text-slate-600" />
                Pending ({groupedTasks.pending.length})
              </h3>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                {groupedTasks.pending.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
            </div>
          )}

          {/* In Progress */}
          {groupedTasks.inProgress.length > 0 && (
            <div>
              <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                <Clock size={18} className="text-blue-600" />
                In Progress ({groupedTasks.inProgress.length})
              </h3>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                {groupedTasks.inProgress.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
            </div>
          )}

          {/* Waiting Approval */}
          {groupedTasks.waitingApproval.length > 0 && (
            <div>
              <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                <AlertCircle size={18} className="text-amber-600" />
                Waiting for Approval ({groupedTasks.waitingApproval.length})
              </h3>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                {groupedTasks.waitingApproval.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
            </div>
          )}

          {/* Completed */}
          {groupedTasks.completed.length > 0 && (
            <div>
              <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                <CheckCircle2 size={18} className="text-emerald-600" />
                Completed ({groupedTasks.completed.length})
              </h3>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                {groupedTasks.completed.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
            </div>
          )}

          {/* Other */}
          {groupedTasks.other.length > 0 && (
            <div>
              <h3 className="font-bold text-slate-900 mb-3">Other ({groupedTasks.other.length})</h3>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                {groupedTasks.other.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          onClose={() => {
            setShowDetailModal(false)
            void loadTasks()
          }}
        />
      )}
    </div>
  )
}
