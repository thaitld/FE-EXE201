import { useEffect, useState, useCallback } from "react";
import {
  Users,
  RefreshCw,
  Loader2,
  TrendingUp,
  Clock,
  Download,
  Calendar,
} from "lucide-react";
import {
  getTeamPerformance,
  getTeamOvertime,
  exportTeamPerformanceExcel,
  type TeamPerformanceDto,
  type OvertimeReportDto,
} from "@/lib/api";
import { apiClient, type ApiResponse, type TeamDetailDto } from "@/lib/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from "recharts";

// ── Helpers ──────────────────────────────────────────────────────────────────

function efficiencyColor(ratio: number) {
  if (ratio >= 1.1) return "#10b981"; // emerald
  if (ratio >= 0.9) return "#3b82f6"; // blue
  if (ratio >= 0.7) return "#f59e0b"; // amber
  return "#f43f5e"; // rose
}

function efficiencyBadge(ratio: number, label: string) {
  if (ratio >= 1.1) return `bg-emerald-50 text-emerald-700`;
  if (ratio >= 0.9) return `bg-blue-50 text-blue-700`;
  if (ratio >= 0.7) return `bg-amber-50 text-amber-700`;
  if (ratio === 0) return `bg-slate-50 text-slate-400`;
  void label;
  return `bg-rose-50 text-rose-700`;
}

function toDateString(d: Date) {
  return d.toISOString().slice(0, 10);
}

function getWeekStart(offset = 0) {
  const now = new Date();
  const day = now.getDay(); // 0=Sun
  const diff = day === 0 ? -6 : 1 - day; // Monday
  const monday = new Date(now);
  monday.setDate(now.getDate() + diff + offset * 7);
  return monday;
}

// ── Component ─────────────────────────────────────────────────────────────────

type TabType = "performance" | "overtime";

