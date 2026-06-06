import { TrendingUp } from 'lucide-react'
import { type DailyEfficiencyPointDto, type MonthlyKpiPointDto } from '@/lib/api'

// ─── MetricCard ───────────────────────────────────────────────────────────────
export function MetricCard({
  label, value, hint, icon: Icon, iconClassName,
}: {
  label: string; value: string; hint: string
  icon: React.ComponentType<{ size?: number; className?: string }>
  iconClassName?: string
}) {
  return (
    <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
      <div className="flex items-center justify-between gap-4">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
        <div className="rounded-lg bg-slate-50 p-1.5">
          <Icon size={15} className={iconClassName} />
        </div>
      </div>
      <p className="mt-3 text-2xl font-bold tracking-tight text-slate-800">{value}</p>
      <p className="mt-1 text-xs text-slate-400">{hint}</p>
    </div>
  )
}

// ─── InfoPill ─────────────────────────────────────────────────────────────────
export function InfoPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-100 bg-slate-50/30 px-4 py-2.5">
      <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
      <p className="mt-0.5 text-xs font-semibold text-slate-700">{value}</p>
    </div>
  )
}

// ─── StatRow ──────────────────────────────────────────────────────────────────
export function StatRow({ label, value, tone }: { label: string; value: number | string; tone: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-50 bg-white px-4 py-3 shadow-sm">
      <span className="text-xs font-medium text-slate-500">{label}</span>
      <span className={`text-sm font-bold ${tone}`}>{value}</span>
    </div>
  )
}

// ─── SmallStat ────────────────────────────────────────────────────────────────
export function SmallStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-100/60 bg-slate-50/50 px-3 py-2 text-center">
      <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
      <p className="text-xs font-bold text-slate-700 mt-0.5">{value}</p>
    </div>
  )
}

// ─── EmptyBlock ───────────────────────────────────────────────────────────────
export function EmptyBlock({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 px-4 py-6 text-sm text-slate-400 text-center font-medium">
      {message}
    </div>
  )
}

// ─── HeroChip ─────────────────────────────────────────────────────────────────
export function HeroChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-white px-4 py-3 shadow-sm">
      <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
      <p className="mt-0.5 text-sm font-bold text-slate-800">{value}</p>
    </div>
  )
}

// ─── SimpleTrendChart — Line chart với gradient fill ─────────────────────────
export function SimpleTrendChart({
  title, description, points,
}: {
  title: string; description: string; points: DailyEfficiencyPointDto[]
}) {
  const CHART_H = 160
  const LABEL_H = 40
  const SVG_H = CHART_H + LABEL_H
  const BAR_W = 36
  const GAP = 6
  const svgW = Math.max(points.length * (BAR_W + GAP), 300)

  const maxVal = Math.max(...points.map((p) => p.efficiencyRatio ?? 0), 0.01)

  // Build line path
  const coords = points.map((p, i) => {
    const ratio = p.efficiencyRatio ?? 0
    const x = i * (BAR_W + GAP) + BAR_W / 2
    const y = CHART_H - Math.max((ratio / maxVal) * CHART_H * 0.85, 4)
    return { x, y, p }
  })

  const linePath = coords.length > 1
    ? coords.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x} ${c.y}`).join(' ')
    : ''

  const areaPath = coords.length > 1
    ? `${linePath} L ${coords[coords.length - 1].x} ${CHART_H} L ${coords[0].x} ${CHART_H} Z`
    : ''

  const gradId = `eff-grad-${title.replace(/\s+/g, '')}`

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-700">{title}</p>
          <p className="mt-0.5 text-xs text-slate-400">{description}</p>
        </div>
        <TrendingUp size={16} className="text-cyan-600" />
      </div>

      {points.length === 0 ? (
        <div className="mt-5 flex h-40 items-center justify-center text-sm text-slate-400 rounded-xl border border-dashed border-slate-200">Không có dữ liệu.</div>
      ) : (
        <div className="mt-5 overflow-x-auto">
          <svg width={svgW} height={SVG_H} className="block">
            <defs>
              <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0891b2" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#0891b2" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Grid lines */}
            {[0.25, 0.5, 0.75].map((f) => {
              const y = CHART_H - CHART_H * 0.85 * f
              return (
                <line key={f} x1={0} y1={y} x2={svgW} y2={y}
                  stroke="#f1f5f9" strokeWidth={1} />
              )
            })}

            {/* Area fill */}
            {areaPath && <path d={areaPath} fill={`url(#${gradId})`} />}

            {/* Line */}
            {linePath && (
              <path d={linePath} fill="none" stroke="#0891b2" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
            )}

            {/* Dots + labels */}
            {coords.map(({ x, y, p }) => (
              <g key={p.date}>
                <circle cx={x} cy={y} r={3} fill="#0891b2" />
                <circle cx={x} cy={y} r={5} fill="#0891b2" fillOpacity={0.15} />
                <text x={x} y={CHART_H + 16} textAnchor="middle" fontSize={10} fill="#94a3b8" fontWeight={500}>
                  {new Date(p.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
                </text>
              </g>
            ))}
          </svg>
        </div>
      )}
    </div>
  )
}

