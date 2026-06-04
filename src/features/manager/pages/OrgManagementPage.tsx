import { useEffect, useState } from 'react'
import {
  createDepartment, createTeam, deleteWorkSchedule,
  getWorkSchedule, listDepartments, listTeams, updateWorkSchedule,
} from '../api'
import type { DepartmentDto, TeamDetailDto, WorkScheduleDto } from '../types'
import { Building2, Users, Clock, Plus, Check, Trash2, AlertTriangle, CheckCircle2 } from 'lucide-react'

export default function OrgManagementPage() {
  const [departments, setDepartments] = useState<DepartmentDto[]>([])
  const [teams, setTeams] = useState<TeamDetailDto[]>([])
  const [selectedTeamId, setSelectedTeamId] = useState<number | ''>('')
  const [schedule, setSchedule] = useState<WorkScheduleDto | null>(null)
  const [deptName, setDeptName] = useState('')
  const [teamCode, setTeamCode] = useState('')
  const [teamName, setTeamName] = useState('')
  const [departmentId, setDepartmentId] = useState<number | ''>('')
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const flash = (msg: string) => { setMessage(msg); setTimeout(() => setMessage(null), 3000) }

  const refresh = async () => {
    const [departmentItems, teamItems] = await Promise.all([listDepartments(), listTeams()])
    setDepartments(departmentItems)
    setTeams(teamItems)
    if (teamItems[0] && !selectedTeamId) setSelectedTeamId(teamItems[0].id)
    if (departmentItems[0] && !departmentId) setDepartmentId(departmentItems[0].id)
  }

  useEffect(() => { refresh().catch((err: Error) => setError(err.message)) }, [])

  useEffect(() => {
    if (!selectedTeamId) return
    getWorkSchedule(Number(selectedTeamId)).then(setSchedule).catch(() => setSchedule(null))
  }, [selectedTeamId])

  const saveDepartment = async () => {
    if (!deptName.trim()) return
    await createDepartment({ name: deptName.trim() })
    setDeptName(''); flash('Phòng ban đã được tạo')
    await refresh()
  }

  const saveTeam = async () => {
    if (!teamCode.trim() || !teamName.trim() || !departmentId) return
    await createTeam({ code: teamCode.trim(), name: teamName.trim(), departmentId: Number(departmentId) })
    setTeamCode(''); setTeamName(''); flash('Team đã được tạo')
    await refresh()
  }

  const saveSchedule = async () => {
    if (!selectedTeamId || !schedule) return
    await updateWorkSchedule(Number(selectedTeamId), {
      workStart: schedule.workStart, workEnd: schedule.workEnd,
      lunchStart: schedule.lunchStart, lunchEnd: schedule.lunchEnd,
    })
    flash('Lịch làm việc đã cập nhật')
  }

  const scheduleFields: (keyof WorkScheduleDto)[] = ['workStart', 'workEnd', 'lunchStart', 'lunchEnd']
  const scheduleLabels: Record<string, string> = {
    workStart: 'Giờ bắt đầu', workEnd: 'Giờ kết thúc',
    lunchStart: 'Nghỉ trưa bắt đầu', lunchEnd: 'Nghỉ trưa kết thúc',
  }

  return (
    <div className="space-y-5">
      {/* Feedback */}
      {message && (
        <div className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          <CheckCircle2 size={15} className="shrink-0" />{message}
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
          <AlertTriangle size={15} className="shrink-0" />{error}
        </div>
      )}

      <div className="grid gap-5 xl:grid-cols-3">
        {/* Departments */}
        <Panel icon={<Building2 size={15} className="text-cyan-400" />} title="Phòng ban">
          <div className="space-y-2">
            {departments.map(dept => (
              <div key={dept.id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5">
                <p className="text-sm font-semibold text-slate-900">{dept.name}</p>
                <span className="text-xs text-slate-500">{dept.teamCount} teams</span>
              </div>
            ))}
          </div>
          <div className="mt-4 space-y-2.5">
            <input
              value={deptName}
              onChange={e => setDeptName(e.target.value)}
              placeholder="Tên phòng ban mới"
              onKeyDown={e => e.key === 'Enter' && void saveDepartment()}
              className="form-input"
            />
            <button
              type="button"
              onClick={() => void saveDepartment()}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-cyan-200 bg-cyan-50 py-2 text-sm font-semibold text-cyan-700 transition hover:bg-cyan-100"
            >
              <Plus size={14} /> Tạo phòng ban
            </button>
          </div>
        </Panel>

        {/* Teams */}
        <Panel icon={<Users size={15} className="text-indigo-400" />} title="Các team">
          <div className="max-h-40 space-y-1.5 overflow-y-auto pr-1">
            {teams.map(team => (
              <button
                key={team.id}
                type="button"
                onClick={() => setSelectedTeamId(team.id)}
                className={`w-full rounded-xl border px-3.5 py-2.5 text-left text-sm transition ${
                  selectedTeamId === team.id
                    ? 'border-indigo-300 bg-indigo-50 text-indigo-700'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                }`}
              >
                <span className="font-mono text-xs text-slate-400 mr-2">{team.code}</span>
                {team.name}
              </button>
            ))}
          </div>
          <div className="mt-4 space-y-2.5">
            <input
              value={teamCode}
              onChange={e => setTeamCode(e.target.value)}
              placeholder="Mã team (VD: ENG-01)"
              className="form-input"
            />
            <input
              value={teamName}
              onChange={e => setTeamName(e.target.value)}
              placeholder="Tên team"
              className="form-input"
            />
            <div className="relative">
              <select
                value={departmentId}
                onChange={e => setDepartmentId(e.target.value ? Number(e.target.value) : '')}
                className="form-select"
              >
                <option value="">Phòng ban</option>
                {departments.map(dept => <option key={dept.id} value={dept.id}>{dept.name}</option>)}
              </select>
            </div>
            <button
              type="button"
              onClick={() => void saveTeam()}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 py-2 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-100"
            >
              <Plus size={14} /> Tạo team
            </button>
          </div>
        </Panel>

        {/* Work schedule */}
        <Panel icon={<Clock size={15} className="text-emerald-400" />} title="Lịch làm việc">
          {!schedule ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Clock size={24} className="mb-2 text-slate-400" />
              <p className="text-xs text-slate-500">Chọn một team để xem lịch.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {scheduleFields.map(field => (
                <label key={field} className="block">
                  <span className="mb-1.5 block text-[10px] uppercase tracking-widest text-slate-500">
                    {scheduleLabels[field]}
                  </span>
                  <input
                    value={schedule[field]}
                    onChange={e => setSchedule({ ...schedule, [field]: e.target.value })}
                    className="h-9 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-emerald-400/60"
                  />
                </label>
              ))}
              <button
                type="button"
                onClick={() => void saveSchedule()}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100"
              >
                <Check size={14} /> Lưu lịch
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (!selectedTeamId) return
                  await deleteWorkSchedule(Number(selectedTeamId))
                  setSchedule(null); flash('Đã xoá lịch làm việc')
                }}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-rose-200 bg-white py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-50"
              >
                <Trash2 size={14} /> Xoá lịch
              </button>
            </div>
          )}
        </Panel>
      </div>
    </div>
  )
}

function Panel({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2.5 mb-5">
        {icon}
        <h3 className="text-sm font-semibold text-slate-900">{title} </h3>
      </div>
      {children}
    </div>
  )
}