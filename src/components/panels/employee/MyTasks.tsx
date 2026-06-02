import { useEffect, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Loader2,
  RefreshCw,
  Tag,
} from "lucide-react";
import { getTasks } from "@/lib/api";
import type { TaskInstanceDto } from "@/types/employee";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_FILTERS = [
  "ALL",
  "PENDING",
  "IN_PROGRESS",
  "WAITING_FOR_APPROVAL",
  "COMPLETED",
] as const;

type StatusFilter = (typeof STATUS_FILTERS)[number];

const statusMeta: Record<
  string,
  { label: string; cls: string }
> = {
  PENDING: {
    label: "Chờ xử lý",
    cls: "bg-amber-50 text-amber-700",
  },
  IN_PROGRESS: {
    label: "Đang thực hiện",
    cls: "bg-blue-50 text-blue-700",
  },
  PAUSED: {
    label: "Tạm dừng",
    cls: "bg-slate-100 text-slate-600",
  },
  WAITING_FOR_APPROVAL: {
    label: "Chờ duyệt",
    cls: "bg-violet-50 text-violet-700",
  },
  COMPLETED: {
    label: "Hoàn thành",
    cls: "bg-emerald-50 text-emerald-700",
  },
  CANCELLED: {
    label: "Đã hủy",
    cls: "bg-slate-100 text-slate-500",
  },
  REJECTED: {
    label: "Bị từ chối",
    cls: "bg-rose-50 text-rose-700",
  },
};

const priorityMeta: Record<string, { cls: string }> = {
  HIGH: { cls: "bg-rose-50 text-rose-700" },
  MEDIUM: { cls: "bg-amber-50 text-amber-700" },
  LOW: { cls: "bg-slate-100 text-slate-600" },
};

const filterLabelMap: Record<StatusFilter, string> = {
  ALL: "Tất cả",
  PENDING: "Chờ xử lý",
  IN_PROGRESS: "Đang làm",
  WAITING_FOR_APPROVAL: "Chờ duyệt",
  COMPLETED: "Hoàn thành",
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function MyTasks() {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [tasks, setTasks] = useState<TaskInstanceDto[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);
  const [filter, setFilter] = useState<StatusFilter>("ALL");

  const fetchTasks = async (currentPage = page, currentFilter = filter) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await getTasks({
        page: currentPage,
        pageSize,
        status: currentFilter === "ALL" ? undefined : currentFilter,
      });
      if (res.data.succeeded && res.data.data) {
        const d = res.data.data;
        setTasks(d.items ?? []);
        setTotalPages(d.totalPages ?? 1);
        setTotalCount(d.totalCount ?? 0);
        setHasNext(d.hasNextPage ?? false);
        setHasPrev(d.hasPreviousPage ?? false);
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Không thể tải danh sách task.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchTasks(page, filter);
  }, [page, filter]);

  const handleFilterChange = (f: StatusFilter) => {
    setFilter(f);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* ── Header row ─────────────────────────────────────────────────── */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Công việc của tôi</h3>
            <p className="text-sm text-slate-500">
              {isLoading ? "Đang tải..." : `${totalCount} task`}
            </p>
          </div>
          <button
            type="button"
            onClick={() => void fetchTasks(page, filter)}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            <RefreshCw size={14} />
            Làm mới
          </button>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 overflow-x-auto border-b border-slate-200 px-4 py-2">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              onClick={() => handleFilterChange(s)}
              className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                filter === s
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {filterLabelMap[s]}
            </button>
          ))}
        </div>

        {/* Error */}
        {errorMessage && (
          <div className="mx-6 mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {errorMessage}
          </div>
        )}

        {/* Task list */}
        <div className="divide-y divide-slate-100">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-5 w-5 animate-spin text-slate-500" />
              <span className="ml-3 text-sm text-slate-500">Đang tải task...</span>
            </div>
          ) : tasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <CheckCircle2 size={32} className="mb-3 opacity-40" />
              <p className="text-sm">Không có task nào.</p>
            </div>
          ) : (
            tasks.map((task) => {
              const sm = statusMeta[task.status] ?? {
                label: task.status,
                cls: "bg-slate-100 text-slate-600",
              };
              const pm = priorityMeta[task.priority] ?? priorityMeta.LOW;

              return (
                <div
                  key={task.id}
                  className="flex cursor-pointer items-start justify-between gap-4 px-6 py-4 transition hover:bg-slate-50"
                  onClick={() => {
                    window.location.hash = `#/admin/task/${task.id}`;
                  }}
                >
                  {/* Left: task info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-semibold text-slate-400">
                        {task.taskCode}
                      </span>
                      {task.isOverdue && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-xs font-semibold text-rose-700">
                          <AlertCircle size={10} />
                          Quá hạn
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 truncate font-semibold text-slate-900">
                      {task.title}
                    </p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Tag size={11} />
                        {task.taskTypeName}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={11} />
                        {new Date(task.expectedCompletion).toLocaleDateString("vi-VN")}
                      </span>
                    </div>
                  </div>

                  {/* Right: badges */}
                  <div className="flex shrink-0 flex-col items-end gap-1.5">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${sm.cls}`}
                    >
                      {sm.label}
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${pm.cls}`}
                    >
                      {task.priority}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pagination */}
        {tasks.length > 0 && (
          <div className="flex items-center justify-between border-t border-slate-200 px-6 py-4">
            <p className="text-sm text-slate-500">
              Trang {page} / {totalPages} · {totalCount} task
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={!hasPrev}
                className="rounded-lg border border-slate-200 p-2 text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="px-2 text-sm text-slate-500">
                {page}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => (hasNext ? p + 1 : p))}
                disabled={!hasNext}
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
