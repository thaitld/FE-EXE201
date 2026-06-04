import { useEffect, useState, useCallback } from "react";
import {
  ClipboardList,
  Plus,
  RefreshCw,
  Search,
  CheckCircle2,
  XCircle,
  Trash2,
  Edit2,
  Copy,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertTriangle,
  Download,
} from "lucide-react";
import {
  getManagerTasks,
  updateTaskStatus,
  bulkUpdateTaskStatus,
  exportTasksExcel,
  type TaskFilterManagerParams,
  type PagedResult,
} from "@/lib/api";
import type { TaskInstanceDto } from "@/types/employee";
import { CreateTaskModal } from "./CreateTaskModal";

// ── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_META: Record<string, { label: string; className: string }> = {
  PENDING: { label: "Chờ xử lý", className: "bg-amber-50 text-amber-700" },
  IN_PROGRESS: { label: "Đang làm", className: "bg-blue-50 text-blue-700" },
  PAUSED: { label: "Tạm dừng", className: "bg-slate-100 text-slate-600" },
  WAITING_FOR_APPROVAL: { label: "Chờ duyệt", className: "bg-violet-50 text-violet-700" },
  COMPLETED: { label: "Hoàn thành", className: "bg-emerald-50 text-emerald-700" },
  CANCELLED: { label: "Đã hủy", className: "bg-slate-100 text-slate-500" },
  REJECTED: { label: "Từ chối", className: "bg-rose-50 text-rose-700" },
};

const PRIORITY_META: Record<string, { label: string; className: string }> = {
  LOW: { label: "Thấp", className: "bg-slate-100 text-slate-600" },
  MEDIUM: { label: "Trung bình", className: "bg-amber-50 text-amber-700" },
  HIGH: { label: "Cao", className: "bg-rose-50 text-rose-700" },
  CRITICAL: { label: "Khẩn cấp", className: "bg-rose-100 text-rose-800 font-bold" },
};

const STATUS_FILTERS = [
  "ALL",
  "PENDING",
  "IN_PROGRESS",
  "WAITING_FOR_APPROVAL",
  "COMPLETED",
  "CANCELLED",
  "REJECTED",
] as const;

// ── Reject Modal ─────────────────────────────────────────────────────────────

