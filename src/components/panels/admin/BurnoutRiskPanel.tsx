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
  Building2,
} from "lucide-react";
import {
  getBurnoutSignals,
  exportBurnoutExcel,
  apiClient,
  type ApiResponse,
  type DepartmentDto,
  type BurnoutSignalDto,
  type PagedResult,
} from "@/lib/api";

const RISK_META: Record<string, { label: string; badge: string; bar: string }> = {
  HIGH: { label: "CAO", badge: "bg-rose-50 text-rose-700 border border-rose-100", bar: "bg-rose-500" },
  MEDIUM: { label: "TRUNG BÌNH", badge: "bg-amber-50 text-amber-700 border border-amber-100", bar: "bg-amber-500" },
  LOW: { label: "THẤP", badge: "bg-emerald-50 text-emerald-700 border border-emerald-100", bar: "bg-emerald-500" },
};

const TRIGGER_COLORS: Record<string, string> = {
  OVERTIME: "bg-rose-50 text-rose-700",
  LOW_COMPLETION: "bg-amber-50 text-amber-700",
  MEETING_OVERLOAD: "bg-violet-50 text-violet-700",
  SURVEY_LOW_MORALE: "bg-blue-50 text-blue-700",
  CONSECUTIVE_PAUSES: "bg-slate-100 text-slate-600",
};

