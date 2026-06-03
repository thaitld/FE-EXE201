import { useEffect, useState } from 'react'
import { listBurnoutSignals, resolveBurnoutSignal } from '../api'
import type { BurnoutSignalDto } from '../types'
import { Activity, Filter, CheckCircle2, AlertTriangle, ChevronDown } from 'lucide-react'

const riskConfig: Record<string, { badge: string; dot: string; row: string }> = {
  HIGH:   { badge: 'bg-rose-500/15 text-rose-400 border border-rose-500/20',   dot: 'bg-rose-500',   row: 'border-rose-500/10 hover:border-rose-500/25' },
  MEDIUM: { badge: 'bg-amber-400/12 text-amber-400 border border-amber-400/20', dot: 'bg-amber-400',  row: 'border-amber-400/10 hover:border-amber-400/25' },
  LOW:    { badge: 'bg-emerald-400/12 text-emerald-400 border border-emerald-400/20', dot: 'bg-emerald-400', row: 'border-white/5 hover:border-white/12' },
}

export default function BurnoutMonitorPage() {
  const [signals, setSignals] = useState<BurnoutSignalDto[]>([])
  const [riskLevel, setRiskLevel] = useState('HIGH')
  const [resolvedOnly, setResolvedOnly] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const load = async () => {
    setError(null)
    setLoading(true)
    try {
      const response = await listBurnoutSignals({ riskLevel, isResolved: resolvedOnly, page: 1, pageSize: 20 })
      setSignals(response?.items ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load burnout signals')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { void load() }, [])

  const resolve = async (signalId: number) => {
    const resolutionNote = window.prompt('Resolution note')
    if (!resolutionNote) return
    await resolveBurnoutSignal(signalId, { resolutionNote })
    await load()
  }

  const high = signals.filter(s => s.riskLevel === 'HIGH').length
  const open = signals.filter(s => !s.isResolved).length

  return (
    <div className="space-y-6">
      {/* Stats strip */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Tổng tín hiệu', value: signals.length, color: 'text-slate-100' },
          { label: 'Rủi ro cao', value: high, color: 'text-rose-400' },
          { label: 'Chưa xử lý', value: open, color: 'text-amber-400' },
        ].map(s => (
          <div key={s.label} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <p className="text-[10px] uppercase tracking-widest text-slate-500">{s.label}</p>
            <p className={`mt-1 text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-end gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
        <div className="flex items-center gap-2 text-slate-500">
          <Filter size={14} />
          <span className="text-xs font-semibold uppercase tracking-widest">Bộ lọc</span>
        </div>
        <div className="flex flex-wrap gap-3 ml-auto">
          <div className="relative">
            <select
              value={riskLevel}
              onChange={(e) => setRiskLevel(e.target.value)}
              className="form-select"
            >
              {['HIGH', 'MEDIUM', 'LOW'].map(item => (
                <option key={item}>{item}</option>
              ))}
            </select>
            <ChevronDown size={12} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>

          <label className="flex items-center gap-2.5 cursor-pointer select-none">
            <div
              onClick={() => setResolvedOnly(v => !v)}
              className={`h-5 w-9 rounded-full transition-colors ${resolvedOnly ? 'bg-cyan-400' : 'bg-white/10'} relative`}
            >
              <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${resolvedOnly ? 'translate-x-4' : 'translate-x-0.5'}`} />
            </div>
            <span className="text-xs text-slate-400">Đã xử lý</span>
          </label>

          <button
            type="button"
            onClick={() => void load()}
            disabled={loading}
            className="form-cta"
          >
            {loading ? 'Đang tải...' : 'Áp dụng'}
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
          <AlertTriangle size={15} className="shrink-0" />
          {error}
        </div>
      )}

      {/* Signal cards */}
      {signals.length === 0 && !loading ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white py-14 text-slate-500">
          <Activity size={28} className="mb-3 opacity-40" />
          <p className="text-sm">Không có tín hiệu nào.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {signals.map(signal => {
            const cfg = riskConfig[signal.riskLevel] ?? riskConfig.LOW
            return (
              <div
                key={signal.id}
                className={`rounded-2xl border bg-white px-5 py-4 transition-colors shadow-sm ${cfg.row.replace('border-white/5', 'border-slate-200').replace('hover:border-white/12', 'hover:border-slate-300')}`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${cfg.dot}`} />
                    <div>
                      <p className="font-semibold text-slate-900">{signal.userName}</p>
                      <p className="mt-0.5 text-xs text-slate-500">{signal.team ?? 'No team'} · Phát hiện {signal.detectedDate}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className={`rounded-lg px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest ${cfg.badge}`}>
                      {signal.riskLevel}
                    </span>
                    <span className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
                      Score {signal.riskScore}
                    </span>
                    {signal.isResolved ? (
                      <span className="flex items-center gap-1 text-xs text-emerald-400">
                        <CheckCircle2 size={13} /> Đã xử lý
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => void resolve(signal.id)}
                        className="rounded-xl bg-emerald-400/15 border border-emerald-400/25 px-3 py-1.5 text-xs font-semibold text-emerald-400 transition hover:bg-emerald-400/25 active:scale-95"
                      >
                        Xử lý
                      </button>
                    )}
                  </div>
                </div>
                {signal.triggerFactors.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5 pl-5">
                    {signal.triggerFactors.map(f => (
                      <span key={f} className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] text-slate-500">{f}</span>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}