function RejectModal({
  taskId,
  taskTitle,
  onClose,
  onRejected,
}: {
  taskId: number;
  taskTitle: string;
  onClose: () => void;
  onRejected: () => void;
}) {
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return setError("Vui lòng nhập lý do từ chối.");
    setIsSubmitting(true);
    try {
      const res = await updateTaskStatus(taskId, {
        status: "REJECTED",
        rejectionReason: reason.trim(),
      });
      if (res.data.succeeded) {
        onRejected();
        onClose();
      } else {
        setError(res.data.message ?? "Từ chối thất bại.");
      }
    } catch {
      setError("Lỗi kết nối.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/40" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <h3 className="text-lg font-semibold text-slate-900">Từ chối Task</h3>
        <p className="mt-1 text-sm text-slate-500 truncate">{taskTitle}</p>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Lý do từ chối <span className="text-rose-500">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              placeholder="Nhập lý do từ chối..."
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none placeholder:text-slate-400 resize-none"
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
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:opacity-60"
            >
              {isSubmitting && <Loader2 size={14} className="animate-spin" />}
              Từ chối
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export function TaskManagementPanel() {
  const [tasks, setTasks] = useState<TaskInstanceDto[]>([]);
  const [paging, setPaging] = useState<Omit<PagedResult<unknown>, "items"> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);

  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [rejectTarget, setRejectTarget] = useState<{ id: number; title: string } | null>(null);

  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  const fetchTasks = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params: TaskFilterManagerParams = {
        page,
        pageSize: 15,
        ...(statusFilter !== "ALL" && { status: statusFilter }),
        ...(priorityFilter && { priority: priorityFilter }),
      };
      const res = await getManagerTasks(params);
      if (res.data.succeeded && res.data.data) {
        setTasks(res.data.data.items);
        const { items: _items, ...rest } = res.data.data;
        void _items;
        setPaging(rest as Omit<PagedResult<unknown>, "items">);
      } else {
        setError(res.data.message ?? "Không tải được danh sách task.");
      }
    } catch {
      setError("Lỗi kết nối — không thể tải dữ liệu.");
    } finally {
      setIsLoading(false);
    }
  }, [page, statusFilter, priorityFilter]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Reset page on filter change
  useEffect(() => {
    setPage(1);
    setSelectedIds(new Set());
  }, [statusFilter, priorityFilter]);

  const handleApprove = async (taskId: number) => {
    setActionLoading(taskId);
    try {
      const res = await updateTaskStatus(taskId, { status: "COMPLETED" });
      if (res.data.succeeded) fetchTasks();
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancel = async (taskId: number) => {
    if (!confirm("Bạn có chắc muốn hủy task này?")) return;
    setActionLoading(taskId);
    try {
      const res = await updateTaskStatus(taskId, { status: "CANCELLED" });
      if (res.data.succeeded) fetchTasks();
    } finally {
      setActionLoading(null);
    }
  };

  const handleBulkApprove = async () => {
    if (selectedIds.size === 0) return;
    setBulkLoading(true);
    try {
      const res = await bulkUpdateTaskStatus({
        taskIds: [...selectedIds],
        status: "COMPLETED",
      });
      if (res.data.succeeded) {
        setSelectedIds(new Set());
        fetchTasks();
      }
    } finally {
      setBulkLoading(false);
    }
  };

  const handleBulkReject = async () => {
    const reason = prompt("Lý do từ chối (bắt buộc):");
    if (!reason) return;
    setBulkLoading(true);
    try {
      const res = await bulkUpdateTaskStatus({
        taskIds: [...selectedIds],
        status: "REJECTED",
        rejectionReason: reason,
      });
      if (res.data.succeeded) {
        setSelectedIds(new Set());
        fetchTasks();
      }
    } finally {
      setBulkLoading(false);
    }
  };

  const handleExport = async () => {
    setExportLoading(true);
    try {
      await exportTasksExcel({
        status: statusFilter !== "ALL" ? statusFilter : undefined,
        priority: priorityFilter || undefined,
      });
    } finally {
      setExportLoading(false);
    }
  };

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filteredTasks = tasks.filter(
    (t) =>
      !searchTerm ||
      t.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.taskCode?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      {/* Modals */}
      {showCreateModal && (
        <CreateTaskModal
          onClose={() => setShowCreateModal(false)}
          onCreated={() => { fetchTasks(); setShowCreateModal(false); }}
        />
      )}
      {rejectTarget && (
        <RejectModal
          taskId={rejectTarget.id}
          taskTitle={rejectTarget.title}
          onClose={() => setRejectTarget(null)}
          onRejected={() => { fetchTasks(); setRejectTarget(null); }}
        />
      )}

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ClipboardList size={18} className="text-slate-500" />
          <h2 className="text-lg font-semibold text-slate-900">Quản lý Task</h2>
        </div>
        <div className="flex items-center gap-2">
          {/* Bulk actions */}
          {selectedIds.size > 0 && (
            <>
              <span className="text-sm text-slate-500">
                Đã chọn: <b>{selectedIds.size}</b>
              </span>
              <button
                type="button"
                onClick={handleBulkApprove}
                disabled={bulkLoading}
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
              >
                {bulkLoading ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                Duyệt tất cả
              </button>
              <button
                type="button"
                onClick={handleBulkReject}
                disabled={bulkLoading}
                className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:opacity-60"
              >
                <XCircle size={14} /> Từ chối tất cả
              </button>
            </>
          )}
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
            onClick={() => fetchTasks()}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            <RefreshCw size={14} />
          </button>
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            <Plus size={14} /> Tạo Task
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        {/* Status filter pills */}
        <div className="flex gap-1 overflow-x-auto border-b border-slate-200 px-4 py-2">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatusFilter(s)}
              className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                statusFilter === s
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {s === "ALL"
                ? "Tất cả"
                : STATUS_META[s]?.label ?? s}
            </button>
          ))}
        </div>

        {/* Search + Priority */}
        <div className="flex flex-wrap items-center gap-3 px-4 py-3">
          <div className="flex items-center gap-2 flex-1 min-w-[200px] rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
            <Search size={16} className="text-slate-400 shrink-0" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo tiêu đề hoặc mã task..."
              className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
            />
          </div>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none"
          >
            <option value="">Tất cả ưu tiên</option>
            {Object.entries(PRIORITY_META).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
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
        ) : filteredTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <ClipboardList size={32} className="mb-3 opacity-40" />
            <p className="text-sm">Không có task nào.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-t border-slate-100">
                  <th className="w-10 px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.size === filteredTasks.length && filteredTasks.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedIds(new Set(filteredTasks.map((t) => t.id)));
                        else setSelectedIds(new Set());
                      }}
                      className="rounded"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Mã</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Tiêu đề</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Assignee</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Trạng thái</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Ưu tiên</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Hạn</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTasks.map((task) => {
                  const isWaiting = task.status === "WAITING_FOR_APPROVAL";
                  const isOverdue =
                    task.expectedCompletion &&
                    new Date(task.expectedCompletion) < new Date() &&
                    !["COMPLETED", "CANCELLED"].includes(task.status);
                  const statusMeta = STATUS_META[task.status] ?? { label: task.status, className: "bg-slate-50 text-slate-600" };
                  const priorityMeta = PRIORITY_META[task.priority ?? ""] ?? { label: task.priority ?? "—", className: "bg-slate-50 text-slate-500" };

                  return (
                    <tr key={task.id} className="transition hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(task.id)}
                          onChange={() => toggleSelect(task.id)}
                          className="rounded"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs font-semibold text-slate-400">
                          {task.taskCode ?? `#${task.id}`}
                        </span>
                      </td>
                      <td className="max-w-[200px] px-4 py-3">
                        <p className="truncate text-sm font-medium text-slate-900">{task.title}</p>
                        {isOverdue && (
                          <span className="inline-flex items-center gap-1 text-xs text-rose-600">
                            <AlertTriangle size={10} /> Quá hạn
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700">
                        {task.assignedUserName ?? "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusMeta.className}`}>
                          {statusMeta.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${priorityMeta.className}`}>
                          {priorityMeta.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-500">
                        {task.expectedCompletion
                          ? new Date(task.expectedCompletion).toLocaleDateString("vi-VN")
                          : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1.5">
                          {isWaiting && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleApprove(task.id)}
                                disabled={actionLoading === task.id}
                                title="Phê duyệt"
                                className="rounded-lg p-1.5 text-emerald-600 transition hover:bg-emerald-50 disabled:opacity-50"
                              >
                                {actionLoading === task.id ? (
                                  <Loader2 size={15} className="animate-spin" />
                                ) : (
                                  <CheckCircle2 size={15} />
                                )}
                              </button>
                              <button
                                type="button"
                                onClick={() => setRejectTarget({ id: task.id, title: task.title })}
                                title="Từ chối"
                                className="rounded-lg p-1.5 text-rose-600 transition hover:bg-rose-50"
                              >
                                <XCircle size={15} />
                              </button>
                            </>
                          )}
                          <button
                            type="button"
                            onClick={() => window.location.hash = `#/admin/task/${task.id}`}
                            title="Xem chi tiết"
                            className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100"
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            type="button"
                            title="Clone task"
                            className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100"
                          >
                            <Copy size={15} />
                          </button>
                          {!["COMPLETED", "CANCELLED"].includes(task.status) && (
                            <button
                              type="button"
                              onClick={() => handleCancel(task.id)}
                              disabled={actionLoading === task.id}
                              title="Hủy task"
                              className="rounded-lg p-1.5 text-rose-500 transition hover:bg-rose-50 disabled:opacity-50"
                            >
                              <Trash2 size={15} />
                            </button>
                          )}
                        </div>
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
              Trang {paging.pageNumber} / {paging.totalPages} · {paging.totalCount} task
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
