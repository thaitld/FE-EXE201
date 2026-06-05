import { useEffect, useState } from "react";
import {
  Sparkles,
  Loader2,
  RefreshCw,
  TrendingUp,
  AlertTriangle,
  Building2,
  Users,
  CheckCircle2,
  AlertCircle,
  Activity,
  Heart,
  TrendingDown,
  UserCheck,
} from "lucide-react";
import { getHrReport, type HrReportDto } from "@/lib/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

// ── Markdown Renderer ────────────────────────────────────────────────────────
function renderMarkdown(md: string): React.ReactNode {
  const lines = md.split("\n");
  const elements: React.ReactNode[] = [];
  let key = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // H1
    if (line.startsWith("# ")) {
      elements.push(
        <h1 key={key++} className="mt-6 mb-3 text-2xl font-bold text-slate-900 border-b pb-1.5 border-slate-100">
          {line.slice(2)}
        </h1>
      );
    }
    // H2
    else if (line.startsWith("## ")) {
      elements.push(
        <h2 key={key++} className="mt-5 mb-2 text-xl font-semibold text-slate-800">
          {line.slice(3)}
        </h2>
      );
    }
    // H3
    else if (line.startsWith("### ")) {
      elements.push(
        <h3 key={key++} className="mt-4 mb-2 text-base font-semibold text-slate-700">
          {line.slice(4)}
        </h3>
      );
    }
    // Bullet list
    else if (line.startsWith("- ") || line.startsWith("* ")) {
      elements.push(
        <li key={key++} className="ml-5 list-disc text-sm text-slate-700">
          {line.slice(2).replace(/\*\*(.*?)\*\*/g, "$1")}
        </li>
      );
    }
    // Numbered list
    else if (/^\d+\. /.test(line)) {
      elements.push(
        <li key={key++} className="ml-5 list-decimal text-sm text-slate-700">
          {line.replace(/^\d+\. /, "").replace(/\*\*(.*?)\*\*/g, "$1")}
        </li>
      );
    }
    // Divider
    else if (line.startsWith("---")) {
      elements.push(<hr key={key++} className="my-4 border-slate-200" />);
    }
    // Empty line
    else if (line.trim() === "") {
      elements.push(<div key={key++} className="h-2" />);
    }
    // Paragraph
    else {
      // Bold inline
      const parts = line.split(/(\*\*.*?\*\*)/g);
      const rendered = parts.map((part, pi) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={pi} className="font-semibold text-slate-900">
              {part.slice(2, -2)}
            </strong>
          );
        }
        return part;
      });
      elements.push(
        <p key={key++} className="text-sm leading-relaxed text-slate-700">
          {rendered}
        </p>
      );
    }
  }
  return <div className="space-y-1.5">{elements}</div>;
}

