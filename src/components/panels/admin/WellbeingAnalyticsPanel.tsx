import { useEffect, useState } from "react";
import {
  Heart,
  Brain,
  AlertTriangle,
  Loader2,
  RefreshCw,
  Building2,
  Users,
  CalendarDays,
  Activity,
  Smile,
  Frown,
} from "lucide-react";
import {
  getSurveyAggregation,
  getSurveyAggregationTrend,
  apiClient,
  type ApiResponse,
  type DepartmentDto,
} from "@/lib/api";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export const WellbeingAnalyticsPanel = () => {
  const [year, setYear] = useState<number>(2026);
  const [month, setMonth] = useState<number>(5); // Default to May 2026
  const [selectedDeptId, setSelectedDeptId] = useState<number | "">("");
  const [departments, setDepartments] = useState<DepartmentDto[]>([]);
  const [loadingDepts, setLoadingDepts] = useState(false);

  const [aggData, setAggData] = useState<any | null>(null);
  const [trendData, setTrendData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load departments
  const loadDepartments = async () => {
    setLoadingDepts(true);
    try {
      const response = await apiClient.get<ApiResponse<DepartmentDto[]>>("/departments");
      setDepartments(response.data.data ?? []);
    } catch {
      setDepartments([]);
    } finally {
      setLoadingDepts(false);
    }
  };

  // Load survey aggregation and trend
  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const deptId = selectedDeptId === "" ? undefined : Number(selectedDeptId);
      
      const [aggRes, trendRes] = await Promise.all([
        getSurveyAggregation({ year, month, departmentId: deptId }),
        getSurveyAggregationTrend(6, deptId),
      ]);

      if (aggRes.data.succeeded && aggRes.data.data) {
        setAggData(aggRes.data.data);
      } else {
        setAggData(null);
        setError(aggRes.data.message ?? "Không có dữ liệu khảo sát cho kỳ này.");
      }

      if (trendRes.data.succeeded && trendRes.data.data) {
        setTrendData(trendRes.data.data);
      } else {
        setTrendData([]);
      }
    } catch {
      setError("Lỗi kết nối với API khảo sát.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDepartments();
  }, []);

  useEffect(() => {
    loadData();
  }, [year, month, selectedDeptId]);

  // Format distribution for charts
  const getDistributionData = (dist: any) => {
    if (!dist) return [];
    return [
      { name: "1 - Rất tệ", count: dist.score1 ?? 0 },
      { name: "2 - Tệ", count: dist.score2 ?? 0 },
      { name: "3 - Bình thường", count: dist.score3 ?? 0 },
      { name: "4 - Tốt", count: dist.score4 ?? 0 },
      { name: "5 - Rất tốt", count: dist.score5 ?? 0 },
    ];
  };

  return (
    <div className="space-y-6">
      {/* Selection controls */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Phân tích Sức khỏe & Tâm lý (Wellbeing)</h3>
            <p className="text-sm text-slate-500">Thống kê chỉ số tinh thần và áp lực của nhân viên từ khảo sát định kỳ.</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Department select */}
            <select
              value={selectedDeptId}
              onChange={(e) => setSelectedDeptId(e.target.value === "" ? "" : Number(e.target.value))}
              disabled={loadingDepts || isLoading}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 outline-none hover:bg-slate-50 disabled:opacity-50"
            >
              <option value="">Tất cả phòng ban</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>

            {/* Month select */}
            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              disabled={isLoading}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 outline-none hover:bg-slate-50 disabled:opacity-50"
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  Tháng {i + 1}
                </option>
              ))}
            </select>

            {/* Year select */}
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              disabled={isLoading}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 outline-none hover:bg-slate-50 disabled:opacity-50"
            >
              {[2025, 2026, 2027].map((y) => (
                <option key={y} value={y}>
                  Năm {y}
                </option>
              ))}
            </select>

            {/* Refresh button */}
            <button
              type="button"
              onClick={loadData}
              disabled={isLoading}
              className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-slate-900 disabled:opacity-50"
            >
              <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
            </button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex min-h-[300px] items-center justify-center rounded-2xl border border-slate-200 bg-white">
          <div className="flex items-center gap-3 text-slate-600">
            <Loader2 className="h-5 w-5 animate-spin" />
            Đang tải dữ liệu khảo sát...
          </div>
        </div>
      )}

      {/* Error state */}
      {error && !isLoading && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-rose-800">
          <p className="font-semibold">Thông báo</p>
          <p className="mt-1 text-sm">{error}</p>
        </div>
      )}

      {/* Analytics Overview and Charts */}
      {aggData && !isLoading && (
        <div className="space-y-6 animate-fadeIn">
          {/* Metrics summary */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {/* Avg Morale */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Điểm Tinh thần (Morale)</span>
                <Smile className="text-emerald-500" size={18} />
              </div>
              <p className="mt-4 text-3xl font-extrabold text-slate-900">
                {aggData.avgMoraleScore.toFixed(2)}
                <span className="text-sm font-normal text-slate-400 ml-1">/ 5</span>
              </p>
              <div className="mt-2 text-xs text-slate-500">
                Càng cao biểu thị tinh thần nhân viên càng tốt
              </div>
            </div>

            {/* Avg Stress */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Mức độ Căng thẳng (Stress)</span>
                <Frown className="text-rose-500" size={18} />
              </div>
              <p className="mt-4 text-3xl font-extrabold text-slate-900">
                {aggData.avgStressScore.toFixed(2)}
                <span className="text-sm font-normal text-slate-400 ml-1">/ 5</span>
              </p>
              <div className="mt-2 text-xs text-slate-500">
                Càng thấp biểu thị áp lực công việc càng nhẹ nhàng
              </div>
            </div>

            {/* Participation */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Tỷ lệ tham gia khảo sát</span>
                <Users className="text-blue-500" size={18} />
              </div>
              <p className="mt-4 text-3xl font-extrabold text-slate-900">
                {(aggData.responseRate * 100).toFixed(0)}%
              </p>
              <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                <span>Đã nộp: <strong>{aggData.responseCount}</strong></span>
                <span>Tổng số: <strong>{aggData.totalEligible}</strong></span>
              </div>
            </div>
          </div>

          {/* Morale and Stress distributions */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Morale distribution chart */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h4 className="font-bold text-slate-900 mb-1">Phân bố điểm Tinh thần</h4>
              <p className="text-xs text-slate-500 mb-4">Số lượng phản hồi theo thang điểm từ 1 đến 5.</p>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={getDistributionData(aggData.moraleDistribution)}
                    margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" stroke="#64748b" tick={{ fill: "#64748b", fontSize: 11 }} />
                    <YAxis allowDecimals={false} stroke="#64748b" tick={{ fill: "#64748b", fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "8px",
                        border: "1px solid #e2e8f0",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      }}
                    />
                    <Bar dataKey="count" name="Số nhân viên" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Stress distribution chart */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h4 className="font-bold text-slate-900 mb-1">Phân bố mức độ Căng thẳng</h4>
              <p className="text-xs text-slate-500 mb-4">Số lượng phản hồi theo thang điểm từ 1 đến 5.</p>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={getDistributionData(aggData.stressDistribution)}
                    margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" stroke="#64748b" tick={{ fill: "#64748b", fontSize: 11 }} />
                    <YAxis allowDecimals={false} stroke="#64748b" tick={{ fill: "#64748b", fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "8px",
                        border: "1px solid #e2e8f0",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      }}
                    />
                    <Bar dataKey="count" name="Số nhân viên" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Trend Chart */}
          {trendData.length > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h4 className="font-bold text-slate-900 mb-1">Xu hướng biến động tâm lý (6 tháng)</h4>
              <p className="text-xs text-slate-500 mb-6">Theo dõi biến thiên tinh thần và stress trung bình qua các chu kỳ khảo sát.</p>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={trendData}
                    margin={{ top: 10, right: 30, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="monthLabel" stroke="#64748b" tick={{ fill: "#64748b", fontSize: 12 }} />
                    <YAxis domain={[0, 5]} ticks={[0, 1, 2, 3, 4, 5]} stroke="#64748b" tick={{ fill: "#64748b", fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "12px",
                        border: "1px solid #e2e8f0",
                        boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)",
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                    <Line
                      type="monotone"
                      dataKey="avgMoraleScore"
                      name="Tinh thần trung bình"
                      stroke="#10b981"
                      strokeWidth={3}
                      dot={{ r: 4, strokeWidth: 0, fill: "#10b981" }}
                    />
                    <Line
                      type="monotone"
                      dataKey="avgStressScore"
                      name="Stress trung bình"
                      stroke="#f43f5e"
                      strokeWidth={3}
                      dot={{ r: 4, strokeWidth: 0, fill: "#f43f5e" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
