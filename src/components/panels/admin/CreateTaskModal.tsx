import { useState, useEffect } from 'react'
import { AlertCircle, X } from 'lucide-react'
import { apiClient, type ApiResponse, type CreateTaskInstanceDto, type UserDto, type TaskInstanceDto } from '@/lib/api'

interface CreateTaskModalProps {
  onClose: () => void
  onSuccess: () => void
}

export default function CreateTaskModal({ onClose, onSuccess }: CreateTaskModalProps) {
  const [formData, setFormData] = useState<CreateTaskInstanceDto>({
    taskTypeId: 0,
    title: '',
    assignedUserId: '',
    plannedQuantity: 1,
    expectedCompletion: '',
    priority: 'MEDIUM',
  })

  const [employees, setEmployees] = useState<UserDto[]>([])
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  // Load employees for assignment
  useEffect(() => {
    const load = async () => {
      try {
        const res = await apiClient.get<ApiResponse<any>>('/admin/users?pageSize=1000')
        // API returns PagedResult { items: [], totalCount, ... }
        const data = res.data.data
        const items = data?.items || data || []
        setEmployees(Array.isArray(items) ? items : [])
      } catch (err: any) {
        console.error('Failed to load employees:', err)
        setEmployees([]) // Fallback to empty array
      } finally {
        setIsLoadingEmployees(false)
      }
    }
    void load()
  }, [])

  const validateForm = () => {
    const errors: Record<string, string> = {}

    if (!formData.title.trim()) errors.title = 'Title is required'
    if (formData.title.length > 200) errors.title = 'Title must be 200 characters or less'

    if (!formData.taskTypeId) errors.taskTypeId = 'Task type is required'

    if (!formData.assignedUserId) errors.assignedUserId = 'Employee is required'

    if (!formData.expectedCompletion) errors.expectedCompletion = 'Due date is required'
    const dueDate = new Date(formData.expectedCompletion)
    if (dueDate < new Date()) errors.expectedCompletion = 'Due date must be in the future'

    if (!formData.plannedQuantity || formData.plannedQuantity < 1 || formData.plannedQuantity > 10000) {
      errors.plannedQuantity = 'Quantity must be between 1 and 10000'
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsSaving(true)
    setError(null)
    try {
      const res = await apiClient.post<ApiResponse<TaskInstanceDto>>('/tasks', formData)
      if (res.data.succeeded) {
        onSuccess()
        onClose()
      } else {
        setError(res.data.message ?? 'Failed to create task')
      }
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Failed to create task')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-bold text-slate-900">Create New Task</h2>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          {error && (
            <div className="flex gap-3 rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
              <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className={`w-full rounded-lg border ${validationErrors.title ? 'border-rose-300' : 'border-slate-200'} px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="Task title (max 200 characters)"
              />
              {validationErrors.title && <p className="mt-1 text-xs text-rose-600">{validationErrors.title}</p>}
            </div>

            {/* Task Type */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Task Type <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                value={formData.taskTypeId}
                onChange={(e) => setFormData({ ...formData, taskTypeId: Number(e.target.value) })}
                className={`w-full rounded-lg border ${validationErrors.taskTypeId ? 'border-rose-300' : 'border-slate-200'} px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="Enter task type ID"
              />
              {validationErrors.taskTypeId && <p className="mt-1 text-xs text-rose-600">{validationErrors.taskTypeId}</p>}
            </div>

            {/* Assigned Employee */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Assign To <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.assignedUserId}
                onChange={(e) => setFormData({ ...formData, assignedUserId: e.target.value })}
                disabled={isLoadingEmployees}
                className={`w-full rounded-lg border ${validationErrors.assignedUserId ? 'border-rose-300' : 'border-slate-200'} px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500`}
              >
                <option value="">
                  {isLoadingEmployees ? 'Loading employees...' : 'Select employee'}
                </option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.firstName} {emp.lastName} ({emp.email})
                  </option>
                ))}
              </select>
              {validationErrors.assignedUserId && <p className="mt-1 text-xs text-rose-600">{validationErrors.assignedUserId}</p>}
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Due Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="datetime-local"
                value={formData.expectedCompletion}
                onChange={(e) => setFormData({ ...formData, expectedCompletion: e.target.value })}
                className={`w-full rounded-lg border ${validationErrors.expectedCompletion ? 'border-rose-300' : 'border-slate-200'} px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500`}
              />
              {validationErrors.expectedCompletion && <p className="mt-1 text-xs text-rose-600">{validationErrors.expectedCompletion}</p>}
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>

            {/* Planned Quantity */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Planned Quantity</label>
              <input
                type="number"
                value={formData.plannedQuantity}
                onChange={(e) => setFormData({ ...formData, plannedQuantity: Number(e.target.value) })}
                min="1"
                max="10000"
                className={`w-full rounded-lg border ${validationErrors.plannedQuantity ? 'border-rose-300' : 'border-slate-200'} px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500`}
              />
              {validationErrors.plannedQuantity && <p className="mt-1 text-xs text-rose-600">{validationErrors.plannedQuantity}</p>}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 justify-end border-t border-slate-200 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {isSaving ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
