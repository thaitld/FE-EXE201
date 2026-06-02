import { useEffect, useState } from "react";
import { getTaskDetail, getTaskComments, getTaskAttachments } from "@/lib/api";
import TimeTracker from "@/features/time-tracking/TimeTracker";
import CommentThread from "@/features/tasks/CommentThread";
import type {
  TaskInstanceDto,
  TaskCommentDto,
  TaskAttachmentDto,
} from "@/types/employee";

import { ArrowLeft } from "lucide-react";

function getTaskIdFromHash(): number | null {
  const match = window.location.hash.match(/#\/admin\/task\/(\d+)/);
  return match ? parseInt(match[1], 10) : null;
}

export default function TaskDetail() {
  const taskId = getTaskIdFromHash();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [task, setTask] = useState<TaskInstanceDto | null>(null);
  const [comments, setComments] = useState<TaskCommentDto[]>([]);
  const [attachments, setAttachments] = useState<TaskAttachmentDto[]>([]);
  const [activeTab, setActiveTab] = useState<
    "details" | "comments" | "attachments"
  >("details");

  // fetchData is used both on mount and to refresh after actions
  const fetchData = async () => {
    if (!taskId) return;
    try {
      setLoading(true);
      setError(null);

      const [taskRes, commentsRes, attachmentsRes] = await Promise.allSettled([
        getTaskDetail(taskId),
        getTaskComments(taskId),
        getTaskAttachments(taskId),
      ]);

      if (taskRes.status === "fulfilled" && taskRes.value.data.succeeded) {
        setTask(taskRes.value.data.data);
      } else if (taskRes.status === "rejected") {
        throw new Error(
          taskRes.reason?.message || "Failed to load task details",
        );
      } else {
        throw new Error("Failed to load task details");
      }

      if (
        commentsRes.status === "fulfilled" &&
        commentsRes.value.data.succeeded
      ) {
        setComments(commentsRes.value.data.data || []);
      } else {
        setComments([]); // Ignore error, allow task to display without comments
      }

      if (
        attachmentsRes.status === "fulfilled" &&
        attachmentsRes.value.data.succeeded
      ) {
        setAttachments(attachmentsRes.value.data.data || []);
      } else {
        setAttachments([]); // Ignore error, allow task to display without attachments
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load task details",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchData();
  }, [taskId]);

  if (!taskId) {
    return <div className="text-center text-red-600">Invalid task ID</div>;
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-red-800">{error}</div>
      )}

      {loading && (
        <div className="text-center text-gray-500">Loading task...</div>
      )}

      {task && (
        <>
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => {
                window.history.back();
              }}
              className="mb-2 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft size={16} />
              Quay lại danh sách
            </button>

            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold">{task.taskCode}</h1>
                <p className="text-lg text-gray-600">{task.title}</p>
              </div>
              <div className="flex gap-2">
                <span className="inline-block rounded bg-blue-100 px-3 py-1 font-medium text-blue-800">
                  {task.status}
                </span>
                <span className="inline-block rounded bg-yellow-100 px-3 py-1 font-medium text-yellow-800">
                  {task.priority}
                </span>
              </div>
            </div>

            {task.isOverdue && (
              <div className="rounded-lg bg-red-50 p-3 text-red-800">
                ⚠️ This task is overdue!
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 rounded-lg bg-gray-50 p-6 shadow-sm border border-slate-200">
            <div>
              <p className="text-sm text-gray-600">Task Type</p>
              <p className="font-semibold">{task.taskTypeName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Standard Time</p>
              <p className="font-semibold">{task.standardTimeMinutes} min</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Assigned To</p>
              <p className="font-semibold">{task.assignedUserName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Deadline</p>
              <p className="font-semibold">
                {new Date(task.expectedCompletion).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="border-b border-gray-200">
            <div className="flex gap-4">
              {["details", "comments", "attachments"].map((tab) => (
                <button
                  key={tab}
                  onClick={() =>
                    setActiveTab(tab as "details" | "comments" | "attachments")
                  }
                  className={`border-b-2 px-4 py-2 font-medium ${
                    activeTab === tab
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-600"
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {activeTab === "details" && (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Description</p>
                <p className="mt-2 text-gray-800">
                  {task.submissionNote || "No submission note"}
                </p>
              </div>
              {task.actualMinutes && (
                <div>
                  <p className="text-sm text-gray-600">Actual Time</p>
                  <p className="font-semibold">{task.actualMinutes} min</p>
                </div>
              )}
              {task.efficiencyRatio !== null && (
                <div>
                  <p className="text-sm text-gray-600">Efficiency Ratio</p>
                  <p className="font-semibold">
                    {task.efficiencyRatio.toFixed(2)}
                  </p>
                </div>
              )}
              <div>
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

          {activeTab === "comments" && (
            <div className="space-y-4 h-96">
              <h3 className="font-semibold">Comments ({comments.length})</h3>
              <div className="h-[calc(100%-4rem)]">
                <CommentThread
                  taskId={task.id}
                  initialComments={comments}
                  onCommentAdded={(c) => setComments((s) => [...s, c])}
                />
              </div>
            </div>
          )}

          {activeTab === "attachments" && (
            <div className="space-y-4">
              <h3 className="font-semibold">
                Attachments ({attachments.length})
              </h3>
              {attachments.map((attachment) => (
                <div
                  key={attachment.id}
                  className="flex items-center justify-between rounded-lg bg-gray-50 p-4 border border-slate-200"
                >
                  <div>
                    <p className="font-semibold">{attachment.fileName}</p>
                    <p className="text-sm text-gray-600">
                      {(attachment.fileSize / 1024).toFixed(2)} KB
                    </p>
                  </div>
                  <a
                    href={attachment.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
                  >
                    Download
                  </a>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
