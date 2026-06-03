import { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import {
  apiClient,
  type ApiResponse,
  type CreateStandardTimeDto,
  type CreateTaskTypeDto,
  type StandardTimeDto,
  type TaskTypeDto,
  type UpdateTaskTypeDto,
} from '@/lib/api'
import { Clock3, Plus, RefreshCw, Search, ToggleLeft } from 'lucide-react'

type TaskTypeCategory = 'all' | 'core' | 'support' | 'ai' | 'admin' | 'other'

const CATEGORY_OPTIONS: Array<{ label: string; value: TaskTypeCategory }> = [
  { label: 'All', value: 'all' },
  { label: 'Core', value: 'core' },
  { label: 'Support', value: 'support' },
  { label: 'AI', value: 'ai' },
  { label: 'Admin', value: 'admin' },
  { label: 'Other', value: 'other' },
]

export default function TaskTypesPanel() {
  const [taskTypes, setTaskTypes] = useState<TaskTypeDto[]>([])
  const [selectedTaskType, setSelectedTaskType] = useState<TaskTypeDto | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [standardTimes, setStandardTimes] = useState<StandardTimeDto[]>([])
  const [loadingTypes, setLoadingTypes] = useState(false)
  const [loadingTimes, setLoadingTimes] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [searchInput, setSearchInput] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<TaskTypeCategory>('all')
  const [isActiveFilter, setIsActiveFilter] = useState<'all' | 'true' | 'false'>('all')

  const [createOpen, setCreateOpen] = useState(false)
  const [createCode, setCreateCode] = useState('')
  const [createName, setCreateName] = useState('')
  const [createDescription, setCreateDescription] = useState('')
  const [createCategory, setCreateCategory] = useState('')

  const [standardOpen, setStandardOpen] = useState(false)
  const [observedTime, setObservedTime] = useState('')
  const [ratingFactor, setRatingFactor] = useState('1')
  const [pfdFactor, setPfdFactor] = useState('0.15')

  const [submitting, setSubmitting] = useState(false)

  const loadTaskTypes = async () => {
    setLoadingTypes(true)
    setError(null)

    try {
      const params: Record<string, string | boolean> = {}
      if (categoryFilter !== 'all') params.category = categoryFilter
      if (isActiveFilter !== 'all') params.isActive = isActiveFilter === 'true'

      const response = await apiClient.get<ApiResponse<TaskTypeDto[]>>('/task-types', { params })
      const items = response.data.data ?? []
      setTaskTypes(items)

      if (!selectedTaskType && items.length > 0) {
        setSelectedTaskType(items[0])
      }
    } catch {
      setError('Không thể tải danh sách task types.')
      setTaskTypes([])
      setSelectedTaskType(null)
    } finally {
      setLoadingTypes(false)
    }
  }

  const loadStandardTimes = async (taskTypeId: number) => {
    setLoadingTimes(true)
    try {
      const response = await apiClient.get<ApiResponse<StandardTimeDto[]>>(`/task-types/${taskTypeId}/standard-times`)
      setStandardTimes(response.data.data ?? [])
    } catch {
      setStandardTimes([])
      setError('Không thể tải lịch sử standard time.')
    } finally {
      setLoadingTimes(false)
    }
  }

  useEffect(() => {
    loadTaskTypes()
  }, [])

  useEffect(() => {
    if (selectedTaskType && detailOpen) {
      loadStandardTimes(selectedTaskType.id)
    } else {
      setStandardTimes([])
    }
  }, [selectedTaskType, detailOpen])

  const filteredTaskTypes = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase()
    return taskTypes.filter((taskType) => {
      const matchesKeyword = !keyword || [taskType.code, taskType.name, taskType.description, taskType.category]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(keyword))

      const matchesActive =
        isActiveFilter === 'all' ? true : isActiveFilter === 'true' ? taskType.isActive : !taskType.isActive

      const matchesCategory =
        categoryFilter === 'all' ? true : (taskType.category ?? '').toLowerCase() === categoryFilter.toLowerCase()

      return matchesKeyword && matchesActive && matchesCategory
    })
  }, [taskTypes, searchTerm, categoryFilter, isActiveFilter])

  const activeCount = useMemo(() => taskTypes.filter((taskType) => taskType.isActive).length, [taskTypes])
  const withStandardTimeCount = useMemo(() => taskTypes.filter((taskType) => taskType.hasActiveStandardTime).length, [taskTypes])

  const submitSearch = (event: React.FormEvent) => {
    event.preventDefault()
    setSearchTerm(searchInput)
  }

  const openCreate = () => {
    setCreateCode('')
    setCreateName('')
    setCreateDescription('')
    setCreateCategory('')
    setCreateOpen(true)
  }

  const openTaskTypeDetails = (taskType: TaskTypeDto) => {
    setSelectedTaskType(taskType)
    setDetailOpen(true)
  }

  const closeTaskTypeDetails = () => {
    setDetailOpen(false)
  }

  const createTaskType = async () => {
    if (!createCode.trim() || !createName.trim()) {
      setError('Mã và tên task type không được để trống.')
      return
    }

    setSubmitting(true)
    setError(null)
    try {
      const payload: CreateTaskTypeDto = {
        code: createCode.trim(),
        name: createName.trim(),
      }
      if (createDescription.trim()) payload.description = createDescription.trim()
      if (createCategory.trim()) payload.category = createCategory.trim()

      const response = await apiClient.post<ApiResponse<TaskTypeDto>>('/task-types', payload)
      if (!response.data.succeeded) {
        setError(response.data.message || 'Không thể tạo task type.')
        return
      }

      setCreateOpen(false)
      await loadTaskTypes()
    } catch (error) {
      setError(extractApiErrorMessage(error, 'Không thể tạo task type.'))
    } finally {
      setSubmitting(false)
    }
  }

  const toggleTaskTypeStatus = async (taskType: TaskTypeDto) => {
    const nextActive = !taskType.isActive
    const actionLabel = nextActive ? 'kích hoạt' : 'vô hiệu hóa'
    if (!confirm(`Bạn muốn ${actionLabel} task type "${taskType.name}"?`)) return

    setSubmitting(true)
    setError(null)
    try {
      const response = nextActive
        ? await apiClient.put<ApiResponse<TaskTypeDto>>(`/task-types/${taskType.id}`, {
            code: taskType.code,
            name: taskType.name,
            description: taskType.description ?? undefined,
            category: taskType.category ?? undefined,
            isActive: true,
          } satisfies UpdateTaskTypeDto)
        : await apiClient.patch<ApiResponse<null>>(`/task-types/${taskType.id}/deactivate`)

      if (!response.data.succeeded) {
        setError(response.data.message || `Không thể ${actionLabel} task type.`)
        return
      }

      await loadTaskTypes()
      if (selectedTaskType?.id === taskType.id) {
        const updated = taskTypes.find((item) => item.id === taskType.id)
        if (updated) setSelectedTaskType(updated)
      }
    } catch (error) {
      setError(extractApiErrorMessage(error, `Không thể ${actionLabel} task type.`))
    } finally {
      setSubmitting(false)
    }
  }

  const openStandardForm = () => {
    setObservedTime('')
    setRatingFactor('1')
    setPfdFactor('0.15')
    setStandardOpen(true)
  }

  const createStandardTime = async () => {
    if (!selectedTaskType) return

    if (!selectedTaskType.isActive) {
      setError('Task type đang Inactive. Hãy kích hoạt lại trước khi thêm standard time.')
      return
    }

    const observed = Number(observedTime)
    const rating = Number(ratingFactor)
    const pfd = Number(pfdFactor)

    if (!Number.isFinite(observed) || observed <= 0) {
      setError('Observed time phải lớn hơn 0.')
      return
    }
    if (!Number.isFinite(rating) || rating <= 0) {
      setError('Rating factor phải lớn hơn 0.')
      return
    }
    if (!Number.isFinite(pfd) || pfd < 0) {
      setError('PFD factor không hợp lệ.')
      return
    }

    setSubmitting(true)
    setError(null)
    try {
      const payload: CreateStandardTimeDto = {
        observedTime: observed,
        ratingFactor: rating,
        pfdFactor: pfd,
      }

      const response = await apiClient.post<ApiResponse<StandardTimeDto>>(`/task-types/${selectedTaskType.id}/standard-times`, payload)
      if (!response.data.succeeded) {
        setError(response.data.message || 'Không thể tạo standard time.')
        return
      }

      setStandardOpen(false)
      await loadTaskTypes()
      await loadStandardTimes(selectedTaskType.id)
    } catch (error) {
      setError(extractApiErrorMessage(error, 'Không thể tạo standard time.'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">Task configuration</p>
            <h2 className="text-2xl font-bold text-slate-900">Task Types & Standard Time</h2>
            <p className="mt-1 text-sm text-slate-500">Quản lý loại công việc và lịch sử standard time theo từng phiên bản.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={openCreate}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              <Plus size={16} />
              Create task type
            </button>
            <button
              type="button"
              onClick={loadTaskTypes}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700"
            >
              <RefreshCw size={14} />
              Refresh
            </button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <StatCard label="Total types" value={String(taskTypes.length)} hint="Filtered from API" />
          <StatCard label="Active types" value={String(activeCount)} hint="Currently active" />
          <StatCard label="With standard time" value={String(withStandardTimeCount)} hint="Has active version" />
        </div>

        <form onSubmit={submitSearch} className="mt-6 grid grid-cols-1 gap-3 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
              <Search size={16} className="text-slate-400" />
              <input
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Search by code, name, description, category..."
                className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
              />
            </div>
          </div>

          <select
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value as TaskTypeCategory)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none"
          >
            {CATEGORY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <select
            value={isActiveFilter}
            onChange={(event) => setIsActiveFilter(event.target.value as 'all' | 'true' | 'false')}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none"
          >
            <option value="all">All status</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>

          <div className="lg:col-span-4 flex items-center justify-between gap-3">
            <p className="text-xs text-slate-500">
              {error ? <span className="text-rose-600">{error}</span> : `${filteredTaskTypes.length} task types in current view`}
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchInput('')
                setSearchTerm('')
                setCategoryFilter('all')
                setIsActiveFilter('all')
              }}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700"
            >
              Reset
            </button>
          </div>
        </form>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-4">
          <h3 className="text-lg font-semibold text-slate-900">Task Types</h3>
          <p className="text-sm text-slate-500">{loadingTypes ? 'Loading task types...' : `Showing ${filteredTaskTypes.length} items`}</p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">ID</th>
                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Code</th>
                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Name</th>
                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Category</th>
                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Std Time</th>
                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loadingTypes ? (
                <tr>
                  <td className="px-6 py-8 text-sm text-slate-500" colSpan={7}>
                    Loading task types...
                  </td>
                </tr>
              ) : filteredTaskTypes.length > 0 ? (
                filteredTaskTypes.map((taskType) => (
                  <tr key={taskType.id} className="border-t border-slate-100 transition hover:bg-slate-50">
                    <td className="px-6 py-4 font-mono text-xs text-slate-500">{taskType.id}</td>
                    <td className="px-6 py-4 font-medium text-slate-700">{taskType.code}</td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-slate-900">{taskType.name}</p>
                        <p className="text-sm text-slate-500 line-clamp-1">{taskType.description ?? 'No description'}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700">{taskType.category ?? '-'}</td>
                    <td className="px-6 py-4 text-sm text-slate-700">{taskType.currentStandardTime ?? '-'}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold ${taskType.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                          {taskType.isActive ? 'Active' : 'Inactive'}
                        </span>
                        {taskType.hasActiveStandardTime ? (
                          <span className="inline-flex w-fit rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                            Has standard time
                          </span>
                        ) : (
                          <span className="inline-flex w-fit rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                            No active standard time
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex gap-2">
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation()
                            openTaskTypeDetails(taskType)
                          }}
                          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                        >
                          View
                        </button>
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation()
                            toggleTaskTypeStatus(taskType)
                          }}
                          disabled={submitting}
                          className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${taskType.isActive ? 'border border-rose-200 text-rose-700 hover:bg-rose-50' : 'border border-emerald-200 text-emerald-700 hover:bg-emerald-50'}`}
                        >
                          <ToggleLeft size={14} />
                          {taskType.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="px-6 py-8 text-sm text-slate-500" colSpan={7}>
                    No task types found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {createOpen ? (
        <Modal title="Create task type" onClose={() => setCreateOpen(false)}>
          <div className="grid grid-cols-1 gap-4">
            <Field label="Code" value={createCode} onChange={setCreateCode} placeholder="TT-001" maxLength={20} />
            <Field label="Name" value={createName} onChange={setCreateName} placeholder="Task Type Name" maxLength={200} />
            <Field label="Category" value={createCategory} onChange={setCreateCategory} placeholder="core / support / ai / admin / other" maxLength={50} />
            <Field label="Description" value={createDescription} onChange={setCreateDescription} placeholder="Optional description" maxLength={500} />
          </div>
          <ModalActions
            onCancel={() => setCreateOpen(false)}
            onConfirm={createTaskType}
            confirmLabel={submitting ? 'Saving...' : 'Create'}
            confirmDisabled={submitting}
          />
        </Modal>
      ) : null}

      {standardOpen ? (
        <Modal
          title={`Add standard time${selectedTaskType ? ` for ${selectedTaskType.code}` : ''}`}
          onClose={() => setStandardOpen(false)}
          zIndexClass="z-[60]"
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Field label="Observed time (minutes)" value={observedTime} onChange={setObservedTime} placeholder="60" type="number" min="0.01" step="0.01" />
            <Field label="Rating factor" value={ratingFactor} onChange={setRatingFactor} placeholder="1.0" type="number" min="0.5" max="2" step="0.01" />
            <Field label="PFD factor" value={pfdFactor} onChange={setPfdFactor} placeholder="0.15" type="number" min="0.05" max="0.5" step="0.01" />
          </div>
          <p className="mt-3 text-xs text-slate-500">Standard time sẽ được tính ở BE theo công thức `observedTime * ratingFactor * (1 + pfdFactor)`.</p>
          <ModalActions
            onCancel={() => setStandardOpen(false)}
            onConfirm={createStandardTime}
            confirmLabel={submitting ? 'Saving...' : 'Create version'}
            confirmDisabled={submitting}
          />
        </Modal>
      ) : null}

      {detailOpen && selectedTaskType ? (
        <Modal
          title={`Standard Time · ${selectedTaskType.code}`}
          onClose={closeTaskTypeDetails}
          zIndexClass="z-50"
          maxWidthClass="max-w-4xl"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold text-slate-900">{selectedTaskType.name}</h3>
              <p className="text-sm text-slate-500">{selectedTaskType.description ?? 'No description'}</p>
            </div>
            <button
              type="button"
              onClick={openStandardForm}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white"
            >
              <Clock3 size={16} />
              Add version
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <InfoCard label="Current standard time" value={selectedTaskType.currentStandardTime != null ? `${selectedTaskType.currentStandardTime} min` : '-'} />
            <InfoCard label="Category" value={selectedTaskType.category ?? '-'} />
            <InfoCard label="Status" value={selectedTaskType.isActive ? 'Active' : 'Inactive'} />
            <InfoCard label="Created at" value={selectedTaskType.createdAt ? new Date(selectedTaskType.createdAt).toLocaleString() : '-'} />
          </div>

          <div>
            <div className="mb-3 flex items-center justify-between">
              <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Standard time history</h4>
              <button
                type="button"
                onClick={() => loadStandardTimes(selectedTaskType.id)}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700"
              >
                <RefreshCw size={14} />
                Reload
              </button>
            </div>

            {loadingTimes ? (
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">Loading standard times...</div>
            ) : standardTimes.length > 0 ? (
              <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-1">
                {standardTimes.map((version) => (
                  <div key={version.id} className="rounded-xl border border-slate-200 p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-slate-900">Version {version.version}</p>
                          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${version.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                            {version.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-slate-500">
                          Observed: {version.observedTime} min · Rating: {version.ratingFactor} · PFD: {version.pfdFactor}
                        </p>
                      </div>
                      <div className="text-right text-sm text-slate-700">
                        <p className="font-semibold">{version.standardTime ?? '-'} min</p>
                        <p className="text-slate-500">{version.createdAt ? new Date(version.createdAt).toLocaleString() : '-'}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-200 px-4 py-6 text-sm text-slate-500">
                No standard time versions yet.
              </div>
            )}
          </div>
        </Modal>
      ) : null}
    </div>
  )
}

function StatCard({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-600">{label}</p>
      <p className="mt-3 text-2xl font-bold text-slate-900">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{hint}</p>
    </div>
  )
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-900">{value}</p>
    </div>
  )
}

function Modal({
  title,
  onClose,
  children,
  maxWidthClass = 'max-w-2xl',
  zIndexClass = 'z-50',
}: {
  title: string
  onClose: () => void
  children: React.ReactNode
  maxWidthClass?: string
  zIndexClass?: string
}) {
  return (
    <div className={`fixed inset-0 ${zIndexClass} flex items-center justify-center p-4`}>
      <div className="absolute inset-0 bg-slate-950/40" onClick={onClose} />
      <div className={`relative z-10 w-full ${maxWidthClass} rounded-2xl bg-white p-6 shadow-2xl`}>
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-xl font-bold text-slate-900">{title}</h3>
          <button type="button" onClick={onClose} className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700">
            Close
          </button>
        </div>
        <div className="mt-5 space-y-4">{children}</div>
      </div>
    </div>
  )
}

function ModalActions({ onCancel, onConfirm, confirmLabel, confirmDisabled }: { onCancel: () => void; onConfirm: () => void; confirmLabel: string; confirmDisabled?: boolean }) {
  return (
    <div className="flex items-center justify-end gap-3 pt-2">
      <button type="button" onClick={onCancel} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700">
        Cancel
      </button>
      <button
        type="button"
        onClick={onConfirm}
        disabled={confirmDisabled}
        className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        {confirmLabel}
      </button>
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  step,
  min,
  max,
  maxLength,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  type?: string
  step?: string
  min?: string
  max?: string
  maxLength?: number
}) {
  return (
    <label className="space-y-1.5">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        type={type}
        step={step}
        min={min}
        max={max}
        maxLength={maxLength}
        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none disabled:bg-slate-50"
      />
    </label>
  )
}

function extractApiErrorMessage(error: unknown, fallback: string): string {
  if (!axios.isAxiosError(error)) return fallback

  const data = error.response?.data

  if (typeof data === 'string' && data.trim()) return data
  if (!data || typeof data !== 'object') return fallback

  const typed = data as {
    message?: unknown
    title?: unknown
    detail?: unknown
    errors?: unknown
  }

  if (typeof typed.message === 'string' && typed.message.trim()) return typed.message
  if (typeof typed.title === 'string' && typed.title.trim()) return typed.title
  if (typeof typed.detail === 'string' && typed.detail.trim()) return typed.detail

  if (typed.errors && typeof typed.errors === 'object') {
    const flattened = Object.values(typed.errors as Record<string, unknown>).flatMap((value) =>
      Array.isArray(value) ? value : [value],
    )
      .filter((value): value is string => typeof value === 'string' && value.trim().length > 0)

    if (flattened.length > 0) return flattened.join('; ')
  }

  return fallback
}
