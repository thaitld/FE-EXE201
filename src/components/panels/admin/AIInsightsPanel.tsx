import { useEffect, useState } from "react";
import {
  Brain,
  Building2,
  CalendarDays,
  Loader2,
  RefreshCw,
  Sparkles,
  AlertTriangle,
  ChevronDown,
  Info,
} from "lucide-react";
import {
  getLatestCompanyInsight,
  getLatestDeptInsight,
  getDeptInsights,
  apiClient,
  type ApiResponse,
  type DepartmentDto,
  type DepartmentInsightDto,
} from "@/lib/api";

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

export const AIInsightsPanel = () => {
  const [scope, setScope] = useState<"company" | "department">("company");
  const [selectedDeptId, setSelectedDeptId] = useState<number | "">("");
  const [departments, setDepartments] = useState<DepartmentDto[]>([]);
  const [loadingDepts, setLoadingDepts] = useState(false);

  const [insight, setInsight] = useState<DepartmentInsightDto | null>(null);
  const [history, setHistory] = useState<DepartmentInsightDto[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
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

  // Load latest insight
  const loadLatestInsight = async () => {
    setIsLoading(true);
    setError(null);
    setInsight(null);
    setHistory([]);
    setShowHistory(false);

    try {
      let res;
      if (scope === "company") {
        res = await getLatestCompanyInsight();
      } else {
        if (selectedDeptId === "") return;
        res = await getLatestDeptInsight(Number(selectedDeptId));
      }

      if (res.data.succeeded) {
        setInsight(res.data.data);
      } else {
        setError(res.data.message ?? "Không thể tải phân tích từ AI.");
      }
    } catch {
      setError("Lỗi kết nối với API phân tích AI.");
    } finally {
      setIsLoading(false);
    }
  };

  // Load history insights
  const loadHistory = async () => {
    if (scope !== "department" || selectedDeptId === "") return;
    setIsLoading(true);
    try {
      const res = await getDeptInsights(Number(selectedDeptId));
      if (res.data.succeeded && res.data.data) {
        // Filter out the latest one from history
        const filteredHistory = res.data.data.filter((h: DepartmentInsightDto) => h.generatedAt !== insight?.generatedAt);
        setHistory(filteredHistory);
        setShowHistory(true);
      }
    } catch {
      // Fail silently for history
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDepartments();
  }, []);

  useEffect(() => {
    loadLatestInsight();
  }, [scope, selectedDeptId]);

  // Color Mapping for Severity
  const getSeverityBadgeClass = (sev: string) => {
    switch (sev?.toUpperCase()) {
      case "HIGH":
        return "bg-rose-50 text-rose-700 border-rose-200";
      case "MEDIUM":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "LOW":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="space-y-6">
      {/* Selector Controls */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">AI Insights Chuyên Sâu</h3>
            <p className="text-sm text-slate-500">Phát hiện các bottleneck, vấn đề phân bổ workload từ dữ liệu hoạt động.</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Scope select */}
            <div className="flex rounded-xl border border-slate-200 p-1 bg-slate-50">
              <button
                type="button"
                onClick={() => setScope("company")}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  scope === "company" ? "bg-white text-blue-700 shadow-sm" : "text-slate-600 hover:text-slate-950"
                }`}
              >
                Toàn công ty
              </button>
              <button
                type="button"
                onClick={() => setScope("department")}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  scope === "department" ? "bg-white text-blue-700 shadow-sm" : "text-slate-600 hover:text-slate-950"
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

            {/* Refresh button */}
            <button
              type="button"
              onClick={loadLatestInsight}
              disabled={isLoading}
              className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-slate-900 disabled:opacity-50"
            >
              <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
            </button>
          </div>
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex min-h-[300px] items-center justify-center rounded-2xl border border-slate-200 bg-white">
          <div className="flex items-center gap-3 text-slate-600">
            <Loader2 className="h-5 w-5 animate-spin animate-pulse" />
            Đang truy xuất phân tích AI...
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

      {/* Insight Content */}
      {!isLoading && !error && (
        <div className="space-y-6 animate-fadeIn">
          {insight ? (
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="bg-gradient-to-r from-blue-50/50 to-white px-6 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Sparkles size={18} className="text-blue-600" />
                    <h4 className="font-bold text-slate-900">
                      {scope === "company" ? "Báo cáo Toàn công ty" : `Phòng ${insight.departmentName}`}
                    </h4>
                  </div>
                  <p className="mt-1 text-xs text-slate-400">
                    Phát hiện lúc: {new Date(insight.generatedAt).toLocaleString("vi-VN")}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-500">
                    Kỳ phân tích: <strong>Tháng {insight.insightMonth}/{insight.insightYear}</strong>
                  </span>
                  <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase ${getSeverityBadgeClass(insight.severity)}`}>
                    Rủi ro: {insight.severity}
                  </span>
                </div>
              </div>

              <div className="p-8">
                <div className="prose max-w-none">
                  {renderMarkdown(insight.insightText)}
                </div>
              </div>

              {/* History button */}
              {scope === "department" && history.length === 0 && !showHistory && (
                <div className="border-t border-slate-100 bg-slate-50/50 px-6 py-4 flex justify-end">
                  <button
                    type="button"
                    onClick={loadHistory}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline"
                  >
                    Xem insights cũ <ChevronDown size={14} />
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white py-20 text-slate-400">
              <Info size={40} className="mb-4 opacity-30 text-blue-500" />
              <p className="text-base font-semibold text-slate-900">Chưa có insight tháng này</p>
              <p className="text-sm text-slate-400 mt-1">Hệ thống AI chưa chạy phân tích định kỳ hoặc chưa có dữ liệu tương thích.</p>
            </div>
          )}

          {/* History Lists */}
          {showHistory && history.length > 0 && (
            <div className="space-y-4">
              <h4 className="font-bold text-slate-900 border-b pb-2 border-slate-200">Lịch sử phân tích cũ</h4>
              <div className="grid grid-cols-1 gap-4">
                {history.map((h, idx) => (
                  <div key={idx} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between border-b pb-3 mb-4 border-slate-100">
                      <div>
                        <span className="text-xs text-slate-400">Tạo lúc: {new Date(h.generatedAt).toLocaleDateString("vi-VN")}</span>
                        <h5 className="font-semibold text-slate-800 mt-0.5">Tháng {h.insightMonth}/{h.insightYear}</h5>
                      </div>
                      <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase ${getSeverityBadgeClass(h.severity)}`}>
                        Rủi ro: {h.severity}
                      </span>
                    </div>
                    <div className="prose max-w-none">
                      {renderMarkdown(h.insightText)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
