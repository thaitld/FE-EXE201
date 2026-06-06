import { useState, useEffect } from 'react'
import { AlertCircle, X, Send, CheckCircle2, XCircle, Clock } from 'lucide-react'
import { apiClient, type ApiResponse, type TaskInstanceDto, type UpdateTaskStatusDto, type TaskCommentDto } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'

interface TaskDetailModalProps {
  task: TaskInstanceDto
  onClose: () => void
}

export default function TaskDetailModal({ task: initialTask, onClose }: TaskDetailModalProps) {
  const { user, refreshUser } = useAuth()
  const [task, setTask] = useState<TaskInstanceDto>(initialTask)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Ensure user profile is loaded (with roleName)
  useEffect(() => {
    if (!user?.roleName) {
      void refreshUser()
    }
  }, [user?.roleName, refreshUser])

  // Status update
  const [showStatusUpdate, setShowStatusUpdate] = useState(false)
  const [statusUpdate, setStatusUpdate] = useState<UpdateTaskStatusDto>({
    status: 'COMPLETED',
    submissionNote: '',
    deliverableUrl: '',
    rejectionReason: '',
  })

  // Get valid transitions based on current status
  const getValidTransitions = (currentStatus: string): string[] => {
    const transitions: Record<string, string[]> = {
      PENDING: ['WAITING_FOR_APPROVAL', 'CANCELLED'],
      IN_PROGRESS: ['WAITING_FOR_APPROVAL', 'CANCELLED'],
      PAUSED: ['WAITING_FOR_APPROVAL', 'CANCELLED'],
      WAITING_FOR_APPROVAL: ['COMPLETED', 'REJECTED'],
      COMPLETED: [],
      CANCELLED: [],
      REJECTED: [],
    }
    return transitions[currentStatus] || []
  }

  // Comments
  const [comments, setComments] = useState<TaskCommentDto[]>([])
  const [commentsLoading, setCommentsLoading] = useState(true)
  const [newComment, setNewComment] = useState('')
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)

  // Load comments
  useEffect(() => {
    const loadComments = async () => {
      try {
        const res = await apiClient.get<ApiResponse<TaskCommentDto[]>>(`/tasks/${task.id}/comments`)
        setComments(res.data.data ?? [])
      } catch (err) {
        console.error('Failed to load comments:', err)
      } finally {
        setCommentsLoading(false)
      }
    }
    void loadComments()
  }, [task.id])

  const handleStatusUpdate = async () => {
    if (!statusUpdate.status) return

    setIsLoading(true)
    setError(null)
    try {
      const res = await apiClient.patch<ApiResponse<TaskInstanceDto>>(`/tasks/${task.id}/status`, statusUpdate)
      if (res.data.data) {
        setTask(res.data.data)
        setShowStatusUpdate(false)
        // Reset form
        setStatusUpdate({
          status: 'COMPLETED',
          submissionNote: '',
          deliverableUrl: '',
          rejectionReason: '',
        })
      } else {
        setError(res.data.message ?? 'Failed to update status')
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message ?? err.message ?? 'Failed to update status'
      setError(errorMsg)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddComment = async () => {
    if (!newComment.trim()) return

    setIsSubmittingComment(true)
    try {
      const res = await apiClient.post<ApiResponse<TaskCommentDto>>(`/tasks/${task.id}/comments`, { content: newComment })
      if (res.data.data) {
        setComments([...comments, res.data.data])
        setNewComment('')
      }
    } catch (err: any) {
      console.error('Failed to add comment:', err)
    } finally {
      setIsSubmittingComment(false)
    }
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: 'text-slate-600',
      IN_PROGRESS: 'text-blue-600',
      PAUSED: 'text-yellow-600',
      COMPLETED: 'text-emerald-600',
      CANCELLED: 'text-rose-600',
      WAITING_FOR_APPROVAL: 'text-amber-600',
      REJECTED: 'text-rose-600',
    }
    return colors[status] || 'text-slate-600'
  }

  // Check if user can update task status
  // Staff: only if assigned to them
  // Manager/Admin: all tasks
  const canUpdateStatus =
    user?.roleName?.toUpperCase() === 'ADMIN' ||
    user?.roleName?.toUpperCase() === 'MANAGER' ||
    task.assignedUserId === user?.id

  const getUpdatePermissionText = (): string => {
    if (task.status === 'WAITING_FOR_APPROVAL') {
      return 'Only managers and admins can approve or reject.'
    }
    if (task.status === 'COMPLETED' || task.status === 'CANCELLED' || task.status === 'REJECTED') {
      return 'This task cannot be updated.'
    }
    return 'Submit your work for manager approval.'
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 overflow-y-auto">
      <div className="relative my-8 w-full max-w-4xl rounded-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">{task.title}</h2>
            <p className="text-sm text-slate-500">{task.taskCode}</p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-3">
          {/* Main Info */}
          <div className="md:col-span-2 space-y-6">
            {error && (
              <div className="flex gap-3 rounded-lg border border-rose-300 bg-rose-50 p-4">
                <AlertCircle size={20} className="flex-shrink-0 mt-0.5 text-rose-600" />
                <div className="flex-1">
                  <p className="font-semibold text-rose-900">Update Failed</p>
                  <p className="text-sm text-rose-700 mt-1">{error}</p>
                </div>
                <button
                  onClick={() => setError(null)}
                  className="text-rose-600 hover:text-rose-700 font-bold"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Task Details */}
            <div className="rounded-lg border border-slate-200 p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-600">Status</p>
                  <p className={`text-sm font-bold mt-1 ${getStatusColor(task.status)}`}>{task.status}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-600">Priority</p>
                  <p className="text-sm font-bold mt-1 text-slate-900">{task.priority}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-600">Task Type</p>
                  <p className="text-sm font-bold mt-1 text-slate-900">{task.taskTypeName}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-600">Assigned To</p>
                  <p className="text-sm font-bold mt-1 text-slate-900">{task.assignedUserName}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-600">Due Date</p>
                  <p className="text-sm font-bold mt-1 text-slate-900">
                    {new Date(task.expectedCompletion).toLocaleDateString('vi-VN')}
                  </p>
                  {task.isOverdue && <p className="text-xs text-rose-600 font-semibold">Overdue</p>}
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-600">Planned Qty</p>
                  <p className="text-sm font-bold mt-1 text-slate-900">{task.plannedQuantity}</p>
                </div>

                {task.actualMinutes && (
                  <div>
                    <p className="text-xs font-semibold uppercase text-slate-600">Actual Minutes</p>
                    <p className="text-sm font-bold mt-1 text-slate-900">{task.actualMinutes}</p>
                  </div>
                )}

                {task.efficiencyRatio !== null && (
                  <div>
                    <p className="text-xs font-semibold uppercase text-slate-600">Efficiency</p>
                    <p className="text-sm font-bold mt-1 text-slate-900">{(task.efficiencyRatio * 100).toFixed(1)}%</p>
                  </div>
                )}

                {task.submissionNote && (
                  <div className="col-span-2">
                    <p className="text-xs font-semibold uppercase text-slate-600">Submission Note</p>
                    <p className="text-sm mt-1 text-slate-700">{task.submissionNote}</p>
                  </div>
                )}

                {task.deliverableUrl && (
                  <div className="col-span-2">
                    <p className="text-xs font-semibold uppercase text-slate-600">Deliverable</p>
                    <a href={task.deliverableUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline mt-1">
                      {task.deliverableUrl}
                    </a>
                  </div>
                )}

                {task.rejectionReason && (
                  <div className="col-span-2">
                    <p className="text-xs font-semibold uppercase text-slate-600">Rejection Reason</p>
                    <p className="text-sm mt-1 text-rose-700">{task.rejectionReason}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Status Update Section */}
            {canUpdateStatus && !showStatusUpdate && getValidTransitions(task.status).length > 0 && (
              <div className="space-y-2">
                <button
                  onClick={() => setShowStatusUpdate(true)}
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"
                >
                  Update Status
                </button>
                <p className="text-xs text-slate-600">{getUpdatePermissionText()}</p>
              </div>
            )}

            {!canUpdateStatus && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
                <p className="font-semibold mb-1">No Permission</p>
                <p>Only the task assignee, managers, and admins can update this task.</p>
              </div>
            )}

            {canUpdateStatus && getValidTransitions(task.status).length === 0 && (
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
                <p className="font-semibold mb-1">Status Cannot Change</p>
                <p>This task is in <span className="font-semibold">{task.status}</span> status and cannot be updated.</p>
              </div>
            )}

            {showStatusUpdate && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 space-y-3">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">New Status</label>
                  {getValidTransitions(task.status).length === 0 ? (
                    <div className="rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-600">
                      No valid transitions for <span className="font-semibold">{task.status}</span> status.
                      <br />
                      <span className="text-xs text-slate-500 mt-1 block">This task cannot be updated.</span>
                    </div>
                  ) : (
                    <>
                      <select
                        value={statusUpdate.status}
                        onChange={(e) => {
                          const newStatus = e.target.value as any
                          setStatusUpdate({
                            status: newStatus,
                            submissionNote: newStatus === 'WAITING_FOR_APPROVAL' ? statusUpdate.submissionNote : '',
                            deliverableUrl: newStatus === 'WAITING_FOR_APPROVAL' ? statusUpdate.deliverableUrl : '',
                            rejectionReason: newStatus === 'REJECTED' ? statusUpdate.rejectionReason : '',
                          })
                        }}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {getValidTransitions(task.status).map((status) => {
                          const labels: Record<string, string> = {
                            WAITING_FOR_APPROVAL: '✓ Submit for Approval',
                            COMPLETED: '✓ Approve (Complete)',
                            REJECTED: '✗ Reject',
                            CANCELLED: '⊘ Cancel',
                          }
                          return (
                            <option key={status} value={status}>
                              {labels[status] || status}
                            </option>
                          )
                        })}
                      </select>
                      <p className="text-xs text-slate-600 mt-2">
                        Current: <span className="font-semibold">{task.status}</span>
                      </p>
                    </>
                  )}
                </div>

                {statusUpdate.status === 'WAITING_FOR_APPROVAL' && (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Submission Note <span className="text-rose-500">*</span>
                      </label>
                      <textarea
                        value={statusUpdate.submissionNote}
                        onChange={(e) => setStatusUpdate({ ...statusUpdate, submissionNote: e.target.value })}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                        rows={3}
                        placeholder="Describe what you completed..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Deliverable URL (Optional)</label>
                      <input
                        type="url"
                        value={statusUpdate.deliverableUrl}
                        onChange={(e) => setStatusUpdate({ ...statusUpdate, deliverableUrl: e.target.value })}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="https://figma.com/... or https://github.com/..."
                      />
                    </div>
                  </>
                )}

                {statusUpdate.status === 'REJECTED' && (
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Rejection Reason <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      value={statusUpdate.rejectionReason}
                      onChange={(e) => setStatusUpdate({ ...statusUpdate, rejectionReason: e.target.value })}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      placeholder="Explain why this is rejected..."
                    />
                  </div>
                )}

                {getValidTransitions(task.status).length > 0 && (
                  <div className="flex gap-2 pt-3">
                    <button
                      onClick={() => setShowStatusUpdate(false)}
                      className="flex-1 rounded-lg border border-slate-200 px-3 py-2 font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleStatusUpdate}
                      disabled={
                        isLoading ||
                        (statusUpdate.status === 'WAITING_FOR_APPROVAL' && !statusUpdate.submissionNote?.trim()) ||
                        (statusUpdate.status === 'REJECTED' && !statusUpdate.rejectionReason?.trim())
                      }
                      className="flex-1 rounded-lg bg-blue-600 px-3 py-2 font-semibold text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                      {isLoading ? 'Updating...' : 'Update Status'}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Comments Section */}
            <div className="rounded-lg border border-slate-200 p-4">
              <h3 className="font-semibold text-slate-900 mb-4">Comments ({comments.length})</h3>

              {commentsLoading ? (
                <p className="text-sm text-slate-500">Loading comments...</p>
              ) : comments.length === 0 ? (
                <p className="text-sm text-slate-500 mb-4">No comments yet</p>
              ) : (
                <div className="space-y-4 mb-4 max-h-64 overflow-y-auto">
                  {comments.map((comment) => (
                    <div key={comment.id} className="rounded-lg bg-slate-50 p-3">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-semibold text-slate-900">{comment.userName}</p>
                        <p className="text-xs text-slate-500">{new Date(comment.createdAt).toLocaleString('vi-VN')}</p>
                      </div>
                      <p className="text-sm text-slate-700">{comment.content}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Comment */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      void handleAddComment()
                    }
                  }}
                  placeholder="Add a comment..."
                  className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={() => void handleAddComment()}
                  disabled={!newComment.trim() || isSubmittingComment}
                  className="rounded-lg bg-blue-600 px-3 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Status Badge */}
            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase text-slate-600 mb-2">Current Status</p>
              <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1 ${
                task.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' :
                task.status === 'REJECTED' || task.status === 'CANCELLED' ? 'bg-rose-100 text-rose-700' :
                task.status === 'WAITING_FOR_APPROVAL' ? 'bg-amber-100 text-amber-700' :
                'bg-blue-100 text-blue-700'
              }`}>
                {task.status === 'COMPLETED' && <CheckCircle2 size={14} />}
                {(task.status === 'REJECTED' || task.status === 'CANCELLED') && <XCircle size={14} />}
                {task.status === 'IN_PROGRESS' && <Clock size={14} />}
                <span className="text-xs font-bold">{task.status}</span>
              </div>
            </div>

            {/* Dates */}
            <div className="rounded-lg bg-slate-50 p-4 space-y-3">
              <div>
                <p className="text-xs font-semibold uppercase text-slate-600">Created</p>
                <p className="text-sm font-medium mt-1">
                  {task.createdAt ? new Date(task.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
                </p>
              </div>
              {task.startedAt && (
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-600">Started</p>
                  <p className="text-sm font-medium mt-1">{new Date(task.startedAt).toLocaleDateString('vi-VN')}</p>
                </div>
              )}
              {task.completedAt && (
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-600">Completed</p>
                  <p className="text-sm font-medium mt-1">{new Date(task.completedAt).toLocaleDateString('vi-VN')}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
