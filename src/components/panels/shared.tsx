import type { PanelDetail, MetricCard } from './types'

export const MetricCards = ({ metrics }: { metrics: MetricCard[] }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
    {metrics.map((item, idx) => {
      const Icon = item.icon
      return (
        <div key={idx} className="bg-white rounded-lg border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium text-slate-600">{item.label}</p>
            <Icon className="text-slate-500" size={18} />
          </div>
          <p className="text-2xl font-bold text-slate-900 mb-2">{item.value}</p>
          <p className="text-xs text-slate-500">{item.hint}</p>
        </div>
      )
    })}
  </div>
)

export const TrendChart = ({ trend }: { trend: number[] }) => (
  <div className="bg-white rounded-lg border border-slate-200 p-6">
    <h3 className="text-lg font-semibold text-slate-900 mb-4">Weekly Trend</h3>
    <div className="flex items-end gap-2 h-44">
      {trend.map((point, idx) => (
        <div key={idx} className="flex-1 flex flex-col items-center gap-2">
          <div
            className="w-full rounded-t bg-gradient-to-t from-slate-900 to-slate-600"
            style={{ height: `${(point / 100) * 100}%` }}
          />
          <span className="text-[10px] text-slate-500">D{idx + 1}</span>
        </div>
      ))}
    </div>
  </div>
)

export const ProgressBar = ({ items }: { items: { label: string; value: number; color: string }[] }) => (
  <div className="bg-white rounded-lg border border-slate-200 p-6">
    <h3 className="text-lg font-semibold text-slate-900 mb-4">Progress</h3>
    <div className="space-y-4">
      {items.map((item) => (
        <div key={item.label}>
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-medium text-slate-600">{item.label}</p>
            <span className="text-xs font-semibold text-slate-800">{item.value}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
            <div className={`h-full ${item.color}`} style={{ width: `${item.value}%` }} />
          </div>
        </div>
      ))}
    </div>
  </div>
)

export const DataTable = ({ columns, rows }: { columns: string[]; rows: string[][] }) => (
  <div className="bg-white rounded-lg border border-slate-200 p-6 overflow-x-auto">
    <h3 className="text-lg font-semibold text-slate-900 mb-4">Data Table</h3>
    <table className="w-full text-left min-w-[560px]">
      <thead>
        <tr className="border-b border-slate-200">
          {columns.map((column) => (
            <th key={column} className="py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              {column}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, rowIdx) => (
          <tr key={rowIdx} className="border-b border-slate-100 last:border-0">
            {row.map((cell, cellIdx) => (
              <td key={cellIdx} className="py-3 text-sm text-slate-700">
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)

export const PanelLayout = ({
  metrics,
  details,
}: {
  metrics: MetricCard[]
  details: PanelDetail
}) => (
  <div className="space-y-6">
    <MetricCards metrics={metrics} />

    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div className="xl:col-span-2">
        <TrendChart trend={details.trend} />
      </div>
      <div>
        <ProgressBar items={details.progress} />
      </div>
    </div>

    <DataTable columns={details.columns} rows={details.rows} />
  </div>
)
