import { useEffect, useState } from 'react'
import { Users, AlertCircle, FileText } from 'lucide-react'
import { apiClient, type ApiResponse, type TaskInstanceDto, type TeamDetailDto } from '@/lib/api'
import TaskDetailModal from '../../components/TaskDetailModal'

export default function TeamTasksPage() {
  const [teams, setTeams] = useState<TeamDetailDto[]>([])
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null)
  const [teamTasks, setTeamTasks] = useState<TaskInstanceDto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedTask, setSelectedTask] = useState<TaskInstanceDto | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)

  // Load teams
  useEffect(() => {
    const loadTeams = async () => {
      try {
        const res = await apiClient.get<ApiResponse<TeamDetailDto[]>>('/teams')
        const items = res.data.data ?? []
        setTeams(items)
        if (items.length > 0) {
          setSelectedTeamId(items[0].id)
        }
      } catch (err: any) {
        setError(err.response?.data?.message ?? 'Failed to load teams')
      } finally {
        setIsLoading(false)
      }
    }
    void loadTeams()
  }, [])

  // Load team tasks
  useEffect(() => {
    if (!selectedTeamId) return

    const loadTeamTasks = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const res = await apiClient.get<ApiResponse<TaskInstanceDto[]>>(`/tasks/team/${selectedTeamId}`)
        setTeamTasks(res.data.data ?? [])
      } catch (err: any) {
        setError(err.response?.data?.message ?? 'Failed to load team tasks')
      } finally {
        setIsLoading(false)
      }
    }
    void loadTeamTasks()
  }, [selectedTeamId])

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: 'bg-slate-100 text-slate-700',
      IN_PROGRESS: 'bg-blue-100 text-blue-700',
      PAUSED: 'bg-yellow-100 text-yellow-700',
      COMPLETED: 'bg-emerald-100 text-emerald-700',
      CANCELLED: 'bg-rose-100 text-rose-700',
      WAITING_FOR_APPROVAL: 'bg-amber-100 text-amber-700',
      REJECTED: 'bg-rose-100 text-rose-700',
    }
    return colors[status] || 'bg-slate-100 text-slate-700'
  }

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      LOW: 'text-blue-600',
      MEDIUM: 'text-slate-600',
      HIGH: 'text-amber-600',
      CRITICAL: 'text-rose-600',
    }
    return colors[priority] || 'text-slate-600'
  }

  const selectedTeam = teams.find((t) => t.id === selectedTeamId)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Team Tasks</h2>
        <p className="text-sm text-slate-500">Monitor your team's task progress</p>
      </div>

      {error && !isLoading && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 flex gap-2">
          <AlertCircle size={18} className="flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Team Selection */}
      <div className="rounded-lg border border-slate-200 bg-white p-5">
        <label className="block text-sm font-semibold text-slate-700 mb-3">Select Team</label>
        <select
          value={selectedTeamId ?? ''}
          onChange={(e) => setSelectedTeamId(Number(e.target.value))}
          className="w-full md:w-80 rounded-lg border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Choose a team...</option>
          {teams.map((team) => (
            <option key={team.id} value={team.id}>
              {team.name} ({team.memberCount} members)
            </option>
          ))}
        </select>
      </div>

      {/* Team Info */}
      {selectedTeam && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-blue-900">{selectedTeam.name}</h3>
              <p className="text-sm text-blue-700 mt-1">
                {selectedTeam.teamLeadName && `Led by ${selectedTeam.teamLeadName}`}
                {selectedTeam.memberCount && ` • ${selectedTeam.memberCount} members`}
              </p>
            </div>
            <Users size={24} className="text-blue-600" />
          </div>
        </div>
      )}

      {/* Tasks Table */}
      <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-slate-500">Loading team tasks...</div>
        ) : !selectedTeamId ? (
          <div className="p-12 text-center">
            <FileText size={32} className="mx-auto mb-3 text-slate-300" />
            <p className="text-slate-500">Select a team to view tasks</p>
          </div>
        ) : teamTasks.length === 0 ? (
          <div className="p-12 text-center">
            <FileText size={32} className="mx-auto mb-3 text-slate-300" />
            <p className="text-slate-500">No tasks for this team</p>
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
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Efficiency</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {teamTasks.map((task) => (
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
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(task.status)}`}>
                      {task.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-bold ${getPriorityColor(task.priority)}`}>{task.priority}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-sm text-slate-900">{new Date(task.expectedCompletion).toLocaleDateString('vi-VN')}</p>
                      {task.isOverdue && <p className="text-xs text-rose-600 font-semibold">Overdue</p>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {task.efficiencyRatio !== null ? (
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{(task.efficiencyRatio * 100).toFixed(1)}%</p>
                        {task.actualMinutes && <p className="text-xs text-slate-500">{task.actualMinutes}m</p>}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500">-</p>
                    )}
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

      {/* Summary Stats */}
      {teamTasks.length > 0 && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-xs font-semibold uppercase text-slate-600">Total Tasks</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{teamTasks.length}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-xs font-semibold uppercase text-slate-600">Completed</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">{teamTasks.filter((t) => t.status === 'COMPLETED').length}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-xs font-semibold uppercase text-slate-600">In Progress</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">
              {teamTasks.filter((t) => t.status === 'IN_PROGRESS' || t.status === 'PENDING').length}
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-xs font-semibold uppercase text-slate-600">Overdue</p>
            <p className="text-2xl font-bold text-rose-600 mt-1">{teamTasks.filter((t) => t.isOverdue).length}</p>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          onClose={() => {
            setShowDetailModal(false)
          }}
        />
      )}
    </div>
  )
}
