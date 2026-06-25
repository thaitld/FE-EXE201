import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { apiClient, type AiExecutionLogDto, type ApiResponse, type AdminUserFilter, type CreateUserDto, type PagedResult, type RoleDto, type TeamDetailDto, type UpdateUserDto, type UserDto } from '@/lib/api'
import { Plus, RefreshCw, Search, Pencil, ShieldCheck, UserRound, AlertCircle } from 'lucide-react'

const DEFAULT_PAGE_SIZE = 10

export function UserManagementPanel() {
  const [users, setUsers] = useState<PagedResult<UserDto> | null>(null)
  const [roles, setRoles] = useState<RoleDto[]>([])
  const [teams, setTeams] = useState<TeamDetailDto[]>([])
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [loadingMeta, setLoadingMeta] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [searchInput, setSearchInput] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [sortBy, setSortBy] = useState('email')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)

  const [createOpen, setCreateOpen] = useState(false)
  const [editUserId, setEditUserId] = useState<string | null>(null)
  const [selectedUser, setSelectedUser] = useState<UserDto | null>(null)
  const [savingUserId, setSavingUserId] = useState<string | null>(null)
  const [confirmUser, setConfirmUser] = useState<UserDto | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const [jobName, setJobName] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [jobLogs, setJobLogs] = useState<AiExecutionLogDto[]>([])
  const [jobSummary, setJobSummary] = useState<unknown>(null)
  const [loadingJobLogs, setLoadingJobLogs] = useState(false)
  const [loadingJobSummary, setLoadingJobSummary] = useState(false)

  const filterKey = useMemo(() => JSON.stringify({ page, pageSize, searchTerm, roleFilter, sortBy, sortOrder }), [page, pageSize, searchTerm, roleFilter, sortBy, sortOrder])

  const loadMeta = async () => {
    setLoadingMeta(true)
    try {
      const [rolesResponse, teamsResponse] = await Promise.all([
        apiClient.get<ApiResponse<RoleDto[]>>('/admin/roles'),
        apiClient.get<ApiResponse<TeamDetailDto[]>>('/admin/teams'),
      ])

      setRoles(rolesResponse.data.data ?? [])
      setTeams(teamsResponse.data.data ?? [])
    } catch (err) {
      setError('Không thể tải danh sách roles/teams.')
    } finally {
      setLoadingMeta(false)
    }
  }

  const loadUsers = async () => {
    setLoadingUsers(true)
    setError(null)
    const params: AdminUserFilter = {
      page,
      pageSize,
      search: searchTerm || undefined,
      role: roleFilter || undefined,
      sortBy,
      sortOrder,
    }

    try {
      const response = await apiClient.get<ApiResponse<PagedResult<UserDto>>>('/admin/users', { params })
      if (response.data.succeeded) {
        setUsers(response.data.data)
      } else {
        setError(response.data.message || 'Không thể tải danh sách user.')
      }
    } catch {
      setError('Không thể tải danh sách user.')
    } finally {
      setLoadingUsers(false)
    }
  }

  const loadJobLogs = async () => {
    setLoadingJobLogs(true)
    try {
      const params: Record<string, string> = {}
      if (jobName.trim()) params.jobName = jobName.trim()
      if (fromDate) params.from = fromDate
      if (toDate) params.to = toDate
      const response = await apiClient.get<ApiResponse<AiExecutionLogDto[]>>('/admin/job-logs', { params })
      setJobLogs(response.data.data ?? [])
    } catch {
      setJobLogs([])
    } finally {
      setLoadingJobLogs(false)
    }
  }

  const loadJobSummary = async () => {
    setLoadingJobSummary(true)
    try {
      const response = await apiClient.get<ApiResponse<unknown>>('/admin/job-logs/summary')
      setJobSummary(response.data.data)
    } catch {
      setJobSummary(null)
    } finally {
      setLoadingJobSummary(false)
    }
  }

  useEffect(() => {
    loadMeta()
  }, [])

  useEffect(() => {
    loadUsers()
  }, [filterKey])

  useEffect(() => {
    loadJobLogs()
    loadJobSummary()
  }, [])

  useEffect(() => {
    if (!editUserId) {
      setSelectedUser(null)
      return
    }

    const loadDetail = async () => {
      try {
        const response = await apiClient.get<ApiResponse<UserDto>>(`/admin/users/${editUserId}`)
        setSelectedUser(response.data.data)
      } catch {
        setSelectedUser(null)
      }
    }

    loadDetail()
  }, [editUserId])

  const submitSearch = (event: React.FormEvent) => {
    event.preventDefault()
    setSearchTerm(searchInput.trim())
    setPage(1)
  }

  const refreshAll = async () => {
    await Promise.all([loadUsers(), loadJobLogs(), loadJobSummary()])
  }

  const toggleUserActive = async (user: UserDto) => {
    setSavingUserId(user.id)
    try {
      const payload: UpdateUserDto = {
        firstName: user.firstName,
        lastName: user.lastName,
        isActive: !user.isActive,
      }
      const response = await apiClient.put<ApiResponse<UserDto>>(`/admin/users/${user.id}`, payload)
      if (response.data.succeeded) {
        await loadUsers()
        showToast(
          user.isActive
            ? 'Vô hiệu hóa tài khoản thành công!'
            : 'Kích hoạt tài khoản thành công!',
          'success'
        )
      } else {
        showToast(response.data.message || 'Không thể cập nhật trạng thái user.', 'error')
      }
    } catch {
      showToast('Không thể cập nhật trạng thái user.', 'error')
    } finally {
      setSavingUserId(null)
    }
  }

  const totalPages = users?.totalPages ?? 1
  const items = users?.items ?? []

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">

          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            <Plus size={16} />
            Create user
          </button>
        </div>

        <form onSubmit={submitSearch} className="mt-6 grid grid-cols-1 gap-3 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <label className="sr-only" htmlFor="search-input">Search</label>
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
              <Search size={16} className="text-slate-400" />
              <input
                id="search-input"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search by email or name"
                className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
              />
            </div>
          </div>

          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value)
              setPage(1)
            }}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none"
          >
            <option value="">All roles</option>
            {roles.map((role) => (
              <option key={role.id} value={role.name}>{role.name}</option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value)
              setPage(1)
            }}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none"
          >
            <option value="email">Sort: Email</option>
            <option value="firstName">Sort: First name</option>
            <option value="lastName">Sort: Last name</option>
            <option value="createdAt">Sort: Created at</option>
          </select>

          <div className="flex gap-2">
            <select
              value={sortOrder}
              onChange={(e) => {
                setSortOrder(e.target.value as 'asc' | 'desc')
                setPage(1)
              }}
              className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none"
            >
              <option value="asc">Asc</option>
              <option value="desc">Desc</option>
            </select>
            <button
              type="submit"
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Apply
            </button>
          </div>
        </form>

        <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-500">
          <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5">
            <ShieldCheck size={14} />
            {loadingMeta ? 'Loading roles/teams...' : `${roles.length} roles, ${teams.length} teams loaded`}
          </span>
          {error ? <span className="rounded-full bg-rose-50 px-3 py-1.5 text-rose-700">{error}</span> : null}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Users</h3>
            <p className="text-sm text-slate-500">
              {users ? `Page ${users.pageNumber} of ${users.totalPages} • ${users.totalCount} total users` : 'Loading users...'}
            </p>
          </div>
          <button
            type="button"
            onClick={refreshAll}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">User</th>
                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Role</th>
                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Team / Department</th>
                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Created</th>
                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loadingUsers ? (
                <tr>
                  <td className="px-6 py-8 text-sm text-slate-500" colSpan={6}>Loading users...</td>
                </tr>
              ) : items.length > 0 ? (
                items.map((user) => (
                  <tr key={user.id} className="border-t border-slate-100">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-blue-600 text-sm font-bold text-white">
                          {user.avatarUrl ? (
                            <img src={user.avatarUrl} alt={user.email} className="h-full w-full object-cover" />
                          ) : (
                            <UserRound size={16} />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{`${user.firstName} ${user.lastName}`.trim() || user.email}</p>
                          <p className="text-sm text-slate-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700">{user.roleName}</td>
                    <td className="px-6 py-4 text-sm text-slate-700">
                      <p>{user.teamName ?? 'No team'}</p>
                      <p className="text-xs text-slate-500">{user.departmentName ?? 'No department'}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700">{new Date(user.createdAt).toLocaleDateString('vi-VN')}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${user.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setEditUserId(user.id)}
                          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                        >
                          <Pencil size={14} />
                          Edit
                        </button>
                        <button
                          type="button"
                          disabled={savingUserId === user.id}
                          onClick={() => setConfirmUser(user)}
                          className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {user.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="px-6 py-8 text-sm text-slate-500" colSpan={6}>No users found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-200 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-500">
            Showing {items.length} of {users?.totalCount ?? 0} users
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={!users?.hasPreviousPage}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>
            <span className="px-2 text-sm text-slate-500">Page {users?.pageNumber ?? page} / {totalPages}</span>
            <button
              type="button"
              onClick={() => setPage((prev) => (users?.hasNextPage ? prev + 1 : prev))}
              disabled={!users?.hasNextPage}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value))
                setPage(1)
              }}
              className="ml-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none"
            >
              {[10, 20, 50].map((size) => (
                <option key={size} value={size}>{size}/page</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-1 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Job log summary</h3>
              <p className="text-sm text-slate-500">Raw summary response from backend.</p>
            </div>
            <button
              type="button"
              onClick={loadJobSummary}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700"
            >
              Refresh
            </button>
          </div>
          <div className="mt-4 rounded-xl bg-slate-50 p-4 text-xs text-slate-700">
            {loadingJobSummary ? 'Loading summary...' : <pre className="whitespace-pre-wrap break-words">{JSON.stringify(jobSummary, null, 2) || 'No summary data'}</pre>}
          </div>
        </div>

        <div className="xl:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Job logs</h3>
              <p className="text-sm text-slate-500">Track background AI processing jobs.</p>
            </div>
            <button
              type="button"
              onClick={loadJobLogs}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700"
            >
              <RefreshCw size={14} />
              Refresh logs
            </button>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
            <input
              value={jobName}
              onChange={(e) => setJobName(e.target.value)}
              placeholder="Job name"
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none"
            />
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none"
            />
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none"
            />
          </div>

          <div className="mt-3 flex justify-end">
            <button
              type="button"
              onClick={loadJobLogs}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
            >
              Apply filters
            </button>
          </div>

          <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200">
            <table className="min-w-full text-left">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Job</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Executed at</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Error</th>
                </tr>
              </thead>
              <tbody>
                {loadingJobLogs ? (
                  <tr><td className="px-4 py-6 text-sm text-slate-500" colSpan={4}>Loading logs...</td></tr>
                ) : jobLogs.length > 0 ? (
                  jobLogs.map((log) => (
                    <tr key={log.id} className="border-t border-slate-100">
                      <td className="px-4 py-3 text-sm font-medium text-slate-800">{log.jobName}</td>
                      <td className="px-4 py-3 text-sm text-slate-700">{log.status}</td>
                      <td className="px-4 py-3 text-sm text-slate-700">{log.executedAt ? new Date(log.executedAt).toLocaleString('vi-VN') : 'N/A'}</td>
                      <td className="px-4 py-3 text-sm text-slate-700">{log.errorMessage ?? '-'}</td>
                    </tr>
                  ))
                ) : (
                  <tr><td className="px-4 py-6 text-sm text-slate-500" colSpan={4}>No job logs found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <UserModal
        open={createOpen || Boolean(editUserId)}
        mode={editUserId ? 'edit' : 'create'}
        user={selectedUser}
        userId={editUserId}
        roles={roles}
        teams={teams}
        onClose={() => {
          setCreateOpen(false)
          setEditUserId(null)
          setSelectedUser(null)
        }}
        onSaved={async () => {
          await loadUsers()
          setCreateOpen(false)
          setEditUserId(null)
          setSelectedUser(null)
        }}
      />

      {/* Confirmation Modal */}
      {confirmUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm animate-fade-in" onClick={() => setConfirmUser(null)} />
          <div className="relative z-10 w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 transform transition-all scale-100">
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              {confirmUser.isActive ? 'Vô hiệu hóa tài khoản?' : 'Kích hoạt tài khoản?'}
            </h3>
            <p className="text-sm text-slate-500 mb-6 leading-relaxed">
              Bạn có chắc chắn muốn {confirmUser.isActive ? 'vô hiệu hóa' : 'kích hoạt'} tài khoản của{' '}
              <span className="font-semibold text-slate-800">
                {`${confirmUser.firstName} ${confirmUser.lastName}`.trim() || confirmUser.email}
              </span>{' '}
              không?
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmUser(null)}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={() => {
                  const targetUser = confirmUser
                  setConfirmUser(null)
                  toggleUserActive(targetUser)
                }}
                className={`rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition ${
                  confirmUser.isActive
                    ? 'bg-rose-600 hover:bg-rose-700 shadow-sm shadow-rose-100'
                    : 'bg-slate-900 hover:bg-slate-800 shadow-sm shadow-slate-200'
                }`}
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 transition-all duration-300">
          <div className={`flex items-center gap-3 px-5 py-4 rounded-xl border shadow-xl ${
            toast.type === 'error'
              ? 'bg-rose-50 border-rose-200 text-rose-800'
              : 'bg-emerald-50 border-emerald-200 text-emerald-800'
          }`}>
            {toast.type === 'error' ? (
              <AlertCircle size={18} className="text-rose-600 shrink-0" />
            ) : (
              <ShieldCheck size={18} className="text-emerald-600 shrink-0" />
            )}
            <span className="text-sm font-semibold">{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  )
}

type UserModalProps = {
  open: boolean
  mode: 'create' | 'edit'
  user: UserDto | null
  userId: string | null
  roles: RoleDto[]
  teams: TeamDetailDto[]
  onClose: () => void
  onSaved: () => Promise<void>
}

function UserModal({ open, mode, user, userId, roles, teams, onClose, onSaved }: UserModalProps) {
  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [roleId, setRoleId] = useState<number | ''>('')
  const [teamId, setTeamId] = useState<number | ''>('')
  const [roleInTeam, setRoleInTeam] = useState('Member')
  const [isActive, setIsActive] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setError(null)

    if (mode === 'create') {
      setEmail('')
      setFirstName('')
      setLastName('')
      setRoleId(roles[0]?.id ?? '')
      setTeamId('')
      setRoleInTeam('Member')
      setIsActive(true)
      return
    }

    if (user) {
      setEmail(user.email)
      setFirstName(user.firstName)
      setLastName(user.lastName)
      setIsActive(user.isActive)
      setRoleId(roles.find((role) => role.name === user.roleName)?.id ?? '')
      setTeamId(teams.find((team) => team.name === user.teamName)?.id ?? '')
      setRoleInTeam(user.roleInTeam ?? 'Member')
    }
  }, [open, mode, user, roles, teams])

  if (!open) return null

  const submit = async () => {
    setLoading(true)
    setError(null)
    try {
      if (mode === 'create') {
        if (!email.trim() || !firstName.trim() || !lastName.trim() || roleId === '') {
          setError('Please fill in email, first name, last name, and role.')
          return
        }

        const payload: CreateUserDto = {
          email: email.trim(),
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          roleId: Number(roleId),
        }
        if (teamId !== '') payload.teamId = Number(teamId)
        if (roleInTeam.trim()) payload.roleInTeam = roleInTeam.trim()

        const response = await apiClient.post<ApiResponse<UserDto>>('/admin/users', payload)
        if (!response.data.succeeded) {
          setError(response.data.message || 'Không thể tạo user.')
          return
        }
      } else {
        if (!userId) return
        if (!firstName.trim() || !lastName.trim()) {
          setError('Please fill in first name and last name.')
          return
        }

        const payload: UpdateUserDto = {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          isActive,
          roleId: roleId !== '' ? Number(roleId) : undefined,
          teamId: teamId !== '' ? Number(teamId) : 0,
          roleInTeam: roleInTeam.trim() || undefined,
        }
        const response = await apiClient.put<ApiResponse<UserDto>>(`/admin/users/${userId}`, payload)
        if (!response.data.succeeded) {
          setError(response.data.message || 'Không thể cập nhật user.')
          return
        }
      }

      await onSaved()
    } catch {
      setError(mode === 'create' ? 'Không thể tạo user.' : 'Không thể cập nhật user.')
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
            <h3 className="text-xl font-bold text-slate-900">{mode === 'create' ? 'Create user' : 'Edit user'}</h3>
            <p className="text-sm text-slate-500">
              {mode === 'create'
                ? 'Create a new account and assign role/team.'
                : 'Update name and active status for the selected user.'}
            </p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700">
            Close
          </button>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
          {mode === 'create' ? (
            <>
              <Field label="Email" value={email} onChange={setEmail} placeholder="name@manto.com" />
              <Field label="Role" value={String(roleId)} onChange={(value) => setRoleId(value ? Number(value) : '')} select>
                <option value="">Select role</option>
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>{role.name}</option>
                ))}
              </Field>
              <Field label="First name" value={firstName} onChange={setFirstName} placeholder="Nguyen" />
              <Field label="Last name" value={lastName} onChange={setLastName} placeholder="Van A" />
              <Field label="Team" value={String(teamId)} onChange={(value) => setTeamId(value ? Number(value) : '')} select>
                <option value="">No team</option>
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>{team.name}</option>
                ))}
              </Field>
              <Field label="Role in team" value={roleInTeam} onChange={setRoleInTeam} select>
                <option value="Member">Member</option>
                <option value="TeamLead">TeamLead</option>
              </Field>
            </>
          ) : (
            <>
              <Field label="Email" value={email} onChange={setEmail} disabled helperText="Email is managed by backend." />
              <Field label="Active" value={String(isActive)} onChange={(value) => setIsActive(value === 'true')} select>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </Field>
              <Field label="First name" value={firstName} onChange={setFirstName} placeholder="Nguyen" />
              <Field label="Last name" value={lastName} onChange={setLastName} placeholder="Van A" />
              <Field label="Role" value={String(roleId)} onChange={(value) => setRoleId(value ? Number(value) : '')} select>
                <option value="">Select role</option>
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>{role.name}</option>
                ))}
              </Field>
              <Field label="Team" value={String(teamId)} onChange={(value) => setTeamId(value ? Number(value) : '')} select>
                <option value="">No team</option>
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>{team.name}</option>
                ))}
              </Field>
              <Field label="Role in team" value={roleInTeam} onChange={setRoleInTeam} select>
                <option value="Member">Member</option>
                <option value="TeamLead">TeamLead</option>
              </Field>
            </>
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
            {loading ? 'Saving...' : mode === 'create' ? 'Create user' : 'Save changes'}
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
  children?: ReactNode
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
