import { useEffect, useState } from 'react'
import { apiClient, type ApiResponse, type CreateDepartmentDto, type DepartmentDto, type UpdateDepartmentDto, type UserDto } from '@/lib/api'
import { Plus, RefreshCw, Search } from 'lucide-react'
import { usePermission } from '@/features/auth/usePermission'

export const DepartmentsPanel = () => {
  const { isAdmin } = usePermission()
  const [departments, setDepartments] = useState<DepartmentDto[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchInput, setSearchInput] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<DepartmentDto | null>(null)
  const [name, setName] = useState('')
  const [managerUserId, setManagerUserId] = useState('')

  const [users, setUsers] = useState<UserDto[]>([])
  const [loadingUsers, setLoadingUsers] = useState(false)

  useEffect(() => {
    if (!modalOpen) return

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
        console.error('Failed to load users for department manager selection', err)
      } finally {
        setLoadingUsers(false)
      }
    }

    void fetchUsers()
  }, [modalOpen])

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await apiClient.get<ApiResponse<DepartmentDto[]>>('/departments')
      setDepartments(response.data.data ?? [])
    } catch {
      setError('Không thể tải danh sách phòng ban.')
      setDepartments([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearchTerm(searchInput)
  }

  const openCreate = () => {
    setEditing(null)
    setName('')
    setManagerUserId('')
    setModalOpen(true)
  }

  const openEdit = (dep: DepartmentDto) => {
    setEditing(dep)
    setName(dep.name)
    setManagerUserId(dep.managerUserId ?? '')
    setModalOpen(true)
  }

  const save = async () => {
    try {
      if (!name.trim()) {
        setError('Tên phòng ban không được để trống.')
        return
      }

      if (editing) {
        const payload: UpdateDepartmentDto = { name: name.trim(), managerUserId: managerUserId || undefined }
        const res = await apiClient.put<ApiResponse<DepartmentDto>>(`/departments/${editing.id}`, payload)
        if (!res.data.succeeded) throw new Error(res.data.message || 'Error')
      } else {
        const payload: CreateDepartmentDto = { name: name.trim(), managerUserId: managerUserId || undefined }
        const res = await apiClient.post<ApiResponse<DepartmentDto>>('/departments', payload)
        if (!res.data.succeeded) throw new Error(res.data.message || 'Error')
      }

      setModalOpen(false)
      await load()
    } catch (err) {
      setError((err as Error).message || 'Không thể lưu phòng ban.')
    }
  }

  const remove = async (dep: DepartmentDto) => {
    if (!confirm(`Xóa phòng ban "${dep.name}"?`)) return
    try {
      const res = await apiClient.delete<ApiResponse<void>>(`/departments/${dep.id}`)
      if (!res.data.succeeded) throw new Error(res.data.message || 'Error')
      await load()
    } catch {
      setError('Không thể xóa phòng ban.')
    }
  }

  const filtered = departments.filter((d) => d.name.toLowerCase().includes(searchTerm.trim().toLowerCase()))

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Departments</h2>
            <p className="text-sm text-slate-500">Quản lý phòng ban trong công ty.</p>
          </div>
          <div className="flex items-center gap-2">
            <form onSubmit={submitSearch} className="flex items-center gap-2">
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
                <Search size={16} className="text-slate-400" />
                <input value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder="Search departments" className="bg-transparent outline-none text-sm" />
              </div>
            </form>
            {isAdmin() && (
              <button onClick={openCreate} className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white">
                <Plus size={16} /> Create
              </button>
            )}
            <button onClick={load} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm">
              <RefreshCw size={14} /> Refresh
            </button>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500">ID</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500">Name</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500">Manager</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500">Teams</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500">Status</th>
                {isAdmin() && (
                  <th className="px-6 py-3 text-xs font-semibold text-slate-500 text-right">Actions</th>
                )}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={isAdmin() ? 6 : 5} className="px-6 py-8 text-sm text-slate-500">Loading...</td></tr>
              ) : filtered.length > 0 ? (
                filtered.map((d) => (
                  <tr key={d.id} className="border-t border-slate-100">
                    <td className="px-6 py-4">#{d.id}</td>
                    <td className="px-6 py-4 font-semibold">{d.name}</td>
                    <td className="px-6 py-4">{d.managerName ?? '-'}</td>
                    <td className="px-6 py-4">{d.teamCount}</td>
                    <td className="px-6 py-4">{d.isActive ? 'Active' : 'Inactive'}</td>
                    {isAdmin() && (
                      <td className="px-6 py-4 text-right">
                        <div className="inline-flex gap-2">
                          <button onClick={() => openEdit(d)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm">Edit</button>
                          <button onClick={() => remove(d)} className="rounded-lg border border-rose-200 px-3 py-2 text-sm text-rose-700">Delete</button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr><td colSpan={isAdmin() ? 6 : 5} className="px-6 py-8 text-sm text-slate-500">No departments found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/40" onClick={() => setModalOpen(false)} />
          <div className="relative z-10 w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-bold">{editing ? 'Edit department' : 'Create department'}</h3>
            <div className="mt-4 grid grid-cols-1 gap-3">
              <label className="space-y-1">
                <span className="text-sm font-medium">Name</span>
                <input value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-xl border px-3 py-2" />
              </label>
              <label className="space-y-1">
                <span className="text-sm font-medium">Manager</span>
                {loadingUsers ? (
                  <p className="text-xs text-slate-500">Loading users...</p>
                ) : (
                  <select
                    value={managerUserId}
                    onChange={(e) => setManagerUserId(e.target.value)}
                    className="w-full rounded-xl border px-3 py-2 bg-white text-sm outline-none"
                  >
                    <option value="">No manager (blank)</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {`${u.firstName ?? ''} ${u.lastName ?? ''}`.trim() || u.email} ({u.roleName})
                      </option>
                    ))}
                  </select>
                )}
              </label>
              {error ? <p className="text-rose-600">{error}</p> : null}
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setModalOpen(false)} className="rounded-xl border px-4 py-2">Cancel</button>
              <button onClick={save} className="rounded-xl bg-slate-900 px-4 py-2 text-white">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DepartmentsPanel
