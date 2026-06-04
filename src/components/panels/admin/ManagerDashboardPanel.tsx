import { useEffect, useState } from "react";
import { useAuth } from "@/features/auth/AuthContext";
import {
  getDepartmentDashboard,
  type DepartmentDashboardDto,
} from "@/lib/api";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Loader2,
  RefreshCw,
  TrendingUp,
  BarChart2,
  Brain,
  Bell,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

// ── Helpers ──────────────────────────────────────────────────────────────────

function efficiencyColor(ratio: number) {
  if (ratio >= 1.1) return "text-emerald-600";
  if (ratio >= 0.9) return "text-blue-600";
  if (ratio >= 0.7) return "text-amber-600";
  return "text-rose-600";
}

function efficiencyBg(ratio: number) {
  if (ratio >= 1.1) return "bg-emerald-50 text-emerald-700";
  if (ratio >= 0.9) return "bg-blue-50 text-blue-700";
  if (ratio >= 0.7) return "bg-amber-50 text-amber-700";
  return "bg-rose-50 text-rose-700";
}

function burnoutBadge(level: string) {
  if (level === "HIGH") return "bg-rose-50 text-rose-700";
  if (level === "MEDIUM") return "bg-amber-50 text-amber-700";
  return "bg-emerald-50 text-emerald-700";
}

const MONTH_NAMES = [
  "Tháng 1","Tháng 2","Tháng 3","Tháng 4","Tháng 5","Tháng 6",
  "Tháng 7","Tháng 8","Tháng 9","Tháng 10","Tháng 11","Tháng 12",
];

// ── Component ─────────────────────────────────────────────────────────────────

