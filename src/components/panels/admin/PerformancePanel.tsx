import { useEffect, useState } from "react";
import {
  TrendingUp,
  Clock,
  CheckCircle2,
  Loader2,
  RefreshCw,
  CalendarDays,
  Info,
} from "lucide-react";
import { getMyPerformanceRange } from "@/lib/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

// Helper to format DateOnly strings
function toDateString(d: Date) {
  return d.toISOString().slice(0, 10);
}

// Color-coding based on efficiencyRatio
const getBarColor = (ratio: number) => {
  if (ratio >= 1.2) return "#3b82f6"; // Blue - Excellent
  if (ratio >= 0.9) return "#10b981"; // Green - Good
  if (ratio >= 0.7) return "#f59e0b"; // Yellow - Average
  return "#ef4444"; // Red - Poor
};

export const PerformancePanel = () => {
  // Default range: past 14 days to today
  const [fromDate, setFromDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 14);
    return toDateString(d);
  });
  const [toDate, setToDate] = useState<string>(() => {
    const d = new Date();
    return toDateString(d);
  });

  const [perfData, setPerfData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPerformance = async () => {
    if (!fromDate || !toDate) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await getMyPerformanceRange(fromDate, toDate);
      if (res.data.succeeded && res.data.data) {
        setPerfData(res.data.data);
      } else {
        setError(res.data.message ?? "Không thể tải dữ liệu hiệu suất cá nhân.");
      }
    } catch {
      setError("Lỗi kết nối API.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPerformance();
  }, [fromDate, toDate]);

  return (
    <div className="space-y-6">
      {/* Date picker controls */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Hiệu suất Cá nhân</h3>
            <p className="text-sm text-slate-500">Giám sát năng suất lao động và thời gian hoàn thành task của bạn.</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-1.5 bg-white">
              <CalendarDays size={16} className="text-slate-400" />
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                disabled={isLoading}
                className="text-sm font-medium text-slate-700 outline-none"
              />
              <span className="text-slate-400 px-1">đến</span>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                disabled={isLoading}
                className="text-sm font-medium text-slate-700 outline-none"
              />
            </div>

            <button
              type="button"
              onClick={fetchPerformance}
              disabled={isLoading}
              className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-slate-900 disabled:opacity-50"
            >
              <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
            </button>
          </div>
        </div>
      </div>

      {/* Loading & Error */}
      {isLoading && (
        <div className="flex min-h-[300px] items-center justify-center rounded-2xl border border-slate-200 bg-white">
          <div className="flex items-center gap-3 text-slate-600">
            <Loader2 className="h-5 w-5 animate-spin" />
            Đang tải dữ liệu hiệu suất cá nhân...
          </div>
        </div>
      )}

      {error && !isLoading && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-rose-800">
          <p className="font-semibold">Thông báo</p>
          <p className="mt-1 text-sm">{error}</p>
        </div>
      )}

      {/* Performance Content */}
      {perfData && !isLoading && (
        <div className="space-y-6 animate-fadeIn">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {/* Avg Efficiency */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Hiệu suất trung bình</span>
                <TrendingUp size={18} className="text-blue-600" />
              </div>
              <p className="mt-4 text-3xl font-extrabold text-slate-900">
                {(perfData.avgEfficiencyRatio * 100).toFixed(0)}%
              </p>
              <div className="mt-2 text-xs text-slate-500">
                Đánh giá: <strong className="text-blue-700 font-semibold">{perfData.avgEfficiencyLabel}</strong>
              </div>
            </div>

            {/* Total tasks completed */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Tasks đã làm</span>
                <CheckCircle2 size={18} className="text-emerald-600" />
              </div>
              <p className="mt-4 text-3xl font-extrabold text-slate-900">
                {perfData.totalTasks}
                <span className="text-sm font-normal text-slate-400 ml-1">tasks</span>
              </p>
              <div className="mt-2 text-xs text-slate-500">
                Được ghi nhận hoàn thành trong kỳ
              </div>
            </div>

            {/* Total hours worked */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Thời gian làm thực tế</span>
                <Clock size={18} className="text-slate-500" />
              </div>
              <p className="mt-4 text-3xl font-extrabold text-slate-900">
                {(perfData.totalActualMinutes / 60).toFixed(1)}
                <span className="text-sm font-normal text-slate-400 ml-1">giờ</span>
              </p>
              <div className="mt-2 text-xs text-slate-500">
                Thời gian chuẩn: <strong>{(perfData.totalStandardMinutes / 60).toFixed(1)} giờ</strong>
              </div>
            </div>
          </div>

          {/* Daily breakdown Bar Chart */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div>
                <h4 className="font-bold text-slate-900">Biểu đồ chi tiết hiệu suất theo ngày</h4>
                <p className="text-xs text-slate-500">Hiển thị tỷ lệ EfficiencyRatio từng ngày.</p>
              </div>

              {/* Chart Legend */}
              <div className="flex flex-wrap gap-3 text-xs">
                {[
                  { label: "Xuất sắc (≥1.2)", color: "bg-[#3b82f6]" },
                  { label: "Tốt (0.9 – 1.2)", color: "bg-[#10b981]" },
                  { label: "Đạt (0.7 – 0.9)", color: "bg-[#f59e0b]" },
                  { label: "Cần cải thiện (<0.7)", color: "bg-[#ef4444]" },
                ].map((item) => (
                  <span key={item.label} className="flex items-center gap-1.5">
                    <span className={`h-2.5 w-2.5 rounded-full ${item.color}`} />
                    {item.label}
                  </span>
                ))}
              </div>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={perfData.dailyBreakdown}
                  margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="reportDate"
                    tickFormatter={(v) => {
                      const d = new Date(v);
                      return isNaN(d.getTime()) ? v : d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
                    }}
                    stroke="#64748b"
                    tick={{ fill: "#64748b", fontSize: 11 }}
                  />
                  <YAxis domain={[0, 2]} ticks={[0, 0.5, 1, 1.5, 2]} stroke="#64748b" tick={{ fill: "#64748b", fontSize: 11 }} />
                  <Tooltip
                    formatter={(val: any) => [`${(val * 100).toFixed(0)}%`, "Hiệu suất"]}
                    labelFormatter={(label) => `Ngày: ${new Date(label).toLocaleDateString("vi-VN")}`}
                    contentStyle={{
                      borderRadius: "8px",
                      border: "1px solid #e2e8f0",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />
                  <Bar dataKey="efficiencyRatio" radius={[4, 4, 0, 0]}>
                    {perfData.dailyBreakdown.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={getBarColor(entry.efficiencyRatio)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Daily breakdown table list */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200">
              <h4 className="font-bold text-slate-900">Chi tiết số liệu từng ngày</h4>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500">
                  <tr>
                    <th className="px-6 py-3">Ngày</th>
                    <th className="px-6 py-3 text-right">Hiệu suất</th>
                    <th className="px-6 py-3 text-right">Đánh giá</th>
                    <th className="px-6 py-3 text-right">Số task</th>
                    <th className="px-6 py-3 text-right">Thời gian chuẩn</th>
                    <th className="px-6 py-3 text-right">Thời gian thực tế</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {perfData.dailyBreakdown.length > 0 ? (
                    perfData.dailyBreakdown.map((day: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="px-6 py-4 font-medium text-slate-900">
                          {new Date(day.reportDate).toLocaleDateString("vi-VN")}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="font-bold">{(day.efficiencyRatio * 100).toFixed(0)}%</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            day.efficiencyRatio >= 1.2 ? "bg-blue-50 text-blue-700" :
                            day.efficiencyRatio >= 0.9 ? "bg-emerald-50 text-emerald-700" :
                            day.efficiencyRatio >= 0.7 ? "bg-amber-50 text-amber-700" :
                            "bg-rose-50 text-rose-700"
                          }`}>
                            {day.efficiencyLabel}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right text-slate-700">{day.totalTasks}</td>
                        <td className="px-6 py-4 text-right text-slate-500">{day.totalStandardMinutes} phút</td>
                        <td className="px-6 py-4 text-right text-slate-500">{day.totalActualMinutes} phút</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-sm text-slate-400">Không có dữ liệu trong khoảng ngày đã chọn.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!perfData && !isLoading && !error && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white py-20 text-slate-400">
          <Info size={40} className="mb-4 opacity-30 text-blue-500" />
          <p className="text-base font-semibold text-slate-900">Không có dữ liệu hiệu suất</p>
          <p className="text-sm text-slate-400 mt-1">Chọn khoảng ngày và bấm nút tải lại để xem chi tiết.</p>
        </div>
      )}
    </div>
  );
};