export function HrReportPanel() {
  const [year, setYear] = useState<number>(2026);
  const [month, setMonth] = useState<number>(5); // Default to May 2026 as per seed data
  const [report, setReport] = useState<HrReportDto | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);

  const fetchReport = async () => {
    setIsLoading(true);
    setError(null);
    setReport(null);
    setElapsed(0);

    const timer = setInterval(() => setElapsed((e) => e + 1), 1000);

    try {
      const res = await getHrReport(year, month);
      if (res.data.succeeded && res.data.data) {
        setReport(res.data.data);
      } else {
        setError(res.data.message ?? "Không thể tạo báo cáo HR.");
      }
    } catch (err: any) {
      if (err.message?.includes("timeout")) {
        setError("API timeout — Gemini AI cần thêm thời gian để phân tích. Vui lòng thử lại.");
      } else {
        setError("Lỗi kết nối với API báo cáo HR.");
      }
    } finally {
      clearInterval(timer);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [year, month]);

  // Color Mapping for Health Level
  const getHealthColorClass = (level: string) => {
    switch (level?.toUpperCase()) {
      case "HEALTHY":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "CAUTION":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "CRITICAL":
        return "bg-rose-50 text-rose-700 border-rose-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  // Color Mapping for Sentiment
  const getSentimentColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case "GREEN":
        return "bg-emerald-500";
      case "YELLOW":
        return "bg-amber-500";
      case "RED":
        return "bg-rose-500";
      default:
        return "bg-slate-400";
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters and Controls */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-50 p-2.5 text-blue-700">
              <Sparkles size={24} className="animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Báo cáo HR Thông minh</h2>
              <p className="text-sm text-slate-500">Phân tích văn hóa, sức khỏe tổ chức và rủi ro kiệt sức từ Gemini AI.</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
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

            <button
              type="button"
              onClick={fetchReport}
              disabled={isLoading}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <RefreshCw size={15} />
              )}
              {isLoading ? `Đang tạo... (${elapsed}s)` : "Làm mới"}
            </button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-6 text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600" />
          <h3 className="mt-4 text-base font-semibold text-blue-900">Đang tổng hợp báo cáo HR bằng AI...</h3>
          <p className="mt-2 text-sm text-blue-600 max-w-md mx-auto">
            Hệ thống đang tổng hợp dữ liệu hiệu suất, kết quả khảo sát tháng, cảnh báo burnout của toàn bộ phòng ban và tạo đề xuất. Quá trình này mất khoảng 15-30 giây.
          </p>
          <div className="mt-4 max-w-xs mx-auto h-1.5 w-full overflow-hidden rounded-full bg-blue-100">
            <div
              className="h-full rounded-full bg-blue-600 transition-all duration-1000"
              style={{ width: `${Math.min(98, (elapsed / 30) * 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-rose-800">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 shrink-0 text-rose-600" />
            <div>
              <h3 className="text-sm font-semibold">Tạo báo cáo thất bại</h3>
              <p className="mt-1 text-sm">{error}</p>
              <button
                onClick={fetchReport}
                className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-rose-700 hover:underline"
              >
                Thử lại ngay
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Content */}
      {report && !isLoading && (
        <div className="space-y-6 animate-fadeIn">
          {/* Org Health Overview Card Grid */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Org Health score */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Điểm sức khỏe tổ chức</span>
                <Heart className="text-slate-400" size={18} />
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-4xl font-extrabold text-slate-900">{report.orgHealth.score.toFixed(0)}</span>
                <span className="text-sm text-slate-400">/100</span>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold ${getHealthColorClass(report.orgHealth.healthLevel)}`}>
                  {report.orgHealth.healthLevel}
                </span>
                {report.orgHealth.scoreChangePct !== null && (
                  <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${report.orgHealth.scoreChangePct >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                    {report.orgHealth.scoreChangePct >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                    {Math.abs(report.orgHealth.scoreChangePct).toFixed(1)}%
                  </span>
                )}
              </div>
            </div>

            {/* Total Employees */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Nhân viên hoạt động</span>
                <Users className="text-slate-400" size={18} />
              </div>
              <div className="mt-4">
                <span className="text-4xl font-extrabold text-slate-900">{report.orgHealth.totalActiveEmployees}</span>
                <p className="mt-1 text-xs text-slate-400">Đang hoạt động trong kỳ</p>
              </div>
              <div className="mt-2 border-t pt-2 border-slate-100 flex justify-between text-xs text-slate-500">
                <span>Avg Morale: <strong>{report.orgHealth.avgMorale?.toFixed(1) ?? "—"}</strong></span>
                <span>Stress: <strong>{report.orgHealth.avgStress?.toFixed(1) ?? "—"}</strong></span>
              </div>
            </div>

            {/* Burnout Risks */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Rủi ro Burnout</span>
                <AlertTriangle className="text-rose-500" size={18} />
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-4xl font-extrabold text-rose-600">{report.orgHealth.totalHighBurnout}</span>
                <span className="text-sm font-medium text-slate-500">nguy cơ cao</span>
              </div>
              <div className="mt-2 border-t pt-2 border-slate-100 flex justify-between text-xs text-slate-500">
                <span>Cần theo dõi: <strong>{report.orgHealth.totalMediumBurnout}</strong></span>
                <span>Avg Eff: <strong>{report.orgHealth.avgEfficiency ? `${(report.orgHealth.avgEfficiency * 100).toFixed(0)}%` : "—"}</strong></span>
              </div>
            </div>

            {/* Survey Response Rate */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Tỷ lệ khảo sát</span>
                <CheckCircle2 className="text-slate-400" size={18} />
              </div>
              <div className="mt-4">
                <span className="text-4xl font-extrabold text-slate-900">{(report.orgHealth.surveyResponseRate * 100).toFixed(0)}%</span>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-blue-600"
                    style={{ width: `${report.orgHealth.surveyResponseRate * 100}%` }}
                  />
                </div>
              </div>
              <div className="mt-2 text-xs text-slate-500 text-right">
                Morale Change: <strong>{report.surveyInsights.moraleChangePct !== null ? `${report.surveyInsights.moraleChangePct >= 0 ? "+" : ""}${report.surveyInsights.moraleChangePct.toFixed(1)}%` : "—"}</strong>
              </div>
            </div>
          </div>

          {/* Department Sentiment Heatmap / Comparison Chart */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 font-sans">Chi tiết tâm lý theo phòng ban</h3>
                  <p className="text-sm text-slate-500">So sánh điểm Morale (Tinh thần) và Stress (Áp lực) trung bình.</p>
                </div>
                <Building2 className="text-slate-400" size={18} />
              </div>

              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={report.departmentSentiment}
                    margin={{ top: 20, right: 30, left: -20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="departmentName" stroke="#64748b" tick={{ fill: "#64748b", fontSize: 12 }} />
                    <YAxis domain={[0, 5]} ticks={[0, 1, 2, 3, 4, 5]} stroke="#64748b" tick={{ fill: "#64748b", fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "12px",
                        border: "1px solid #e2e8f0",
                        boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)",
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                    <Bar dataKey="avgMorale" name="Điểm Tinh thần (Morale)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="avgStress" name="Mức độ Stress" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Department Table Overview */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col">
              <h3 className="text-lg font-bold text-slate-900 mb-1">Tình trạng các phòng ban</h3>
              <p className="text-sm text-slate-500 mb-4">Danh sách đánh giá sức khỏe bộ phận.</p>

              <div className="flex-1 space-y-3 overflow-y-auto max-h-[300px] pr-1">
                {report.departmentSentiment.map((dept) => (
                  <div key={dept.departmentId} className="flex items-center justify-between rounded-xl border border-slate-100 p-3 hover:bg-slate-50 transition">
                    <div className="flex items-center gap-2">
                      <span className={`h-2.5 w-2.5 rounded-full ${getSentimentColor(dept.sentimentStatus)}`} />
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{dept.departmentName}</p>
                        <p className="text-xs text-slate-500">{dept.totalEmployees} nhân sự • {dept.highBurnoutCount} kiệt sức</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-semibold text-slate-700">Eff: {(dept.avgEfficiency ? dept.avgEfficiency * 100 : 0).toFixed(0)}%</span>
                      <p className="text-[10px] text-slate-400">Morale: {dept.avgMorale?.toFixed(1) ?? "—"}/5</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Intervention Queue */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <UserCheck size={20} className="text-blue-600" />
              <h3 className="text-lg font-bold text-slate-900">Danh sách nhân sự cần can thiệp</h3>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-xs font-semibold uppercase text-slate-500">Nhân viên</th>
                    <th className="px-6 py-3 text-xs font-semibold uppercase text-slate-500">Phòng ban</th>
                    <th className="px-6 py-3 text-xs font-semibold uppercase text-slate-500">Độ ưu tiên</th>
                    <th className="px-6 py-3 text-xs font-semibold uppercase text-slate-500">Lý do</th>
                    <th className="px-6 py-3 text-xs font-semibold uppercase text-slate-500">Giải pháp gợi ý</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {report.interventionQueue.length > 0 ? (
                    report.interventionQueue.map((item) => (
                      <tr key={item.userId} className="hover:bg-slate-50/50">
                        <td className="px-6 py-4">
                          <p className="text-sm font-semibold text-slate-900">{item.fullName}</p>
                          <p className="text-xs text-slate-400">{item.userId.slice(0, 8)}...</p>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-700">{item.departmentName}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold ${item.priority === "HIGH" ? "bg-rose-50 text-rose-700 border border-rose-100" : "bg-amber-50 text-amber-700 border border-amber-100"}`}>
                            {item.priority === "HIGH" ? "Cao" : "Trung bình"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <ul className="list-disc pl-4 space-y-1">
                            {item.reasons.map((r, ri) => (
                              <li key={ri} className="text-xs text-slate-600">{r}</li>
                            ))}
                          </ul>
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-600 leading-relaxed max-w-xs">{item.recommendedAction}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-sm text-slate-400">Không có nhân viên nào trong hàng đợi can thiệp kỳ này.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Flight Risk Departments */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle size={20} className="text-amber-500" />
              <h3 className="text-lg font-bold text-slate-900">Rủi ro nghỉ việc theo phòng ban (Flight Risk)</h3>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {report.flightRiskDepartments.length > 0 ? (
                report.flightRiskDepartments.map((dept, di) => (
                  <div key={di} className="rounded-xl border border-amber-100 bg-amber-50/20 p-5">
                    <div className="flex items-center justify-between border-b border-amber-100/50 pb-3 mb-3">
                      <span className="font-semibold text-slate-900">{dept.departmentName}</span>
                      <span className="rounded-full bg-rose-50 border border-rose-100 px-2.5 py-0.5 text-xs font-bold text-rose-700">
                        {dept.atRiskCount} nhân sự rủi ro
                      </span>
                    </div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Nguyên nhân chính</p>
                    <ul className="space-y-1.5">
                      {dept.riskDrivers.map((driver, dri) => (
                        <li key={dri} className="text-sm text-slate-700 flex items-start gap-2">
                          <span className="text-rose-500 font-bold mt-0.5">•</span>
                          <span>{driver}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))
              ) : (
                <div className="col-span-2 rounded-xl bg-slate-50 p-6 text-center text-sm text-slate-500">
                  Chưa phát hiện rủi ro nghỉ việc nghiêm trọng ở các phòng ban.
                </div>
              )}
            </div>
          </div>

          {/* AI Report Section */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-violet-50 to-white px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles size={18} className="text-violet-600" />
                <h3 className="text-lg font-bold text-slate-900 font-sans">Báo cáo phân tích chuyên sâu của AI</h3>
              </div>
              <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-700">Gemini AI Active</span>
            </div>

            <div className="p-8">
              <div className="prose max-w-none">
                {renderMarkdown(report.aiReport)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
