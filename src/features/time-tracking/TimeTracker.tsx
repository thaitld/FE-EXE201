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
  } = useTimeTracking();

  const [error, setError] = useState<string | null>(null);

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

  const handleStop = async () => {
    setError(null);
    try {
      const note = window.prompt("Ghi chú tùy chọn cho phiên làm việc này:") || undefined;
      const res = await stop(taskId, note);
      if (res && res.succeeded === false) {
        setError(res.message || "Không thể kết thúc đếm giờ.");
        return;
      }
      notify({ title: "Timer", message: "Đã dừng và lưu phiên làm việc" });
      if (onStopped) {
        try {
          onStopped();
        } catch {}
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || "Không thể kết thúc đếm giờ.";
      setError(msg);
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
                onClick={handleStop}
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
                onClick={handleStop}
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
    </div>
  );
}
