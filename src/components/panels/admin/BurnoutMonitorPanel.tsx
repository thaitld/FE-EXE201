import { useEffect, useState, useCallback } from "react";
import {
  Brain,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Download,
} from "lucide-react";
import {
  getBurnoutSignals,
  resolveBurnoutSignal,
  exportBurnoutExcel,
  type BurnoutSignalDto,
  type PagedResult,
} from "@/lib/api";

// ── Helpers ──────────────────────────────────────────────────────────────────

const RISK_META: Record<string, { label: string; badge: string; bar: string }> = {
  HIGH: { label: "CAO", badge: "bg-rose-50 text-rose-700", bar: "bg-rose-500" },
  MEDIUM: { label: "TRUNG BÌNH", badge: "bg-amber-50 text-amber-700", bar: "bg-amber-500" },
  LOW: { label: "THẤP", badge: "bg-emerald-50 text-emerald-700", bar: "bg-emerald-500" },
};

const TRIGGER_COLORS: Record<string, string> = {
  OVERTIME: "bg-rose-50 text-rose-700",
  LOW_COMPLETION: "bg-amber-50 text-amber-700",
  MEETING_OVERLOAD: "bg-violet-50 text-violet-700",
  SURVEY_LOW_MORALE: "bg-blue-50 text-blue-700",
  CONSECUTIVE_PAUSES: "bg-slate-100 text-slate-600",
};

// ── Resolve Modal ─────────────────────────────────────────────────────────────

