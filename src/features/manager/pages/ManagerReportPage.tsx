import { useEffect, useState } from 'react'
import { getManagerReport, listDepartments } from '../api'
import type { DepartmentDto, ManagerReportDto } from '../types'
import { Sparkles, AlertTriangle, ChevronDown, Clock } from 'lucide-react'

const mondayOfWeek = () => {
  const now = new Date()
  const day = now.getDay() || 7
  now.setDate(now.getDate() - day + 1)
  return now.toISOString().slice(0, 10)
}

export default function ManagerReportPage() {
  const [departments, setDepartments] = useState<DepartmentDto[]>([])
  const [deptId, setDeptId] = useState<number | ''>('')
  const [weekStart, setWeekStart] = useState(mondayOfWeek())
  const [report, setReport] = useState<ManagerReportDto | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    listDepartments().then(items => {
      setDepartments(items)
      if (items[0]) setDeptId(items[0].id)
    }).catch((err: Error) => setError(err.message))
  }, [])

  const load = async () => {
    if (!deptId) return
    setLoading(true); setError(null)
    try {
      setReport(await getManagerReport(Number(deptId), weekStart))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load manager report')
    } finally { setLoading(false) }
  }

  return (
    <div className="space-y-5">
      {/* Controls */}
      <div className="flex flex-wrap items-end gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
        <div className="flex items-center gap-2.5 mr-1">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-400/12">
            <Sparkles size={13} className="text-violet-400" />
          </div>
          <span className="text-xs font-semibold text-slate-300">AI Report</span>
        </div>

        <div className="flex flex-wrap gap-3 ml-auto">
          <div className="relative">
            <select
              value={deptId}
              onChange={e => {
                setDeptId(e.target.value ? Number(e.target.value) : '')
                setReport(null)
              }}
              className="h-9 appearance-none rounded-xl border border-slate-300 bg-white pl-3 pr-8 text-sm text-slate-900 outline-none focus:border-violet-400/60"
            >
              <option value="">Phòng ban</option>
              {departments.map(dept => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </select>
            <ChevronDown size={12} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>

          <input
            type="date"
            value={weekStart}
            onChange={e => {
              setWeekStart(e.target.value)
              setReport(null)
            }}
            className="h-9 rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-violet-400/60"
          />

          <button
            type="button"
            onClick={() => void load()}
            disabled={loading || !deptId}
            className="h-9 rounded-xl bg-violet-500 px-4 text-sm font-semibold text-white transition hover:bg-violet-400 active:scale-95 disabled:opacity-40"
          >
            {loading ? 'Đang tạo...' : 'Tạo báo cáo'}
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
          <AlertTriangle size={15} className="shrink-0" />{error}
        </div>
      )}

      {!report && !loading && !error && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white py-16 shadow-sm">
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-500/15">
            <Sparkles size={18} className="text-violet-400" />
          </div>
          <p className="text-sm font-semibold text-slate-700">Chọn phòng ban rồi bấm “Tạo báo cáo”</p>
          <p className="mt-1 text-xs text-slate-400">Báo cáo chỉ tạo khi bạn chủ động chạy nút bên trên.</p>
        </div>
      )}

      {loading && !report && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white py-16 shadow-sm">
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-500/15">
            <Sparkles size={18} className="animate-pulse text-violet-400" />
          </div>
          <p className="text-sm text-slate-500">Đang tạo AI report…</p>
          <p className="mt-1 text-xs text-slate-400">Có thể mất 10–30 giây</p>
        </div>
      )}

      {report && (
        <div className="grid gap-5 xl:grid-cols-[1fr_280px]">
          {/* Report content */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-3 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-500/15">
                  <Sparkles size={13} className="text-violet-400" />
                </div>
                <h3 className="text-sm font-semibold text-slate-900">Báo cáo AI</h3>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <Clock size={12} />
                {report.generatedAt}
              </div>
            </div>
            {/* Render report lines with simple markdown-like styling */}
            <div className="prose-sm max-w-none space-y-2">
              {report.aiReport.split('\n').map((line, i) => {
                if (line.startsWith('## '))
                  return <h2 key={i} className="mt-4 text-sm font-bold text-slate-900">{line.replace('## ', '')}</h2>
                if (line.startsWith('# '))
                  return <h1 key={i} className="mt-4 text-base font-bold text-slate-900">{line.replace('# ', '')}</h1>
                if (line.startsWith('- '))
                  return (
                    <div key={i} className="flex gap-2 text-sm text-slate-600">
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-violet-400" />
                      {line.replace('- ', '')}
                    </div>
                  )
                if (line.trim() === '') return <div key={i} className="h-2" />
                return <p key={i} className="text-sm leading-relaxed text-slate-600">{line}</p>
              })}
            </div>
          </div>

          {/* Meta panel */}
          <div className="space-y-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-4">Thông tin báo cáo</h3>
              <div className="space-y-3 text-sm">
                {[
                  { label: 'Department ID', value: String(report.departmentId) },
                  { label: 'Department', value: report.departmentName },
                  { label: 'Tuần', value: report.weekLabel },
                  { label: 'Tạo lúc', value: report.generatedAt },
                ].map(item => (
                  <div key={item.label} className="flex flex-col gap-0.5">
                    <span className="text-[10px] uppercase tracking-widest text-slate-500">{item.label}</span>
                    <span className="font-semibold text-slate-900">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}