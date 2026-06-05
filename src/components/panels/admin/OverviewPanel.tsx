import { useCallback, useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { CalendarDays, ChevronDown, RefreshCw, Building2 } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import {
  apiClient,
  type ApiResponse,
  type CompanyDashboardDto,
  type DepartmentDashboardDto,
  type DepartmentDto,
  type PersonalDashboardDto,
} from '@/lib/api'
import PersonalDashboardView from './PersonalDashboard'
import DepartmentDashboardView from './DepartmentDashboard'
import CompanyDashboardView from './CompanyDashboard'
import { HeroChip } from './DashboardHelpers'

type DashboardMode = 'personal' | 'department' | 'company'
type DashboardData =
  | { mode: 'personal'; data: PersonalDashboardDto }
  | { mode: 'department'; data: DepartmentDashboardDto }
  | { mode: 'company'; data: CompanyDashboardDto }
const MODE_META: Record<DashboardMode, { label: string; description: string }> = {
  personal: { label: 'Personal', description: 'Today focus, upcoming deadlines and weekly trend.' },
  department: { label: 'Department', description: 'Department KPI, team view and burnout alerts.' },
  company: { label: 'Company', description: 'Company-wide KPI, departments and system signals.' },
}

const MONTH_OPTIONS = [
  { value: 1, label: 'Jan' },
  { value: 2, label: 'Feb' },
  { value: 3, label: 'Mar' },
  { value: 4, label: 'Apr' },
  { value: 5, label: 'May' },
  { value: 6, label: 'Jun' },
  { value: 7, label: 'Jul' },
  { value: 8, label: 'Aug' },
  { value: 9, label: 'Sep' },
  { value: 10, label: 'Oct' },
  { value: 11, label: 'Nov' },
  { value: 12, label: 'Dec' },
]

const getDefaultMode = (roleName?: string | null): DashboardMode => {
  const normalized = roleName?.toUpperCase()
  switch (normalized) {
    case 'CEO':
      return 'company'
    case 'MANAGER':
    case 'HR':
      return 'department'
    case 'ADMIN':
      return 'company'
    default:
      return 'personal'
  }
}

// date formatting helpers are provided in individual dashboard components

const getErrorMessage = (error: unknown, fallback: string) => {
  if (!axios.isAxiosError(error)) {
    return error instanceof Error && error.message ? error.message : fallback
  }

  const data = error.response?.data
  if (typeof data === 'string' && data.trim()) return data
  if (!data || typeof data !== 'object') return fallback

  const typed = data as { message?: unknown; title?: unknown; detail?: unknown; errors?: unknown }

  if (typeof typed.message === 'string' && typed.message.trim()) return typed.message
  if (typeof typed.title === 'string' && typed.title.trim()) return typed.title
  if (typeof typed.detail === 'string' && typed.detail.trim()) return typed.detail

  if (typed.errors && typeof typed.errors === 'object') {
    const messages = Object.values(typed.errors as Record<string, unknown>)
      .flatMap((value) => (Array.isArray(value) ? value : [value]))
      .filter((value): value is string => typeof value === 'string' && value.trim().length > 0)

    if (messages.length > 0) return messages.join('; ')
  }

  return fallback
}

export const OverviewPanel = ({ initialMode }: { initialMode?: DashboardMode } = {}) => {
  const { user, role } = useAuth()
  const availableModes = useMemo(() => {
    const roleName = role?.toUpperCase()
    if (roleName === 'ADMIN') return ['personal', 'department', 'company'] as DashboardMode[]
    if (roleName === 'CEO') return ['personal', 'company'] as DashboardMode[]
    if (roleName === 'MANAGER' || roleName === 'HR') return ['personal', 'department'] as DashboardMode[]
    return ['personal'] as DashboardMode[]
  }, [role])

  const [mode, setMode] = useState<DashboardMode>(() => initialMode ?? getDefaultMode(role))
  const [dashboard, setDashboard] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const [departments, setDepartments] = useState<DepartmentDto[]>([])
  const [loadingDepartments, setLoadingDepartments] = useState(false)
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<number | null>(null)

  const now = useMemo(() => new Date(), [refreshKey])
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)

  useEffect(() => {
    if (initialMode) {
      setMode(initialMode)
    }
  }, [initialMode])

  useEffect(() => {
    const preferred = getDefaultMode(role)
    if (!availableModes.includes(mode)) {
      setMode(preferred)
    }
  }, [availableModes, mode, role])

  const loadDepartments = useCallback(async () => {
    if (departments.length > 0 || loadingDepartments) return

    setLoadingDepartments(true)
    try {
      const response = await apiClient.get<ApiResponse<DepartmentDto[]>>('/departments')
      const items = response.data.data ?? []
      setDepartments(items)

      if (selectedDepartmentId == null && items.length > 0) {
        const matched = user?.departmentName
          ? items.find((department) => department.name.trim().toLowerCase() === user.departmentName?.trim().toLowerCase())
          : undefined
        setSelectedDepartmentId(matched?.id ?? items[0].id)
      }
    } catch {
      setDepartments([])
    } finally {
      setLoadingDepartments(false)
    }
  }, [departments.length, loadingDepartments, selectedDepartmentId, user?.departmentName])

  useEffect(() => {
    if (mode === 'department') {
      void loadDepartments()
    }
  }, [loadDepartments, mode])

  const currentDepartment = useMemo(
    () => departments.find((department) => department.id === selectedDepartmentId) ?? null,
    [departments, selectedDepartmentId],
  )

  useEffect(() => {
    let cancelled = false

    const loadDashboard = async () => {
      const departmentId = mode === 'department' ? selectedDepartmentId : null

      if (mode === 'department' && departmentId == null) {
        if (loadingDepartments) return
        setDashboard(null)
        setIsLoading(false)
        setErrorMessage('Vui lòng chọn phòng ban để xem dashboard.')
        return
      }

      setIsLoading(true)
      setErrorMessage(null)

      try {
        let response:
          | ApiResponse<PersonalDashboardDto>
          | ApiResponse<DepartmentDashboardDto>
          | ApiResponse<CompanyDashboardDto>

        if (mode === 'personal') {
          response = (await apiClient.get<ApiResponse<PersonalDashboardDto>>('/dashboard/personal')).data
        } else if (mode === 'department') {
          response = (
            await apiClient.get<ApiResponse<DepartmentDashboardDto>>(`/dashboard/department/${departmentId}`, {
              params: { year, month },
            })
          ).data
        } else {
          response = (await apiClient.get<ApiResponse<CompanyDashboardDto>>('/dashboard/company', { params: { year, month } })).data
        }

        if (!response.succeeded || !response.data) {
          throw new Error(response.message || 'Không thể tải dashboard.')
        }

        if (!cancelled) {
          setDashboard({ mode, data: response.data } as DashboardData)
        }
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(getErrorMessage(error, 'Không thể tải dashboard.'))
          setDashboard(null)
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    void loadDashboard()

    return () => {
      cancelled = true
    }
  }, [loadingDepartments, mode, month, selectedDepartmentId, year, refreshKey])

  const dashboardTitle = dashboard?.mode ?? mode
  const modeMeta = MODE_META[dashboardTitle]

  const yearRange = useMemo(() => {
    const current = new Date().getFullYear()
    return [current - 1, current, current + 1]
  }, [])

  const renderModeButton = (tab: DashboardMode) => {
    const isActive = (dashboard?.mode ?? mode) === tab
    return (
      <button
        key={tab}
        type="button"
        onClick={() => setMode(tab)}
        className={`rounded-full px-4 py-2 text-sm font-semibold transition ${isActive ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-200 hover:bg-white/10'}`}
      >
        {MODE_META[tab].label}
      </button>
    )
  }

  if (isLoading && !dashboard) {
    return (
      <div className="space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-3">
              <div className="h-4 w-36 rounded-full bg-slate-100" />
              <div className="h-8 w-72 rounded-full bg-slate-100" />
              <div className="h-4 w-[32rem] max-w-full rounded-full bg-slate-100" />
            </div>
            <div className="h-11 w-44 rounded-full bg-slate-100" />
          </div>
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div key={item} className="h-28 rounded-2xl bg-slate-50" />
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="h-80 rounded-2xl border border-slate-200 bg-white" />
          <div className="h-80 rounded-2xl border border-slate-200 bg-white" />
          <div className="h-80 rounded-2xl border border-slate-200 bg-white" />
        </div>
      </div>
    )
  }

  if (errorMessage && !dashboard) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-700 shadow-sm">
        <p className="font-semibold">Không tải được dashboard</p>
        <p className="mt-1 text-sm">{errorMessage}</p>
        <button
          type="button"
          onClick={() => setRefreshKey((value) => value + 1)}
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-500"
        >
          <RefreshCw size={14} />
          Thử lại
        </button>
      </div>
    )
  }

  if (!dashboard) {
    return null
  }

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-950 text-white shadow-[0_18px_50px_rgba(15,23,42,0.18)]">
        <div className="relative overflow-hidden px-6 py-6 sm:px-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.18),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.14),transparent_40%)]" />
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-3xl space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-cyan-200/80"> Dashboard</p>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{modeMeta.label} Dashboard</h2>
              <p className="max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">{modeMeta.description}</p>
              {mode === 'department' && currentDepartment ? (
                <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-slate-100">
                  <Building2 size={14} />
                  {currentDepartment.name}
                </div>
              ) : null}
            </div>

            <div className="flex flex-wrap gap-2 rounded-full border border-white/10 bg-white/10 p-2 backdrop-blur-sm">
              {availableModes.map(renderModeButton)}
            </div>
          </div>

          <div className="relative mt-6 grid grid-cols-1 gap-3 md:grid-cols-3">
            <HeroChip label="Active view" value={MODE_META[dashboard.mode].label} />
            <HeroChip label="Period" value={dashboard.mode === 'personal' ? 'Live' : `${MONTH_OPTIONS[month - 1]?.label ?? month}/${year}`} />
            <HeroChip label="Context" value={dashboard.mode === 'personal' ? 'My workday' : dashboard.mode === 'department' ? 'Department overview' : 'Company overview'} />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">Controls</p>
            <h3 className="text-lg font-semibold text-slate-900">Period and scope</h3>
            <p className="mt-1 text-sm text-slate-500">Chọn chế độ dashboard, phòng ban và kỳ báo cáo phù hợp.</p>
          </div>

          <div className="flex flex-wrap items-end gap-3">
            {mode === 'department' ? (
              <label className="space-y-1.5">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Department</span>
                <select
                  value={selectedDepartmentId ?? ''}
                  onChange={(event) => setSelectedDepartmentId(event.target.value ? Number(event.target.value) : null)}
                  className="min-w-56 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none"
                >
                  <option value="">{loadingDepartments ? 'Loading departments...' : 'Select department'}</option>
                  {departments.map((department) => (
                    <option key={department.id} value={department.id}>
                      {department.name}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}

            {mode !== 'personal' ? (
              <>
                <label className="space-y-1.5">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Month</span>
                  <select
                    value={month}
                    onChange={(event) => setMonth(Number(event.target.value))}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none"
                  >
                    {MONTH_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="space-y-1.5">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Year</span>
                  <select
                    value={year}
                    onChange={(event) => setYear(Number(event.target.value))}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none"
                  >
                    {yearRange.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </label>
              </>
            ) : null}

            <button
              type="button"
              onClick={() => setRefreshKey((value) => value + 1)}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <RefreshCw size={14} />
              Refresh
            </button>
          </div>
        </div>
      </section>

      {errorMessage ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {errorMessage}
        </div>
      ) : null}

      {dashboard.mode === 'personal' ? <PersonalDashboardView dashboard={dashboard.data} /> : null}
      {dashboard.mode === 'department' ? <DepartmentDashboardView dashboard={dashboard.data} /> : null}
      {dashboard.mode === 'company' ? <CompanyDashboardView dashboard={dashboard.data} /> : null}

      <div className="flex items-center justify-between text-xs text-slate-500">
        <div className="inline-flex items-center gap-2">
          <CalendarDays size={14} />
          Updated at {new Date().toLocaleString('vi-VN')}
        </div>
        <div className="inline-flex items-center gap-2">
          <ChevronDown size={14} className="-rotate-90" />
          {MODE_META[dashboard.mode].label} mode
        </div>
      </div>
    </div>
  )
}