function ResolveModal({
  signal,
  onClose,
  onResolved,
}: {
  signal: BurnoutSignalDto;
  onClose: () => void;
  onResolved: () => void;
}) {
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!note.trim()) return setError("Vui lòng nhập ghi chú xử lý.");
    setIsSubmitting(true);
    try {
      const res = await resolveBurnoutSignal(signal.id, {
        resolutionNote: note.trim(),
      });
      if (res.data.succeeded) {
        onResolved();
        onClose();
      } else {
        setError(res.data.message ?? "Xử lý thất bại.");
      }
    } catch {
      setError("Lỗi kết nối.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const riskMeta = RISK_META[signal.riskLevel] ?? RISK_META.LOW;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/40" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-100">
            <Brain size={18} className="text-rose-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Xử lý Burnout Signal</h3>
            <p className="text-sm text-slate-500">{signal.userName}</p>
          </div>
        </div>

        <div className="mb-4 rounded-xl bg-slate-50 px-4 py-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">Mức độ rủi ro:</span>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${riskMeta.badge}`}>
              {riskMeta.label}
            </span>
          </div>
          <div className="mt-2">
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
              <div
                className={`h-full rounded-full ${riskMeta.bar} transition-all`}
                style={{ width: `${signal.riskScore}%` }}
              />
            </div>
            <p className="mt-1 text-right text-xs text-slate-400">
              {signal.riskScore}/100
            </p>
          </div>
          <div className="mt-2 flex flex-wrap gap-1">
            {signal.triggerFactors.map((f) => (
              <span
                key={f}
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${TRIGGER_COLORS[f] ?? "bg-slate-100 text-slate-600"}`}
              >
                {f.replace(/_/g, " ")}
              </span>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Ghi chú xử lý <span className="text-rose-500">*</span>
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={4}
              placeholder="Mô tả biện pháp xử lý (ví dụ: Đã 1-on-1, sắp xếp giảm tải tuần tới...)"
              className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none placeholder:text-slate-400"
            />
          </div>
          {error && (
            <p className="flex items-center gap-2 text-sm text-rose-600">
              <AlertTriangle size={14} /> {error}
            </p>
          )}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
            >
              {isSubmitting ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <CheckCircle2 size={14} />
              )}
              Xác nhận xử lý
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export function BurnoutMonitorPanel() {
  const [signals, setSignals] = useState<BurnoutSignalDto[]>([]);
  const [paging, setPaging] = useState<Omit<PagedResult<unknown>, "items"> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [riskFilter, setRiskFilter] = useState<string>("ALL");
  const [resolvedFilter, setResolvedFilter] = useState<boolean | undefined>(false);
  const [page, setPage] = useState(1);

  const [resolveTarget, setResolveTarget] = useState<BurnoutSignalDto | null>(null);
  const [exportLoading, setExportLoading] = useState(false);

  const fetchSignals = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await getBurnoutSignals({
        ...(riskFilter !== "ALL" && { riskLevel: riskFilter }),
        isResolved: resolvedFilter,
        page,
        pageSize: 15,
      });
      if (res.data.succeeded && res.data.data) {
        setSignals(res.data.data.items);
        const { items: _items, ...rest } = res.data.data;
        void _items;
        setPaging(rest as Omit<PagedResult<unknown>, "items">);
      } else {
        setError(res.data.message ?? "Không tải được dữ liệu.");
      }
    } catch {
      setError("Lỗi kết nối.");
    } finally {
      setIsLoading(false);
    }
  }, [riskFilter, resolvedFilter, page]);

  useEffect(() => {
    fetchSignals();
  }, [fetchSignals]);

  useEffect(() => {
    setPage(1);
  }, [riskFilter, resolvedFilter]);

  const handleExport = async () => {
    setExportLoading(true);
    try {
      await exportBurnoutExcel({
        riskLevel: riskFilter !== "ALL" ? riskFilter : undefined,
        isResolved: resolvedFilter,
      });
    } finally {
      setExportLoading(false);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      {resolveTarget && (
        <ResolveModal
          signal={resolveTarget}
          onClose={() => setResolveTarget(null)}
          onResolved={() => { fetchSignals(); setResolveTarget(null); }}
        />
      )}

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Brain size={18} className="text-rose-500" />
          <h2 className="text-lg font-semibold text-slate-900">Theo dõi Burnout</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExport}
            disabled={exportLoading}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
          >
            {exportLoading ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
            Excel
          </button>
          <button
            type="button"
            onClick={() => fetchSignals()}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 px-4 py-3">
          {/* Risk filter */}
          <div className="flex gap-1">
            {["ALL", "HIGH", "MEDIUM", "LOW"].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRiskFilter(r)}
                className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                  riskFilter === r ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {r === "ALL" ? "Tất cả" : r === "HIGH" ? "Cao" : r === "MEDIUM" ? "Trung bình" : "Thấp"}
              </button>
            ))}
          </div>

          {/* Resolved toggle */}
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-sm text-slate-500">Trạng thái:</span>
            <div className="flex gap-1">
              {[
                { label: "Chưa xử lý", value: false },
                { label: "Đã xử lý", value: true },
                { label: "Tất cả", value: undefined },
              ].map(({ label, value }) => (
                <button
                  key={String(value)}
                  type="button"
                  onClick={() => setResolvedFilter(value)}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                    resolvedFilter === value ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="flex min-h-[300px] items-center justify-center">
            <div className="flex items-center gap-3 text-slate-600">
              <Loader2 className="h-5 w-5 animate-spin" /> Đang tải...
            </div>
          </div>
        ) : error ? (
          <div className="p-6 text-center text-rose-600 text-sm">{error}</div>
        ) : signals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <CheckCircle2 size={32} className="mb-3 opacity-40" />
            <p className="text-sm">Không có tín hiệu burnout nào.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-t border-slate-100">
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Nhân viên</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Nhóm</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Điểm rủi ro</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Mức độ</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Yếu tố kích hoạt</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Phát hiện</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Trạng thái</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {signals.map((signal) => {
                  const meta = RISK_META[signal.riskLevel] ?? RISK_META.LOW;
                  return (
                    <tr key={signal.id} className="transition hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <p className="text-sm font-semibold text-slate-900">{signal.userName}</p>
                        {signal.department && (
                          <p className="text-xs text-slate-400">{signal.department}</p>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {signal.team ?? "—"}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-20 overflow-hidden rounded-full bg-slate-200">
                            <div
                              className={`h-full rounded-full ${meta.bar}`}
                              style={{ width: `${signal.riskScore}%` }}
                            />
                          </div>
                          <span className="text-sm font-semibold text-slate-700">
                            {signal.riskScore}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${meta.badge}`}>
                          {meta.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {signal.triggerFactors.map((f) => (
                            <span
                              key={f}
                              className={`rounded-full px-2 py-0.5 text-xs font-medium ${TRIGGER_COLORS[f] ?? "bg-slate-100 text-slate-600"}`}
                            >
                              {f.replace(/_/g, " ")}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">
                        {new Date(signal.detectedDate).toLocaleDateString("vi-VN")}
                      </td>
                      <td className="px-6 py-4">
                        {signal.isResolved ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                            <CheckCircle2 size={11} /> Đã xử lý
                          </span>
                        ) : (
                          <span className="rounded-full bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700">
                            Chưa xử lý
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {!signal.isResolved && (
                          <button
                            type="button"
                            onClick={() => setResolveTarget(signal)}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
                          >
                            <CheckCircle2 size={13} /> Xử lý
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {paging && paging.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-200 px-6 py-4">
            <p className="text-sm text-slate-500">
              Trang {paging.pageNumber} / {paging.totalPages} · {paging.totalCount} tín hiệu
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={!paging.hasPreviousPage}
                className="rounded-lg border border-slate-200 p-2 text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="px-2 text-sm text-slate-500">{page}</span>
              <button
                type="button"
                onClick={() => setPage((p) => (paging.hasNextPage ? p + 1 : p))}
                disabled={!paging.hasNextPage}
                className="rounded-lg border border-slate-200 p-2 text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
