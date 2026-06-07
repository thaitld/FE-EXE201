import { useEffect, useMemo, useState } from 'react'
import { apiClient, type ApiResponse, type CreateTeamDto, type DepartmentDto, type TeamDetailDto, type UpdateTeamDto, type UserDto } from '@/lib/api'
import { BarChart3, Building2, Plus, RefreshCw, Search, Users } from 'lucide-react'
import { usePermission } from '@/features/auth/usePermission'

type TeamFormMode = 'create' | 'edit'

export const TeamPanel = () => {
  const { isEmployee, isAdmin, isManager, user } = usePermission()
  const [teams, setTeams] = useState<TeamDetailDto[]>([])
  const [departments, setDepartments] = useState<DepartmentDto[]>([])
  const [loadingTeams, setLoadingTeams] = useState(false)
  const [loadingDepartments, setLoadingDepartments] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [departmentFilter, setDepartmentFilter] = useState('')
  const [isActiveFilter, setIsActiveFilter] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  const [formOpen, setFormOpen] = useState(false)
  const [formMode, setFormMode] = useState<TeamFormMode>('create')
  const [selectedTeam, setSelectedTeam] = useState<TeamDetailDto | null>(null)


  const loadDepartments = async () => {
    setLoadingDepartments(true)
    try {
      const response = await apiClient.get<ApiResponse<DepartmentDto[]>>('/departments')
      setDepartments(response.data.data ?? [])
    } catch {
      setDepartments([])
    } finally {
      setLoadingDepartments(false)
    }
  }

  const loadTeams = async () => {
    setLoadingTeams(true)
    setError(null)

    try {
      const params: Record<string, string | number | boolean> = {}
      if (isManager()) {
        if (user?.departmentId) {
          params.departmentId = user.departmentId
        } else {
          return // Wait for user info to load
        }
      } else if (departmentFilter) {
        params.departmentId = Number(departmentFilter)
      }

      if (isActiveFilter) params.isActive = isActiveFilter === 'true'

      const response = await apiClient.get<ApiResponse<TeamDetailDto[]>>('/teams', { params })
      let result = response.data.data ?? []
      if (searchTerm.trim()) {
        const keyword = searchTerm.trim().toLowerCase()
        result = result.filter((team) =>
          [team.code, team.name, team.departmentName, team.teamLeadName, team.shift]
            .filter(Boolean)
            .some((value) => String(value).toLowerCase().includes(keyword))
        )
      }
      setTeams(result)
    } catch {
      setError('Không thể tải danh sách team.')
      setTeams([])
    } finally {
      setLoadingTeams(false)
    }
  }

  useEffect(() => {
    loadDepartments()
  }, [])

  useEffect(() => {
    loadTeams()
  }, [departmentFilter, isActiveFilter, searchTerm, user?.departmentId])

  const totalMembers = useMemo(() => teams.reduce((sum, team) => sum + team.memberCount, 0), [teams])
  const activeTeams = useMemo(() => teams.filter((team) => team.isActive).length, [teams])

  const openCreate = () => {
    setSelectedTeam(null)
    setFormMode('create')
    setFormOpen(true)
  }

  const openEdit = (team: TeamDetailDto) => {
    setSelectedTeam(team)
    setFormMode('edit')
    setFormOpen(true)
  }

  const submitSearch = (event: React.FormEvent) => {
    event.preventDefault()
    setSearchTerm(searchInput)
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">Organization</p>
            <h2 className="text-2xl font-bold text-slate-900">Team Management</h2>
            {isManager() && user?.departmentName && (
              <div className="mt-2 inline-flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-1.5 text-sm font-semibold text-blue-700 border border-blue-100">
                <Building2 size={16} />
                <span>Phòng ban quản lý: {user.departmentName}</span>
              </div>
            )}
            <p className="mt-2 text-sm text-slate-500">Danh sách teams, tạo team mới và cập nhật team hiện có.</p>
          </div>
          {isAdmin() && (
            <button
              type="button"
              onClick={openCreate}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              <Plus size={16} />
              Create team
            </button>
          )}
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <StatCard icon={Users} label="Total members" value={String(totalMembers)} hint="Across filtered teams" />
          <StatCard icon={BarChart3} label="Active teams" value={String(activeTeams)} hint="Based on current filters" />
          <StatCard icon={Building2} label="Departments loaded" value={loadingDepartments ? '...' : String(departments.length)} hint="For creating teams" />
        </div>

        <form onSubmit={submitSearch} className="mt-6 grid grid-cols-1 gap-3 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
              <Search size={16} className="text-slate-400" />
              <input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search by team code, name, department..."
                className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
              />
            </div>
          </div>

          {!isManager() && (
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none"
            >
              <option value="">All departments</option>
              {departments.map((department) => (
                <option key={department.id} value={department.id}>{department.name}</option>
              ))}
            </select>
          )}

          <select
            value={isActiveFilter}
            onChange={(e) => setIsActiveFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none"
          >
            <option value="">All status</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>

          <div className="lg:col-span-4 flex justify-between items-center gap-3">
            <p className="text-xs text-slate-500">
              {error ? <span className="text-rose-600">{error}</span> : `${teams.length} teams in current view`}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setDepartmentFilter('')
                  setIsActiveFilter('')
                  setSearchInput('')
                  setSearchTerm('')
                }}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={loadTeams}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700"
              >
                <RefreshCw size={14} />
                Refresh
              </button>
            </div>
          </div>
        </form>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-4">
          <h3 className="text-lg font-semibold text-slate-900">Teams</h3>
          <p className="text-sm text-slate-500">{loadingTeams ? 'Loading teams...' : `Showing ${teams.length} teams`}</p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">ID</th>
                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Team</th>
                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Department</th>
                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Lead</th>
                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Shift</th>
                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Members</th>
                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
                {isAdmin() && (
                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 text-right">Actions</th>
                )}
              </tr>
            </thead>
            <tbody>
              {loadingTeams ? (
                <tr>
                  <td className="px-6 py-8 text-sm text-slate-500" colSpan={isAdmin() ? 8 : 7}>Loading teams...</td>
                </tr>
              ) : teams.length > 0 ? (
                teams.map((team) => (
                  <tr key={team.id} className="border-t border-slate-100">
                    <td className="px-6 py-4 text-sm font-medium text-slate-700">#{team.id}</td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-slate-900">{team.name}</p>
                        <p className="text-sm text-slate-500">{team.code}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700">{team.departmentName}</td>
                    <td className="px-6 py-4 text-sm text-slate-700">{team.teamLeadName ?? 'Unassigned'}</td>
                    <td className="px-6 py-4 text-sm text-slate-700">{team.shift ?? '-'}</td>
                    <td className="px-6 py-4 text-sm text-slate-700">{team.memberCount}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${team.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                        {team.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    {isAdmin() && (
                      <td className="px-6 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => openEdit(team)}
                          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                        >
                          Edit
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="px-6 py-8 text-sm text-slate-500" colSpan={isAdmin() ? 8 : 7}>No teams found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <TeamModal
        open={formOpen}
        mode={formMode}
        team={selectedTeam}
        departments={departments}
        onClose={() => {
          setFormOpen(false)
          setSelectedTeam(null)
        }}
        onSaved={async () => {
          setFormOpen(false)
          setSelectedTeam(null)
          await loadTeams()
        }}
      />
    </div>
  )
}

function StatCard({ icon: Icon, label, value, hint }: { icon: typeof Users; label: string; value: string; hint: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-600">{label}</p>
        <Icon size={18} className="text-slate-500" />
      </div>
      <p className="mt-3 text-2xl font-bold text-slate-900">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{hint}</p>
    </div>
  )
}

type TeamModalProps = {
  open: boolean
  mode: TeamFormMode
  team: TeamDetailDto | null
  departments: DepartmentDto[]
  onClose: () => void
  onSaved: () => Promise<void>
}

function TeamModal({ open, mode, team, departments, onClose, onSaved }: TeamModalProps) {
  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [departmentId, setDepartmentId] = useState<number | ''>('')
  const [teamLeadUserId, setTeamLeadUserId] = useState('')
  const [shift, setShift] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const hasMembers = Boolean(team && team.memberCount > 0)

  const [users, setUsers] = useState<UserDto[]>([])
  const [loadingUsers, setLoadingUsers] = useState(false)

  useEffect(() => {
    if (!open) return

    const fetchUsers = async () => {
      setLoadingUsers(true)
      try {
        const res = await apiClient.get<ApiResponse<import('@/lib/api').PagedResult<UserDto>>>('/admin/users', {
          params: { pageSize: 500, isActive: true }
        })
        if (res.data?.succeeded) {
          setUsers(res.data.data?.items ?? [])
        }
      } catch (err) {
        console.error('Failed to load users for team lead selection', err)
      } finally {
        setLoadingUsers(false)
      }
    }

    void fetchUsers()
  }, [open])

  useEffect(() => {
    if (!open) return
    setError(null)
    if (mode === 'create') {
      setCode('')
      setName('')
      setDepartmentId(departments[0]?.id ?? '')
      setTeamLeadUserId('')
      setShift('')
      setIsActive(true)
      return
    }

    if (team) {
      setCode(team.code)
      setName(team.name)
      setDepartmentId(team.departmentId)
      setTeamLeadUserId(team.teamLeadUserId ?? '')
      setShift(team.shift ?? '')
      setIsActive(team.isActive)
    }
  }, [open, mode, team, departments])

  if (!open) return null

  const submit = async () => {
    setLoading(true)
    setError(null)

    try {
      if (!name.trim() || departmentId === '') {
        setError('Please fill in name and department.')
        return
      }

      if (mode === 'edit' && hasMembers && !isActive) {
        setError('Không thể inactive team khi vẫn còn member.')
        return
      }

      if (mode === 'create') {
        if (!code.trim()) {
          setError('Please fill in code.')
          return
        }

        const payload: CreateTeamDto = {
          code: code.trim(),
          name: name.trim(),
          departmentId: Number(departmentId),
        }
        if (teamLeadUserId.trim()) payload.teamLeadUserId = teamLeadUserId.trim()
        if (shift.trim()) payload.shift = shift.trim()

        const response = await apiClient.post<ApiResponse<TeamDetailDto>>('/teams', payload)
        if (!response.data.succeeded) {
          setError(response.data.message || 'Không thể tạo team.')
          return
        }
      } else {
        if (!team) return

        const payload: UpdateTeamDto = {
          code: code.trim(),
          name: name.trim(),
          departmentId: Number(departmentId),
          isActive,
        }
        if (teamLeadUserId.trim()) payload.teamLeadUserId = teamLeadUserId.trim()
        if (shift.trim()) payload.shift = shift.trim()

        const response = await apiClient.put<ApiResponse<TeamDetailDto>>(`/teams/${team.id}`, payload)
        if (!response.data.succeeded) {
          setError(response.data.message || 'Không thể cập nhật team.')
          return
        }
      }

      await onSaved()
    } catch {
      setError(mode === 'create' ? 'Không thể tạo team.' : 'Không thể cập nhật team.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/40" onClick={onClose} />
      <div className="relative z-10 w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-slate-900">{mode === 'create' ? 'Create team' : 'Edit team'}</h3>
            <p className="text-sm text-slate-500">
              {mode === 'create'
                ? 'Tạo team mới trong một phòng ban.'
                : 'Cập nhật thông tin team hiện tại.'}
            </p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700">
            Close
          </button>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="Code" value={code} onChange={setCode} placeholder="KT-01" disabled={mode === 'edit'} helperText={mode === 'edit' ? 'Code can be kept or updated if API allows.' : undefined} />
          <Field label="Name" value={name} onChange={setName} placeholder="Team Backend" />
          <Field label="Department" value={String(departmentId)} onChange={(value) => setDepartmentId(value ? Number(value) : '')} select>
            <option value="">Select department</option>
            {departments.map((department) => (
              <option key={department.id} value={department.id}>{department.name}</option>
            ))}
          </Field>
          <Field
            label="Team lead"
            value={teamLeadUserId}
            onChange={setTeamLeadUserId}
            select
            helperText={loadingUsers ? 'Loading users...' : undefined}
          >
            <option value="">No team lead</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {`${u.firstName ?? ''} ${u.lastName ?? ''}`.trim() || u.email} ({u.roleName})
              </option>
            ))}
          </Field>
          <Field label="Shift" value={shift} onChange={setShift} select>
            <option value="">Select shift</option>
            <option value="Sáng">Sáng</option>
            <option value="Chiều">Chiều</option>
            <option value="Tối">Tối</option>
          </Field>
          {mode === 'edit' ? (
            <Field
              label="Active"
              value={String(isActive)}
              onChange={(value) => setIsActive(value === 'true')}
              select
              disabled={hasMembers}
              helperText={hasMembers ? 'Không thể inactive team khi vẫn còn member.' : undefined}
            >
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </Field>
          ) : (
            <div />
          )}
        </div>

        {error ? <p className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p> : null}

        <div className="mt-6 flex items-center justify-end gap-3">
          <button type="button" onClick={onClose} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700">
            Cancel
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={loading}
            className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Saving...' : mode === 'create' ? 'Create team' : 'Save changes'}
          </button>
        </div>
      </div>
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  disabled,
  helperText,
  select,
  children,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  helperText?: string
  select?: boolean
  children?: React.ReactNode
}) {
  return (
    <label className="space-y-1.5">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      {select ? (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none disabled:bg-slate-50"
        >
          {children}
        </select>
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none disabled:bg-slate-50"
        />
      )}
      {helperText ? <span className="text-xs text-slate-500">{helperText}</span> : null}
    </label>
  )
}