export function TeamPerformancePanel() {
  const [teams, setTeams] = useState<TeamDetailDto[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<number | "">("");
  const [activeTab, setActiveTab] = useState<TabType>("performance");

  // Performance
  const [reportDate, setReportDate] = useState(toDateString(new Date(Date.now() - 86400000)));
  const [performance, setPerformance] = useState<TeamPerformanceDto | null>(null);
  const [isLoadingPerf, setIsLoadingPerf] = useState(false);
  const [perfError, setPerfError] = useState<string | null>(null);

  // Overtime
  const [overtimeFrom, setOvertimeFrom] = useState(toDateString(getWeekStart()));
  const [overtimeTo, setOvertimeTo] = useState(toDateString(new Date()));
  const [overtime, setOvertime] = useState<OvertimeReportDto[]>([]);
  const [isLoadingOT, setIsLoadingOT] = useState(false);
  const [otError, setOtError] = useState<string | null>(null);

  const [exportLoading, setExportLoading] = useState(false);

  // Load teams
  useEffect(() => {
    apiClient
      .get<ApiResponse<TeamDetailDto[]>>("/teams", { params: { isActive: true } })
      .then((res) => {
        if (res.data.succeeded) {
          const t = res.data.data ?? [];
          setTeams(t);
          if (t.length > 0) setSelectedTeamId(t[0].id);
        }
      });
  }, []);

  // Load performance
  const fetchPerformance = useCallback(async () => {
    if (!selectedTeamId) return;
    setIsLoadingPerf(true);
    setPerfError(null);
    try {
      const res = await getTeamPerformance(Number(selectedTeamId), reportDate);
      if (res.data.succeeded) {
        setPerformance(res.data.data);
      } else {
        setPerfError(res.data.message ?? "Không tải được dữ liệu.");
      }
    } catch {
      setPerfError("Lỗi kết nối.");
    } finally {
      setIsLoadingPerf(false);
    }
  }, [selectedTeamId, reportDate]);

  // Load overtime
  const fetchOvertime = useCallback(async () => {
    if (!selectedTeamId) return;
    setIsLoadingOT(true);
    setOtError(null);
    try {
      const res = await getTeamOvertime(
        Number(selectedTeamId),
        overtimeFrom,
        overtimeTo,
      );
      if (res.data.succeeded) {
        setOvertime(res.data.data ?? []);
      } else {
        setOtError(res.data.message ?? "Không tải được dữ liệu.");
      }
    } catch {
      setOtError("Lỗi kết nối.");
    } finally {
      setIsLoadingOT(false);
    }
  }, [selectedTeamId, overtimeFrom, overtimeTo]);

  useEffect(() => {
    if (activeTab === "performance") fetchPerformance();
    else fetchOvertime();
  }, [activeTab, fetchPerformance, fetchOvertime]);

  const handleExport = async () => {
    if (!selectedTeamId) return;
    setExportLoading(true);
    try {
      await exportTeamPerformanceExcel(Number(selectedTeamId), overtimeFrom, overtimeTo);
    } finally {
      setExportLoading(false);
    }
  };

  // Bar chart data
  const barData = (performance?.members ?? []).map((m) => ({
    name: m.userName.split(" ").pop(), // Last name only
    ratio: +(m.efficiencyRatio * 100).toFixed(1),
    color: efficiencyColor(m.efficiencyRatio),
  }));

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <TrendingUp size={18} className="text-blue-500" />
          <h2 className="text-lg font-semibold text-slate-900">Hiệu suất Nhóm</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExport}
            disabled={exportLoading || !selectedTeamId}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
          >
            {exportLoading ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
            Excel
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-end gap-4">
          {/* Team selector */}
          <div className="flex-1 min-w-[200px]">
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Nhóm
            </label>
            <select
              value={selectedTeamId}
              onChange={(e) => setSelectedTeamId(e.target.value === "" ? "" : Number(e.target.value))}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none"
            >
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.departmentName})
                </option>
              ))}
            </select>
          </div>

          {/* Tab */}
          <div className="flex rounded-xl border border-slate-200 overflow-hidden">
            <button
              type="button"
              onClick={() => setActiveTab("performance")}
              className={`px-4 py-2.5 text-sm font-medium transition ${
                activeTab === "performance" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              Hiệu suất
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("overtime")}
              className={`px-4 py-2.5 text-sm font-medium transition ${
                activeTab === "overtime" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              Overtime
            </button>
          </div>

          {/* Date controls */}
          {activeTab === "performance" ? (
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Ngày báo cáo
              </label>
              <input
                type="date"
                value={reportDate}
                onChange={(e) => setReportDate(e.target.value)}
                max={toDateString(new Date())}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none"
              />
            </div>
          ) : (
            <div className="flex items-end gap-2">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Từ ngày
                </label>
                <input
                  type="date"
                  value={overtimeFrom}
                  onChange={(e) => setOvertimeFrom(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Đến ngày
                </label>
                <input
                  type="date"
                  value={overtimeTo}
                  onChange={(e) => setOvertimeTo(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none"
                />
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={activeTab === "performance" ? fetchPerformance : fetchOvertime}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            <RefreshCw size={14} /> Tải
          </button>
        </div>
      </div>

      {/* ─── Performance Tab ─── */}
      {activeTab === "performance" && (
        <>
          {isLoadingPerf ? (
            <div className="flex min-h-[300px] items-center justify-center rounded-2xl border border-slate-200 bg-white">
              <div className="flex items-center gap-3 text-slate-600">
                <Loader2 className="h-5 w-5 animate-spin" /> Đang tải...
              </div>
            </div>
          ) : perfError ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-700">
              <p className="font-semibold">Không tải được dữ liệu</p>
              <p className="mt-1 text-sm">{perfError}</p>
            </div>
          ) : performance ? (
            <div className="space-y-4">
              {/* Summary stat cards */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <p className="text-sm font-medium text-slate-500">Hiệu suất TB nhóm</p>
                  <p className={`mt-4 text-3xl font-bold`} style={{ color: efficiencyColor(performance.avgEfficiencyRatio) }}>
                    {(performance.avgEfficiencyRatio * 100).toFixed(1)}%
                  </p>
                  <span className={`mt-2 inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${efficiencyBadge(performance.avgEfficiencyRatio, performance.avgEfficiencyLabel)}`}>
                    {performance.avgEfficiencyLabel}
                  </span>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <p className="text-sm font-medium text-slate-500">Tổng thành viên</p>
                  <div className="mt-4 flex items-end gap-2">
                    <p className="text-3xl font-bold text-slate-900">{performance.totalMembers}</p>
                    <p className="mb-1 text-sm text-slate-500">({performance.activeMembers} đang hoạt động)</p>
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <p className="text-sm font-medium text-slate-500">Ngày báo cáo</p>
                  <p className="mt-4 text-2xl font-bold text-slate-900">
                    {new Date(performance.reportDate).toLocaleDateString("vi-VN")}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">{performance.teamName}</p>
                </div>
              </div>

              {/* Charts + Table */}
              <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
                {/* Bar chart */}
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm xl:col-span-2">
                  <div className="border-b border-slate-200 px-6 py-4">
                    <h3 className="text-lg font-semibold text-slate-900">Hiệu suất từng thành viên</h3>
                  </div>
                  <div className="p-6">
                    {barData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={barData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                          <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#64748b" }} tickLine={false} axisLine={false} />
                          <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} domain={[0, 130]} />
                          <Tooltip formatter={(v) => [`${v}%`, "Hiệu suất"]} contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }} />
                          <Bar dataKey="ratio" radius={[6, 6, 0, 0]}>
                            {barData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                        <Users size={28} className="mb-2 opacity-40" />
                        <p className="text-sm">Không có dữ liệu.</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Member table */}
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <div className="border-b border-slate-200 px-6 py-4">
                    <h3 className="text-lg font-semibold text-slate-900">Danh sách</h3>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {performance.members.map((m) => (
                      <div key={m.userId} className="flex items-center justify-between gap-3 px-5 py-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-slate-900">{m.userName}</p>
                          <p className="text-xs text-slate-400">{m.totalTasks} tasks</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-bold" style={{ color: efficiencyColor(m.efficiencyRatio) }}>
                            {(m.efficiencyRatio * 100).toFixed(0)}%
                          </p>
                          <span className={`text-xs font-semibold rounded-full px-2 py-0.5 ${efficiencyBadge(m.efficiencyRatio, m.efficiencyLabel)}`}>
                            {m.efficiencyLabel}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </>
      )}

      {/* ─── Overtime Tab ─── */}
      {activeTab === "overtime" && (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center gap-2 border-b border-slate-200 px-6 py-4">
            <Clock size={18} className="text-slate-400" />
            <h3 className="text-lg font-semibold text-slate-900">Báo cáo Overtime</h3>
          </div>

          {isLoadingOT ? (
            <div className="flex min-h-[200px] items-center justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-slate-500" />
            </div>
          ) : otError ? (
            <div className="p-6 text-sm text-rose-600">{otError}</div>
          ) : overtime.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
              <Calendar size={28} className="mb-2 opacity-40" />
              <p className="text-sm">Không có dữ liệu overtime trong khoảng thời gian này.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-t border-slate-100">
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Nhân viên</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Ngày</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Giờ kết thúc ca</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Hoạt động cuối</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Overtime (phút)</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {overtime.map((ot, i) => (
                    <tr key={i} className="transition hover:bg-slate-50">
                      <td className="px-6 py-4 text-sm font-medium text-slate-900">{ot.userName}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {new Date(ot.reportDate).toLocaleDateString("vi-VN")}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 font-mono">{ot.workEnd?.slice(0, 5) ?? "—"}</td>
                      <td className="px-6 py-4 text-sm text-slate-600 font-mono">
                        {ot.actualLastActivity
                          ? new Date(ot.actualLastActivity).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
                          : "—"}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-sm font-semibold ${ot.overtimeMinutes > 60 ? "text-rose-600" : "text-amber-600"}`}>
                          {ot.overtimeMinutes > 0 ? `+${ot.overtimeMinutes}` : "0"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {ot.hasOvertime ? (
                          <span className="rounded-full bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700">
                            Overtime
                          </span>
                        ) : (
                          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                            Bình thường
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