export function ManagerDashboardPanel() {
  const { user } = useAuth();
  const [data, setData] = useState<DepartmentDashboardDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const deptId = user?.departmentName ? undefined : undefined; // will be resolved via user
  // We derive deptId from context via backend — manager sees own dept automatically

  useEffect(() => {
    const fetchDashboard = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Manager sees own dept — backend resolves via JWT
        // We need to find dept ID — use user profile if available
        // Fallback: fetch without explicit deptId (backend uses JWT role)
        const now = new Date();
        // Try to get dept ID from admin/users/me or use a placeholder
        // For now we use dept 1 as default if no departmentId exposed on UserDto
        // TODO: expose departmentId on UserDto from backend for cleaner lookup
        const deptIdToUse = user?.departmentId ?? 1;
        const res = await getDepartmentDashboard(
          deptIdToUse,
          now.getFullYear(),
          now.getMonth() + 1,
        );
        if (res.data.succeeded && res.data.data) {
          setData(res.data.data);
        } else {
          setError(res.data.message ?? "Không tải được dữ liệu dashboard.");
        }
      } catch {
        setError("Lỗi kết nối — không thể tải dữ liệu dashboard.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboard();
  }, [refreshKey, user]);

  // ── Loading ───────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center rounded-2xl border border-slate-200 bg-white">
        <div className="flex items-center gap-3 text-slate-600">
          <Loader2 className="h-5 w-5 animate-spin" />
          Đang tải dashboard...
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-700">
        <p className="font-semibold">Không tải được dữ liệu</p>
        <p className="mt-1 text-sm">{error}</p>
        <button
          type="button"
          onClick={() => setRefreshKey((k) => k + 1)}
          className="mt-4 inline-flex items-center gap-2 rounded-xl border border-rose-200 px-3 py-2 text-sm font-medium transition hover:bg-rose-100"
        >
          <RefreshCw size={14} /> Thử lại
        </button>
      </div>
    );
  }

  // ── Trend chart data ──────────────────────────────────────────────────────
  const trendData = data.monthlyTrend.map((p) => ({
    date: p.date.slice(5), // MM-DD
    ratio: p.efficiencyRatio != null ? +(p.efficiencyRatio * 100).toFixed(1) : null,
  }));

  const teamBarData = data.teams.map((t) => ({
    name: t.teamName,
    hieuSuat: +(t.avgEfficiencyRatio * 100).toFixed(1),
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            {data.departmentName}
          </h2>
          <p className="text-sm text-slate-500">
            {MONTH_NAMES[data.month - 1]} {data.year} — Tổng quan phòng ban
          </p>
        </div>
        <button
          type="button"
          onClick={() => setRefreshKey((k) => k + 1)}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          <RefreshCw size={14} /> Làm mới
        </button>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {/* Efficiency */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">Hiệu suất TB</p>
            <Activity className={efficiencyColor(data.avgEfficiencyRatio)} size={18} />
          </div>
          <p className={`mt-4 text-3xl font-bold ${efficiencyColor(data.avgEfficiencyRatio)}`}>
            {(data.avgEfficiencyRatio * 100).toFixed(1)}%
          </p>
          <span className={`mt-2 inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${efficiencyBg(data.avgEfficiencyRatio)}`}>
            {data.avgEfficiencyLabel}
          </span>
        </div>

        {/* Active Tasks */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">Task đang chạy</p>
            <Clock className="text-blue-600" size={18} />
          </div>
          <p className="mt-4 text-3xl font-bold text-slate-900">
            {data.totalActiveTasks}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            <span className="font-semibold text-rose-600">{data.overdueTasks}</span> quá hạn
          </p>
        </div>

        {/* Completed */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">Hoàn thành tháng này</p>
            <CheckCircle2 className="text-emerald-600" size={18} />
          </div>
          <p className="mt-4 text-3xl font-bold text-slate-900">
            {data.completedThisMonth}
          </p>
          <p className="mt-1 text-xs text-slate-500">task hoàn thành</p>
        </div>

        {/* Burnout */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">Burnout Risk</p>
            <Brain className="text-rose-600" size={18} />
          </div>
          <div className="mt-4 flex items-end gap-3">
            <div>
              <p className="text-3xl font-bold text-rose-600">{data.highRiskBurnoutCount}</p>
              <p className="text-xs text-slate-500">HIGH risk</p>
            </div>
            <div className="pb-1">
              <p className="text-lg font-semibold text-amber-600">{data.mediumRiskBurnoutCount}</p>
              <p className="text-xs text-slate-500">MEDIUM</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Monthly Trend */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm xl:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Xu hướng hiệu suất</h3>
              <p className="text-sm text-slate-500">Tháng {data.month}/{data.year}</p>
            </div>
            <TrendingUp size={18} className="text-slate-400" />
          </div>
          <div className="p-6">
            {trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={trendData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: "#94a3b8" }}
                    tickLine={false}
                    axisLine={false}
                    interval={4}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#94a3b8" }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `${v}%`}
                    domain={[0, 130]}
                  />
                  <Tooltip
                    formatter={(v) => [`${v}%`, "Hiệu suất"]}
                    contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="ratio"
                    stroke="#3b82f6"
                    strokeWidth={2.5}
                    dot={false}
                    connectNulls
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                <TrendingUp size={32} className="mb-3 opacity-40" />
                <p className="text-sm">Chưa có dữ liệu xu hướng.</p>
              </div>
            )}
          </div>
        </div>

        {/* Burnout Alerts */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Cảnh báo Burnout</h3>
              <p className="text-sm text-slate-500">HIGH risk gần nhất</p>
            </div>
            <AlertTriangle size={18} className="text-rose-500" />
          </div>
          <div className="divide-y divide-slate-100">
            {data.recentHighRiskAlerts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                <CheckCircle2 size={28} className="mb-2 opacity-40" />
                <p className="text-sm">Không có cảnh báo HIGH risk.</p>
              </div>
            ) : (
              data.recentHighRiskAlerts.map((a) => (
                <div key={a.signalId} className="flex items-start justify-between gap-3 px-6 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">{a.userName}</p>
                    <p className="text-xs text-slate-500">{a.detectedDate}</p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${burnoutBadge(a.riskLevel)}`}>
                    {a.riskScore}/100
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Team Performance Comparison */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">So sánh hiệu suất nhóm</h3>
            <p className="text-sm text-slate-500">{data.teams.length} nhóm trong phòng ban</p>
          </div>
          <BarChart2 size={18} className="text-slate-400" />
        </div>
        <div className="p-6">
          {teamBarData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={teamBarData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12, fill: "#64748b" }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `${v}%`}
                  domain={[0, 130]}
                />
                <Tooltip
                  formatter={(v) => [`${v}%`, "Hiệu suất"]}
                  contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }}
                />
                <Bar dataKey="hieuSuat" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-slate-400">
              <BarChart2 size={28} className="mb-2 opacity-40" />
              <p className="text-sm">Chưa có dữ liệu nhóm.</p>
            </div>
          )}
        </div>
      </div>

      {/* Unread System Alerts */}
      {data.unreadAlerts.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center gap-2 border-b border-slate-200 px-6 py-4">
            <Bell size={18} className="text-slate-400" />
            <h3 className="text-lg font-semibold text-slate-900">
              Cảnh báo hệ thống chưa đọc
            </h3>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
              {data.unreadAlerts.length}
            </span>
          </div>
          <div className="divide-y divide-slate-100">
            {data.unreadAlerts.map((alert) => {
              const severityClass =
                alert.severity === "HIGH"
                  ? "border-rose-200 bg-rose-50 text-rose-700"
                  : alert.severity === "MEDIUM"
                  ? "border-amber-200 bg-amber-50 text-amber-700"
                  : "border-emerald-200 bg-emerald-50 text-emerald-700";
              return (
                <div key={alert.id} className="flex items-start gap-4 px-6 py-4">
                  <span className={`mt-0.5 shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${severityClass}`}>
                    {alert.severity}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm text-slate-700">{alert.message}</p>
                    {alert.createdAt && (
                      <p className="mt-0.5 text-xs text-slate-400">
                        {new Date(alert.createdAt).toLocaleDateString("vi-VN")}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
