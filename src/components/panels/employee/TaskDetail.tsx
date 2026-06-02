import { useEffect, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  Clock,
  FileText,
  Loader2,
  MessageCircle,
  Paperclip,
  Tag,
  User,
} from "lucide-react";
import { getTaskDetail, getTaskComments, getTaskAttachments } from "@/lib/api";
import TimeTracker from "@/features/time-tracking/TimeTracker";
import CommentThread from "@/features/tasks/CommentThread";
import type {
  TaskInstanceDto,
  TaskCommentDto,
  TaskAttachmentDto,
} from "@/types/employee";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getTaskIdFromHash(): number | null {
  const match = window.location.hash.match(/#\/admin\/task\/(\d+)/);
  return match ? parseInt(match[1], 10) : null;
}

const statusMeta: Record<string, { label: string; cls: string }> = {
  PENDING:               { label: "Chờ xử lý",    cls: "bg-amber-50 text-amber-700" },
  IN_PROGRESS:           { label: "Đang thực hiện", cls: "bg-blue-50 text-blue-700" },
  PAUSED:                { label: "Tạm dừng",      cls: "bg-slate-100 text-slate-600" },
  WAITING_FOR_APPROVAL:  { label: "Chờ duyệt",     cls: "bg-violet-50 text-violet-700" },
  COMPLETED:             { label: "Hoàn thành",    cls: "bg-emerald-50 text-emerald-700" },
  CANCELLED:             { label: "Đã hủy",        cls: "bg-slate-100 text-slate-500" },
  REJECTED:              { label: "Bị từ chối",    cls: "bg-rose-50 text-rose-700" },
};

const priorityMeta: Record<string, { cls: string }> = {
  HIGH:   { cls: "bg-rose-50 text-rose-700" },
  MEDIUM: { cls: "bg-amber-50 text-amber-700" },
  LOW:    { cls: "bg-slate-100 text-slate-600" },
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function TaskDetail() {
  const taskId = getTaskIdFromHash();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [task, setTask] = useState<TaskInstanceDto | null>(null);
  const [comments, setComments] = useState<TaskCommentDto[]>([]);
  const [attachments, setAttachments] = useState<TaskAttachmentDto[]>([]);
  const [activeTab, setActiveTab] = useState<"details" | "comments" | "attachments">("details");

  const fetchData = async () => {
    if (!taskId) return;
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const [taskRes, commentsRes, attachmentsRes] = await Promise.allSettled([
        getTaskDetail(taskId),
        getTaskComments(taskId),
        getTaskAttachments(taskId),
      ]);

      if (taskRes.status === "fulfilled" && taskRes.value.data.succeeded) {
        setTask(taskRes.value.data.data);
      } else {
        throw new Error("Không thể tải chi tiết task.");
      }

      setComments(
        commentsRes.status === "fulfilled" && commentsRes.value.data.succeeded
          ? (commentsRes.value.data.data ?? [])
          : [],
      );
      setAttachments(
        attachmentsRes.status === "fulfilled" && attachmentsRes.value.data.succeeded
          ? (attachmentsRes.value.data.data ?? [])
          : [],
      );
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Không thể tải chi tiết task.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchData();
  }, [taskId]);

  // ── Invalid ID ───────────────────────────────────────────────────────────
  if (!taskId) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-700">
        <p className="font-semibold">Task ID không hợp lệ.</p>
      </div>
    );
  }

  // ── Loading ──────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center rounded-2xl border border-slate-200 bg-white">
        <div className="flex items-center gap-3 text-slate-600">
          <Loader2 className="h-5 w-5 animate-spin" />
          Đang tải chi tiết task...
        </div>
      </div>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────────
  if (errorMessage || !task) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-700">
        <p className="font-semibold">Không tải được task</p>
        <p className="mt-1 text-sm">{errorMessage ?? "Dữ liệu không hợp lệ."}</p>
      </div>
    );
  }

  const sm = statusMeta[task.status] ?? { label: task.status, cls: "bg-slate-100 text-slate-600" };
  const pm = priorityMeta[task.priority] ?? priorityMeta.LOW;

  const tabs = [
    { key: "details" as const,     label: "Chi tiết",    icon: FileText,     count: null },
    { key: "comments" as const,    label: "Bình luận",   icon: MessageCircle, count: comments.length },
    { key: "attachments" as const, label: "Đính kèm",    icon: Paperclip,    count: attachments.length },
  ];

  return (
    <div className="space-y-6">
      {/* ── Back button ─────────────────────────────────────────────────── */}
      <button
        type="button"
        onClick={() => window.history.back()}
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
      >
        <ArrowLeft size={16} />
        Quay lại danh sách
      </button>

      {/* ── Header card ─────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="font-mono text-sm font-semibold text-slate-400">
              {task.taskCode}
            </p>
            <h1 className="mt-1 text-2xl font-bold text-slate-900">{task.title}</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className={`rounded-full px-3 py-1 text-sm font-semibold ${sm.cls}`}>
              {sm.label}
            </span>
            <span className={`rounded-full px-3 py-1 text-sm font-semibold ${pm.cls}`}>
              {task.priority}
            </span>
          </div>
        </div>

        {/* Overdue warning */}
        {task.isOverdue && (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
            <AlertTriangle size={16} />
            Task này đã quá hạn!
          </div>
        )}

        {/* Meta grid */}
        <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            { icon: Tag,  label: "Loại task",        value: task.taskTypeName },
            { icon: Clock, label: "Thời gian chuẩn",  value: `${task.standardTimeMinutes ?? "—"} phút` },
            { icon: User,  label: "Được giao cho",    value: task.assignedUserName },
            { icon: Clock, label: "Deadline",         value: new Date(task.expectedCompletion).toLocaleDateString("vi-VN") },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="rounded-xl bg-slate-50 px-4 py-3">
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Icon size={12} />
                  {item.label}
                </div>
                <p className="mt-1 font-semibold text-slate-900 text-sm">{item.value}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Tabs ────────────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        {/* Tab bar */}
        <div className="flex border-b border-slate-200 px-4 pt-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition ${
                  activeTab === tab.key
                    ? "border-slate-900 text-slate-900"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                <Icon size={14} />
                {tab.label}
                {tab.count !== null && (
                  <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-xs font-semibold text-slate-600">
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab content */}
        <div className="p-6">
          {/* Details tab */}
          {activeTab === "details" && (
            <div className="space-y-6">
              {/* Efficiency info */}
              {(task.actualMinutes != null || task.efficiencyRatio != null) && (
                <div className="grid grid-cols-2 gap-3">
                  {task.actualMinutes != null && (
                    <div className="rounded-xl bg-slate-50 px-4 py-3">
                      <p className="text-xs text-slate-500">Thời gian thực tế</p>
                      <p className="mt-1 text-lg font-bold text-slate-900">
                        {task.actualMinutes} phút
                      </p>
                    </div>
                  )}
                  {task.efficiencyRatio != null && (
                    <div className="rounded-xl bg-slate-50 px-4 py-3">
                      <p className="text-xs text-slate-500">Efficiency Ratio</p>
                      <p className="mt-1 text-lg font-bold text-slate-900">
                        {(task.efficiencyRatio * 100).toFixed(1)}%
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Submission note */}
              {task.submissionNote && (
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4">
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Ghi chú nộp bài
                  </p>
                  <p className="text-sm text-slate-700">{task.submissionNote}</p>
                </div>
              )}

              {/* Time Tracker */}
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <TimeTracker
                  taskId={task.id}
                  status={task.status}
                  onStopped={() => void fetchData()}
                  onStarted={() => void fetchData()}
                  onPaused={() => void fetchData()}
                  onResumed={() => void fetchData()}
                />
              </div>
            </div>
          )}

          {/* Comments tab */}
          {activeTab === "comments" && (
            <div className="h-[500px]">
              <CommentThread
                taskId={task.id}
                initialComments={comments}
                onCommentAdded={(c) => setComments((s) => [...s, c])}
              />
            </div>
          )}

          {/* Attachments tab */}
          {activeTab === "attachments" && (
            <div className="space-y-3">
              {attachments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                  <Paperclip size={28} className="mb-3 opacity-40" />
                  <p className="text-sm">Không có file đính kèm.</p>
                </div>
              ) : (
                attachments.map((att) => (
                  <div
                    key={att.id}
                    className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
                  >
                    <div>
                      <p className="font-semibold text-slate-900">{att.fileName}</p>
                      <p className="text-xs text-slate-500">
                        {(att.fileSize / 1024).toFixed(1)} KB
                      </p>
                    </div>
                    <a
                      href={att.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                    >
                      Tải xuống
                    </a>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
