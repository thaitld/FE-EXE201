import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import type { DailyEfficiencyPointDto } from "@/types/employee";

export default function EfficiencyChart({
  data,
}: {
  data: DailyEfficiencyPointDto[];
}) {
  const formatted = data.map((d) => ({
    date: d.date,
    ratio: typeof d.efficiencyRatio === "number" ? d.efficiencyRatio : 0,
  }));

  return (
    <div className="rounded-lg bg-white p-4 shadow-sm">
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={formatted} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis
            dataKey="date"
            tickFormatter={(v) => {
              const d = new Date(v);
              return isNaN(d.getTime()) ? v : d.toLocaleDateString();
            }}
            stroke="#64748b"
            tick={{ fill: "#64748b", fontSize: 12 }}
            tickMargin={10}
          />
          <YAxis 
            domain={[0, 2]} 
            ticks={[0, 0.5, 1, 1.5, 2]} 
            tickFormatter={(v) => Number(v).toFixed(1)} 
            stroke="#64748b"
            tick={{ fill: "#64748b", fontSize: 12 }}
          />
          <Tooltip
            formatter={(value: any) =>
              value === null ? "No data" : (value.toFixed?.(2) ?? value)
            }
            contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)" }}
          />
          <Line
            type="monotone"
            dataKey="ratio"
            stroke="#2563eb"
            strokeWidth={3}
            dot={{ r: 4, fill: "#2563eb", strokeWidth: 0 }}
            activeDot={{ r: 6, strokeWidth: 0 }}
            connectNulls={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