// ─── TripleTrendChart — Line chart 3 trục với gradient fills ─────────────────
export function TripleTrendChart({
  title, description, points,
}: {
  title: string; description: string; points: MonthlyKpiPointDto[]
}) {
  const CHART_H = 200
  const LABEL_H = 28
  const SVG_H = CHART_H + LABEL_H
  const SLOT_W = 52
  const svgW = Math.max(points.length * SLOT_W, 260)

  const maxEff    = Math.max(...points.map((p) => p.avgEfficiency ?? 0), 0.01)
  const maxMorale = Math.max(...points.map((p) => p.avgMorale ?? 0), 0.01)
  const maxStress = Math.max(...points.map((p) => p.avgStress ?? 0), 0.01)

  const makePath = (vals: number[], max: number) => {
    const pts = vals.map((v, i) => ({
      x: i * SLOT_W + SLOT_W / 2,
      y: CHART_H - Math.max((v / max) * CHART_H * 0.88, 3),
    }))
    if (pts.length < 2) return { line: '', area: '' }
    const line = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
    const area = `${line} L ${pts[pts.length - 1].x} ${CHART_H} L ${pts[0].x} ${CHART_H} Z`
    return { line, area, pts }
  }

  const effPath    = makePath(points.map((p) => p.avgEfficiency ?? 0), maxEff)
  const moralePath = makePath(points.map((p) => p.avgMorale ?? 0), maxMorale)
  const stressPath = makePath(points.map((p) => p.avgStress ?? 0), maxStress)

  const uid = title.replace(/\s+/g, '')

  return (
    <div>
      <div className="flex items-center justify-between gap-4 flex-wrap pb-2 border-b border-slate-50">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-700">{title}</p>
          <p className="mt-0.5 text-xs text-slate-400">{description}</p>
        </div>
        <div className="flex items-center gap-3 text-[10px] font-semibold uppercase tracking-wider">
          <span className="flex items-center gap-1.5 text-slate-500">
            <span className="h-2 w-2 rounded bg-cyan-500 inline-block" />Efficiency
          </span>
          <span className="flex items-center gap-1.5 text-slate-500">
            <span className="h-2 w-2 rounded bg-emerald-500 inline-block" />Morale
          </span>
          <span className="flex items-center gap-1.5 text-slate-500">
            <span className="h-2 w-2 rounded bg-amber-500 inline-block" />Stress
          </span>
        </div>
      </div>

      {points.length === 0 ? (
        <div className="mt-6 flex h-40 items-center justify-center rounded-xl border border-dashed border-slate-200 text-sm text-slate-400">
          Chưa có dữ liệu xu hướng.
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <svg width={svgW} height={SVG_H} className="block">
            <defs>
              <linearGradient id={`eff-${uid}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.12" />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
              </linearGradient>
              <linearGradient id={`mor-${uid}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.10" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
              </linearGradient>
              <linearGradient id={`str-${uid}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.10" />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Gridlines */}
            {[0.25, 0.5, 0.75, 1].map((f) => {
              const y = CHART_H - CHART_H * 0.88 * f
              return (
                <line key={f} x1={0} y1={y} x2={svgW} y2={y}
                  stroke="#f1f5f9" strokeWidth={1} />
              )
            })}

            {/* Area fills */}
            {effPath.area    && <path d={effPath.area}    fill={`url(#eff-${uid})`} />}
            {moralePath.area && <path d={moralePath.area} fill={`url(#mor-${uid})`} />}
            {stressPath.area && <path d={stressPath.area} fill={`url(#str-${uid})`} />}

            {/* Lines */}
            {effPath.line    && <path d={effPath.line}    fill="none" stroke="#06b6d4" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />}
            {moralePath.line && <path d={moralePath.line} fill="none" stroke="#10b981" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />}
            {stressPath.line && <path d={stressPath.line} fill="none" stroke="#f59e0b" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />}

            {/* Dots */}
            {effPath.pts?.map((pt, i) => (
              <circle key={`e${i}`} cx={pt.x} cy={pt.y} r={2.5} fill="#06b6d4" />
            ))}
            {moralePath.pts?.map((pt, i) => (
              <circle key={`m${i}`} cx={pt.x} cy={pt.y} r={2.5} fill="#10b981" />
            ))}
            {stressPath.pts?.map((pt, i) => (
              <circle key={`s${i}`} cx={pt.x} cy={pt.y} r={2.5} fill="#f59e0b" />
            ))}

            {/* Month labels */}
            {points.map((point, i) => (
              <text
                key={`${point.year}-${point.month}`}
                x={i * SLOT_W + SLOT_W / 2}
                y={CHART_H + 18}
                textAnchor="middle"
                fontSize={10}
                fontWeight={600}
                fill="#94a3b8"
              >
                T{point.month}
              </text>
            ))}
          </svg>
        </div>
      )}
    </div>
  )
}