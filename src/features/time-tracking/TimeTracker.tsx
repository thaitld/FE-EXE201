import { useEffect, useState } from "react";
import { useTimeTracking } from "./useTimeTracking";
import { notify } from "@/lib/notify";

type Props = {
  taskId: number;
  status: string;
  onStopped?: () => void;
  onStarted?: () => void;
  onPaused?: () => void;
  onResumed?: () => void;
};

export default function TimeTracker({
  taskId,
  status,
  onStopped,
  onStarted,
  onPaused,
  onResumed,
}: Props) {
  const {
    session,
    isRunning,
    isPaused,
    loading,
    start,
    pause,
    resume,
    stop,
    timeLabel,
  } = useTimeTracking(taskId);

  const [error, setError] = useState<string | null>(null);
  const [isStopModalOpen, setIsStopModalOpen] = useState(false);
  const [stopNote, setStopNote] = useState("");

  useEffect(() => {
    // If there's an active session for a different task, ignore — UI should reconcile
  }, [session]);

  const handleStart = async () => {
    setError(null);
    try {
      await start(taskId);
      if (onStarted) {
        try {
          onStarted();
        } catch {}
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || "Không thể bắt đầu đếm giờ.";
      setError(msg);
      notify({
        title: "Lỗi đếm giờ",
        message: msg,
        type: "ERROR",
      });
    }
  };

  const handlePause = async () => {
    setError(null);
    try {
      await pause(taskId);
      if (onPaused) {
        try {
          onPaused();
        } catch {}
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || "Không thể tạm dừng đếm giờ.";
      setError(msg);
      notify({
        title: "Lỗi đếm giờ",
        message: msg,
        type: "ERROR",
      });
    }
  };

  const handleResume = async () => {
    setError(null);
    try {
      await resume(taskId);
      if (onResumed) {
        try {
          onResumed();
        } catch {}
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || "Không thể tiếp tục đếm giờ.";
      setError(msg);
      notify({
        title: "Lỗi đếm giờ",
        message: msg,
        type: "ERROR",
      });
    }
  };

  const handleOpenStopModal = () => {
    setStopNote("");
    setIsStopModalOpen(true);
  };

  const handleConfirmStop = async () => {
    setError(null);
    try {
      const noteParam = stopNote.trim() || undefined;
      const res = await stop(taskId, noteParam);
      if (res && res.succeeded === false) {
        setError(res.message || "Không thể kết thúc đếm giờ.");
        setIsStopModalOpen(false);
        return;
      }
      notify({ title: "Timer", message: "Đã dừng và lưu phiên làm việc" });
      setIsStopModalOpen(false);
      if (onStopped) {
        try {
          onStopped();
        } catch {}
      }
    } catch (err: any) {
      console.error("Stop Task Error Details:", err);
      const backendMsg = err.response?.data?.message || err.response?.data?.Message || (typeof err.response?.data === 'string' ? err.response.data : null);
      const msg = backendMsg || err.message || "Không thể kết thúc đếm giờ.";
      setError(msg);
      setIsStopModalOpen(false);
      notify({
        title: "Lỗi đếm giờ",
        message: msg,
        type: "ERROR",
      });
    }
  };

  return (
    <div className="rounded-lg bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-2xl font-mono">{timeLabel}</div>
          <div className="text-sm text-gray-500">Elapsed</div>
        </div>
        <div className="flex items-center gap-2">
          {status === "PENDING" && (
            <button
              className="rounded bg-green-500 px-4 py-2 text-white"
              onClick={handleStart}
              disabled={loading}
            >
              ▶ Bắt đầu
            </button>
          )}

          {isRunning && (
            <>
              <button
                className="rounded bg-orange-400 px-4 py-2 text-white"
                onClick={handlePause}
                disabled={loading}
              >
                ⏸ Tạm dừng
              </button>
              <button
                className="rounded bg-red-500 px-4 py-2 text-white"
                onClick={handleOpenStopModal}
                disabled={loading}
              >
                ⏹ Dừng
              </button>
            </>
          )}

          {isPaused && (
            <>
              <button
                className="rounded bg-green-500 px-4 py-2 text-white"
                onClick={handleResume}
                disabled={loading}
              >
                ▶ Tiếp tục
              </button>
              <button
                className="rounded bg-red-500 px-4 py-2 text-white"
                onClick={handleOpenStopModal}
                disabled={loading}
              >
                ⏹ Dừng
              </button>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-medium text-rose-700">
          Lỗi: {error}
        </div>
      )}

      {/* Modern custom modal for stopping task time tracking */}
      {isStopModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
            onClick={() => setIsStopModalOpen(false)}
          />

          {/* Modal Content */}
          <div className="relative z-10 w-full max-w-md transform rounded-2xl bg-white p-6 shadow-xl transition-all border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-lg font-semibold text-slate-950">
              Kết thúc phiên làm việc
            </h3>

            <p className="mt-2 text-sm leading-relaxed text-slate-500">
              Mục đích ghi chú: Giúp bạn lưu lại nội dung chi tiết các công việc đã hoàn thành trong phiên đếm giờ này (ví dụ: viết tài liệu, sửa bug...) để gửi báo cáo trực tiếp cho Manager tiện theo dõi. Ghi chú này là tùy chọn.
            </p>

            <div className="mt-4">
              <label
                htmlFor="stop-note"
                className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5"
              >
                Ghi chú công việc (Tùy chọn)
              </label>
              <textarea
                id="stop-note"
                rows={3}
                value={stopNote}
                onChange={(e) => setStopNote(e.target.value)}
                placeholder="Nhập nội dung công việc bạn đã thực hiện..."
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all resize-none shadow-sm"
              />
            </div>

            <div className="mt-6 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsStopModalOpen(false)}
                className="rounded-xl px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 active:bg-slate-100 transition-colors"
                disabled={loading}
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleConfirmStop}
                className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 active:bg-indigo-800 transition-colors shadow-sm disabled:opacity-50"
                disabled={loading}
              >
                {loading ? "Đang lưu..." : "Xác nhận & Dừng"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
