import { useState } from "react";
import {
  FileText,
  Loader2,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Sparkles,
  AlertTriangle,
} from "lucide-react";
import { getManagerReport, type ManagerReportDto } from "@/lib/api";

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Get Monday of week offset from today (offset=0 → this week, -1 → last week) */
function getMondayOfWeek(offset = 0): Date {
  const now = new Date();
  const day = now.getDay(); // 0=Sun
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diffToMonday + offset * 7);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

function toDateString(d: Date) {
  return d.toISOString().slice(0, 10);
}

function formatWeekLabel(monday: Date): string {
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return `${monday.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" })} – ${sunday.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })}`;
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function ReportSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      {[100, 60, 80, 50, 90, 70, 60].map((w, i) => (
        <div key={i} className={`h-4 rounded-full bg-slate-200`} style={{ width: `${w}%` }} />
      ))}
    </div>
  );
}

// ── Markdown Renderer (simple) ────────────────────────────────────────────────
// Renders the AI markdown without external library

function renderMarkdown(md: string): React.ReactNode {
  const lines = md.split("\n");
  const elements: React.ReactNode[] = [];
  let key = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // H1
    if (line.startsWith("# ")) {
      elements.push(
        <h1 key={key++} className="mt-6 mb-3 text-2xl font-bold text-slate-900">
          {line.slice(2)}
        </h1>,
      );
    }
    // H2
    else if (line.startsWith("## ")) {
      elements.push(
        <h2 key={key++} className="mt-5 mb-2 text-xl font-semibold text-slate-800">
          {line.slice(3)}
        </h2>,
      );
    }
    // H3
    else if (line.startsWith("### ")) {
      elements.push(
        <h3 key={key++} className="mt-4 mb-2 text-base font-semibold text-slate-700">
          {line.slice(4)}
        </h3>,
      );
    }
    // Bullet list
    else if (line.startsWith("- ") || line.startsWith("* ")) {
      elements.push(
        <li key={key++} className="ml-5 list-disc text-sm text-slate-700">
          {line.slice(2).replace(/\*\*(.*?)\*\*/g, "$1")}
        </li>,
      );
    }
    // Numbered list
    else if (/^\d+\. /.test(line)) {
      elements.push(
        <li key={key++} className="ml-5 list-decimal text-sm text-slate-700">
          {line.replace(/^\d+\. /, "").replace(/\*\*(.*?)\*\*/g, "$1")}
        </li>,
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
        </p>,
      );
    }
  }
  return <div className="space-y-1">{elements}</div>;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function ManagerReportPanel() {
  const [weekOffset, setWeekOffset] = useState(0);
  const [report, setReport] = useState<ManagerReportDto | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);

  const monday = getMondayOfWeek(weekOffset);
  const weekStart = toDateString(monday);

  const fetchReport = async () => {
    setIsLoading(true);
    setError(null);
    setReport(null);
    setElapsed(0);

    // Tick elapsed time every second
    const timer = setInterval(() => setElapsed((e) => e + 1), 1000);

    try {
      const res = await getManagerReport(undefined, weekStart);
      if (res.data.succeeded && res.data.data) {
        setReport(res.data.data);
      } else {
        setError(res.data.message ?? "Không tạo được báo cáo AI.");
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.message?.includes("timeout")) {
        setError("API timeout — Gemini AI mất quá nhiều thời gian. Vui lòng thử lại.");
      } else {
        setError("Lỗi kết nối với API báo cáo AI.");
      }
    } finally {
      clearInterval(timer);
      setIsLoading(false);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Sparkles size={18} className="text-violet-500" />
          <h2 className="text-lg font-semibold text-slate-900">Báo cáo AI Hàng tuần</h2>
          <span className="rounded-full bg-violet-50 px-2.5 py-0.5 text-xs font-semibold text-violet-700">
            Gemini AI
          </span>
        </div>
      </div>

      {/* Week selector */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 px-1 py-1">
            <button
              type="button"
              onClick={() => setWeekOffset((w) => w - 1)}
              disabled={isLoading}
              className="rounded-lg p-1.5 text-slate-600 transition hover:bg-slate-100 disabled:opacity-50"
            >
              <ChevronLeft size={16} />
            </button>
            <div className="flex items-center gap-2 px-3">
              <CalendarDays size={15} className="text-slate-400" />
              <span className="text-sm font-semibold text-slate-700">
                {formatWeekLabel(monday)}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setWeekOffset((w) => Math.min(0, w + 1))}
              disabled={isLoading || weekOffset >= 0}
              className="rounded-lg p-1.5 text-slate-600 transition hover:bg-slate-100 disabled:opacity-50"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {weekOffset < 0 && (
            <button
              type="button"
              onClick={() => setWeekOffset(0)}
              className="text-sm text-blue-600 hover:underline"
            >
              Về tuần này
            </button>
          )}

          <button
            type="button"
            onClick={fetchReport}
            disabled={isLoading}
            className="ml-auto inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <RefreshCw size={14} />
            )}
            {isLoading ? `Đang tạo báo cáo... (${elapsed}s)` : "Tạo báo cáo"}
          </button>
        </div>
      </div>

      {/* Loading notice */}
      {isLoading && (
        <div className="rounded-2xl border border-violet-200 bg-violet-50 p-4">
          <div className="flex items-start gap-3">
            <Loader2 size={18} className="mt-0.5 animate-spin text-violet-600 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-violet-800">
                Gemini AI đang phân tích dữ liệu nhóm...
              </p>
              <p className="mt-0.5 text-xs text-violet-600">
                Quá trình này có thể mất 20–35 giây. Bạn không cần làm gì cả.
              </p>
              <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-violet-200">
                <div
                  className="h-full rounded-full bg-violet-500 transition-all duration-1000"
                  style={{ width: `${Math.min(99, (elapsed / 40) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle size={18} className="mt-0.5 text-rose-600 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-rose-800">Tạo báo cáo thất bại</p>
              <p className="mt-0.5 text-sm text-rose-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Report content */}
      {(isLoading || report) && (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {/* Report header */}
          {report && (
            <div className="flex items-center justify-between border-b border-slate-200 bg-gradient-to-r from-violet-50 to-white px-6 py-4">
              <div>
                <div className="flex items-center gap-2">
                  <FileText size={18} className="text-violet-600" />
                  <h3 className="text-lg font-semibold text-slate-900">
                    {report.departmentName} — {formatWeekLabel(new Date(report.weekStart))}
                  </h3>
                </div>
                <p className="mt-0.5 text-xs text-slate-400">
                  Tạo lúc: {new Date(report.generatedAt).toLocaleString("vi-VN")}
                </p>
              </div>
              <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-700">
                AI Generated
              </span>
            </div>
          )}

          {/* Content */}
          <div className="px-8 py-6">
            {isLoading && !report ? (
              <ReportSkeleton />
            ) : report ? (
              <div className="prose max-w-none">
                {renderMarkdown(report.aiReport)}
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !report && !error && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white py-20 text-slate-400">
          <Sparkles size={40} className="mb-4 opacity-30" />
          <p className="text-base font-medium text-slate-500">Chọn tuần và nhấn "Tạo báo cáo"</p>
          <p className="mt-1 text-sm">AI sẽ phân tích dữ liệu nhóm và tạo báo cáo tổng hợp.</p>
        </div>
      )}
    </div>
  );
}
