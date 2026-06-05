import { useEffect, useState } from "react";
import {
  TrendingUp,
  Brain,
  AlertTriangle,
  Loader2,
  RefreshCw,
  Building2,
  CalendarDays,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import {
  getKpiTrendsCompany,
  getKpiTrendsDepartment,
  apiClient,
  type ApiResponse,
  type DepartmentDto,
  type KpiTrendDto,
  type MonthlyKpiDto,
} from "@/lib/api";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export const WorkforceTrendsPanel = () => {
  const [scope, setScope] = useState<"company" | "department">("company");
  const [selectedDeptId, setSelectedDeptId] = useState<number | "">("");
  const [departments, setDepartments] = useState<DepartmentDto[]>([]);
  const [monthsCount, setMonthsCount] = useState<number>(6);
  const [trendData, setTrendData] = useState<KpiTrendDto | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingDepts, setLoadingDepts] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load departments
  const loadDepartments = async () => {
    setLoadingDepts(true);
    try {
      const response = await apiClient.get<ApiResponse<DepartmentDto[]>>("/departments");
      setDepartments(response.data.data ?? []);
      if (response.data.data && response.data.data.length > 0) {
        setSelectedDeptId(response.data.data[0].id);
      }
    } catch {
      setDepartments([]);
    } finally {
      setLoadingDepts(false);
    }
  };

  // Load KPI trend data
  const loadTrendData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      let res;
      if (scope === "company") {
        res = await getKpiTrendsCompany(monthsCount);
      } else {
        if (selectedDeptId === "") return;
        res = await getKpiTrendsDepartment(Number(selectedDeptId), monthsCount);
      }

      if (res.data.succeeded && res.data.data) {
        setTrendData(res.data.data);
      } else {
        setError(res.data.message ?? "Không thể tải dữ liệu xu hướng KPI.");
      }
    } catch {
      setError("Lỗi kết nối với API xu hướng KPI.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDepartments();
  }, []);

  useEffect(() => {
    loadTrendData();
  }, [scope, selectedDeptId, monthsCount]);

  // Format percent change
  const formatChangePct = (val: number | null) => {
    if (val === null) return "—";
    const sign = val >= 0 ? "+" : "";
    return `${sign}${val.toFixed(1)}%`;
  };

  // Format display labels
  const getScopeLabel = () => {
    if (scope === "company") return "Toàn công ty";
    const deptName = departments.find((d) => d.id === selectedDeptId)?.name;
    return deptName ? `Phòng ${deptName}` : "Phòng ban";
  };

  return (
    <div className="space-y-6">
      {/* Scope and duration selectors */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Xu hướng KPI và Hiệu suất</h3>
            <p className="text-sm text-slate-500">Giám sát năng suất lao động, mức độ áp lực và chỉ số tinh thần.</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Scope select */}
            <div className="flex rounded-xl border border-slate-200 p-1 bg-slate-50">
              <button
                type="button"
                onClick={() => setScope("company")}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  scope === "company" ? "bg-white text-blue-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Toàn công ty
              </button>
              <button
                type="button"
                onClick={() => setScope("department")}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  scope === "department" ? "bg-white text-blue-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Theo phòng ban
              </button>
            </div>

            {/* Department select */}
            {scope === "department" && (
              <select
                value={selectedDeptId}
                onChange={(e) => setSelectedDeptId(e.target.value === "" ? "" : Number(e.target.value))}
                disabled={loadingDepts || isLoading}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 outline-none hover:bg-slate-50 disabled:opacity-50"
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            )}

            {/* Months duration select */}
            <select
              value={monthsCount}
              onChange={(e) => setMonthsCount(Number(e.target.value))}
              disabled={isLoading}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 outline-none hover:bg-slate-50 disabled:opacity-50"
            >
              {[3, 6, 12, 24].map((m) => (
                <option key={m} value={m}>
                  {m} tháng gần nhất
                </option>
              ))}
            </select>

            {/* Refresh button */}
            <button
              type="button"
              onClick={loadTrendData}
              disabled={isLoading}
              className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-slate-900 disabled:opacity-50"
            >
              <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
            </button>
          </div>
        </div>
      </div>

      {/* Loading and Error */}
      {isLoading && (
        <div className="flex min-h-[300px] items-center justify-center rounded-2xl border border-slate-200 bg-white">
          <div className="flex items-center gap-3 text-slate-600">
            <Loader2 className="h-5 w-5 animate-spin" />
            Đang tải dữ liệu xu hướng hiệu suất...
          </div>
        </div>
      )}

      {error && !isLoading && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-rose-800">
          <p className="font-semibold">Không thể tải dữ liệu</p>
          <p className="mt-1 text-sm">{error}</p>
        </div>
      )}

      {/* Trend Overview and Chart */}
      {trendData && !isLoading && (
        <div className="space-y-6 animate-fadeIn">
          {/* Metrics summary */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {/* Efficiency Change badge */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Xu hướng Hiệu suất</span>
                <Activity className="text-blue-600" size={18} />
              </div>
              <p className="mt-4 text-3xl font-extrabold text-slate-900">
                {formatChangePct(trendData.efficiencyTrend)}
              </p>
              <div className="mt-2 flex items-center gap-1.5 text-xs">
                {trendData.efficiencyTrend !== null && trendData.efficiencyTrend >= 0 ? (
                  <span className="inline-flex items-center gap-0.5 text-emerald-600 font-semibold bg-emerald-50 rounded-full px-2 py-0.5">
                    <ArrowUpRight size={12} /> Cải thiện
                  </span>
                ) : trendData.efficiencyTrend !== null ? (
                  <span className="inline-flex items-center gap-0.5 text-rose-600 font-semibold bg-rose-50 rounded-full px-2 py-0.5">
                    <ArrowDownRight size={12} /> Suy giảm
                  </span>
                ) : (
                  <span className="text-slate-400">Không có dữ liệu so sánh</span>
                )}
                <span className="text-slate-400">So với chu kỳ trước</span>
              </div>
            </div>

            {/* Morale Change badge */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Xu hướng Tinh thần</span>
                <Brain className="text-emerald-600" size={18} />
              </div>
              <p className="mt-4 text-3xl font-extrabold text-slate-900">
                {formatChangePct(trendData.moraleTrend)}
              </p>
              <div className="mt-2 flex items-center gap-1.5 text-xs">
                {trendData.moraleTrend !== null && trendData.moraleTrend >= 0 ? (
                  <span className="inline-flex items-center gap-0.5 text-emerald-600 font-semibold bg-emerald-50 rounded-full px-2 py-0.5">
                    <ArrowUpRight size={12} /> Tốt hơn
                  </span>
                ) : trendData.moraleTrend !== null ? (
                  <span className="inline-flex items-center gap-0.5 text-rose-600 font-semibold bg-rose-50 rounded-full px-2 py-0.5">
                    <ArrowDownRight size={12} /> Đi xuống
                  </span>
                ) : (
                  <span className="text-slate-400">Không có dữ liệu so sánh</span>
                )}
                <span className="text-slate-400">Từ các khảo sát tâm lý</span>
              </div>
            </div>

            {/* Range length */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Phạm vi Phân tích</span>
                <CalendarDays className="text-slate-500" size={18} />
              </div>
              <p className="mt-4 text-3xl font-extrabold text-slate-900">
                {trendData.months.length}
                <span className="text-lg font-normal text-slate-400 ml-1">tháng</span>
              </p>
              <div className="mt-2 text-xs text-slate-500">
                Hiển thị dữ liệu từ <strong className="text-slate-700">{getScopeLabel()}</strong>
              </div>
            </div>
          </div>

          {/* Main Chart */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h4 className="font-bold text-slate-900">Biểu đồ xu hướng KPI dài hạn</h4>
                <p className="text-xs text-slate-500">So sánh biến động Hiệu suất, Tinh thần (1-5) và mức độ Stress (1-5).</p>
              </div>
            </div>

            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={trendData.months}
                  margin={{ top: 10, right: 30, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="monthLabel" stroke="#64748b" tick={{ fill: "#64748b", fontSize: 12 }} />
                  {/* Left Y Axis for Scores (Morale, Stress: 1-5) */}
                  <YAxis yAxisId="left" domain={[0, 5]} stroke="#64748b" tick={{ fill: "#64748b", fontSize: 12 }} />
                  {/* Right Y Axis for Ratio (Efficiency: 0-2) */}
                  <YAxis yAxisId="right" orientation="right" domain={[0, 2]} stroke="#64748b" tick={{ fill: "#64748b", fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "1px solid #e2e8f0",
                      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)",
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="avgEfficiency"
                    name="Hiệu suất (Efficiency)"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    dot={{ r: 4, strokeWidth: 0, fill: "#3b82f6" }}
                  />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="avgMorale"
                    name="Tinh thần (Morale)"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    dot={{ r: 4, strokeWidth: 0, fill: "#10b981" }}
                  />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="avgStress"
                    name="Mức độ Stress"
                    stroke="#f43f5e"
                    strokeWidth={2.5}
                    dot={{ r: 4, strokeWidth: 0, fill: "#f43f5e" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Month-by-month table */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200">
              <h4 className="font-bold text-slate-900">Chi tiết số liệu theo tháng</h4>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500">
                  <tr>
                    <th className="px-6 py-3">Chu kỳ</th>
                    <th className="px-6 py-3 text-right">Hiệu suất (Efficiency Ratio)</th>
                    <th className="px-6 py-3 text-right">Tinh thần trung bình</th>
                    <th className="px-6 py-3 text-right">Mức Stress trung bình</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {trendData.months.map((m, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4 font-medium text-slate-900">{m.monthLabel}</td>
                      <td className="px-6 py-4 text-right">
                        {m.avgEfficiency !== null ? (
                          <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            m.avgEfficiency >= 1.1 ? "bg-emerald-50 text-emerald-700" :
                            m.avgEfficiency >= 0.9 ? "bg-blue-50 text-blue-700" :
                            m.avgEfficiency >= 0.7 ? "bg-amber-50 text-amber-700" :
                            "bg-rose-50 text-rose-700"
                          }`}>
                            {(m.avgEfficiency * 100).toFixed(0)}%
                          </span>
                        ) : "—"}
                      </td>
                      <td className="px-6 py-4 text-right text-slate-700">
                        {m.avgMorale !== null ? `${m.avgMorale.toFixed(2)} / 5` : "—"}
                      </td>
                      <td className="px-6 py-4 text-right text-slate-700">
                        {m.avgStress !== null ? `${m.avgStress.toFixed(2)} / 5` : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