export const BurnoutRiskPanel = () => {
  const [signals, setSignals] = useState<BurnoutSignalDto[]>([]);
  const [departments, setDepartments] = useState<DepartmentDto[]>([]);
  const [paging, setPaging] = useState<Omit<PagedResult<unknown>, "items"> | null>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [loadingDepts, setLoadingDepts] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedDeptId, setSelectedDeptId] = useState<number | "">("");
  const [riskFilter, setRiskFilter] = useState<string>("ALL");
  const [resolvedFilter, setResolvedFilter] = useState<boolean | undefined>(false);
  const [page, setPage] = useState(1);
  const [exportLoading, setExportLoading] = useState(false);

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

  // Fetch burnout signals
  const fetchSignals = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await getBurnoutSignals({
        ...(riskFilter !== "ALL" && { riskLevel: riskFilter }),
        ...(selectedDeptId !== "" && { deptId: Number(selectedDeptId) }),
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
        setError(res.data.message ?? "Không tải được dữ liệu burnout signals.");
      }
    } catch {
      setError("Lỗi kết nối API.");
    } finally {
      setIsLoading(false);
    }
  }, [riskFilter, selectedDeptId, resolvedFilter, page]);

  useEffect(() => {
    loadDepartments();
  }, []);

  useEffect(() => {
    fetchSignals();
  }, [fetchSignals]);

  useEffect(() => {
    setPage(1);
  }, [riskFilter, selectedDeptId, resolvedFilter]);

  const handleExport = async () => {
    setExportLoading(true);
    try {
      await exportBurnoutExcel({
        riskLevel: riskFilter !== "ALL" ? riskFilter : undefined,
        isResolved: resolvedFilter,
        departmentId: selectedDeptId !== "" ? Number(selectedDeptId) : undefined,
      });
    } finally {
      setExportLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Brain size={20} className="text-rose-500 animate-pulse" />
          <h2 className="text-lg font-bold text-slate-900">Phân tích Rủi ro Burnout toàn công ty</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExport}
            disabled={exportLoading}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
          >
            {exportLoading ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
            Xuất Excel
          </button>
          <button
            type="button"
            onClick={() => fetchSignals()}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {/* Filters */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 px-6 py-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* Risk filter group */}
            <div className="flex rounded-xl border border-slate-200 p-1 bg-slate-50">
              {["ALL", "HIGH", "MEDIUM", "LOW"].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRiskFilter(r)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                    riskFilter === r ? "bg-slate-900 text-white shadow-sm" : "text-slate-600 hover:text-slate-950"
                  }`}
                >
                  {r === "ALL" ? "Tất cả" : r === "HIGH" ? "Cao" : r === "MEDIUM" ? "Trung bình" : "Thấp"}
                </button>
              ))}
            </div>

            {/* Department dropdown */}
            <div className="flex items-center gap-2">
              <Building2 size={16} className="text-slate-400" />
              <select
                value={selectedDeptId}
                onChange={(e) => setSelectedDeptId(e.target.value === "" ? "" : Number(e.target.value))}
                disabled={loadingDepts || isLoading}
                className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm outline-none hover:bg-slate-50 disabled:opacity-50"
              >
                <option value="">Tất cả phòng ban</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Resolved filter group */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Trạng thái:</span>
            <div className="flex rounded-xl border border-slate-200 p-1 bg-slate-50">
              {[
                { label: "Chưa xử lý", value: false },
                { label: "Đã xử lý", value: true },
                { label: "Tất cả", value: undefined },
              ].map(({ label, value }) => (
                <button
                  key={String(value)}
                  type="button"
                  onClick={() => setResolvedFilter(value)}
                  className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${
                    resolvedFilter === value ? "bg-slate-900 text-white shadow-sm" : "text-slate-600 hover:text-slate-950"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table / List */}
        {isLoading ? (
          <div className="flex min-h-[300px] items-center justify-center">
            <div className="flex items-center gap-3 text-slate-600">
              <Loader2 className="h-5 w-5 animate-spin" /> Đang tải dữ liệu...
            </div>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-rose-600 text-sm">{error}</div>
        ) : signals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <CheckCircle2 size={40} className="mb-4 opacity-30 text-emerald-500" />
            <p className="text-base font-semibold text-slate-900">Không tìm thấy tín hiệu cảnh báo nào</p>
            <p className="text-sm text-slate-400 mt-1">Hệ thống đang hoạt động an toàn và ổn định.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500">
                <tr>
                  <th className="px-6 py-3">Nhân viên</th>
                  <th className="px-6 py-3">Phòng / Nhóm</th>
                  <th className="px-6 py-3">Điểm rủi ro</th>
                  <th className="px-6 py-3">Phân loại</th>
                  <th className="px-6 py-3">Yếu tố phát hiện</th>
                  <th className="px-6 py-3">Ngày phát hiện</th>
                  <th className="px-6 py-3">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {signals.map((signal) => {
                  const meta = RISK_META[signal.riskLevel] ?? RISK_META.LOW;
                  return (
                    <tr key={signal.id} className="hover:bg-slate-50/50 transition">
                      <td className="px-6 py-4">
                        <p className="font-semibold text-slate-900">{signal.userName}</p>
                        <p className="text-xs text-slate-400">ID: {signal.userId.slice(0, 8)}...</p>
                      </td>
                      <td className="px-6 py-4">
                        {signal.department && <p className="font-medium text-slate-800">{signal.department}</p>}
                        {signal.team && <p className="text-xs text-slate-500">{signal.team}</p>}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-20 overflow-hidden rounded-full bg-slate-100">
                            <div className={`h-full rounded-full ${meta.bar}`} style={{ width: `${signal.riskScore}%` }} />
                          </div>
                          <span className="font-bold text-slate-800">{signal.riskScore}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${meta.badge}`}>
                          {meta.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {signal.triggerFactors.map((f) => (
                            <span
                              key={f}
                              className={`rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide ${
                                TRIGGER_COLORS[f] ?? "bg-slate-100 text-slate-600 border border-slate-200"
                              }`}
                            >
                              {f.replace(/_/g, " ")}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-500">
                        {new Date(signal.detectedDate).toLocaleDateString("vi-VN")}
                      </td>
                      <td className="px-6 py-4">
                        {signal.isResolved ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-100">
                            <CheckCircle2 size={11} /> Đã xử lý
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-700 border border-rose-100">
                            <AlertTriangle size={11} /> Chưa xử lý
                          </span>
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
            <p className="text-xs text-slate-500">
              Trang {paging.pageNumber} / {paging.totalPages} · {paging.totalCount} tín hiệu cảnh báo
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
};
