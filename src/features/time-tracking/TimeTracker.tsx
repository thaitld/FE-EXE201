import { useEffect } from "react";
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

  useEffect(() => {
    // If there's an active session for a different task, ignore — UI should reconcile
  }, [session]);

  const handleStart = async () => {
    try {
      await start(taskId);
      if (onStarted) {
        try {
          onStarted();
        } catch {}
      }
    } catch (err) {
      notify({
        title: "Timer error",
        message: "Failed to start timer",
        type: "ERROR",
      });
    }
  };

  const handlePause = async () => {
    try {
      await pause(taskId);
      if (onPaused) {
        try {
          onPaused();
        } catch {}
      }
    } catch (err) {
      notify({
        title: "Timer error",
        message: "Failed to pause timer",
        type: "ERROR",
      });
    }
  };

  const handleResume = async () => {
    try {
      await resume(taskId);
      if (onResumed) {
        try {
          onResumed();
        } catch {}
      }
    } catch (err) {
      notify({
        title: "Timer error",
        message: "Failed to resume timer",
        type: "ERROR",
      });
    }
  };

  const handleStop = async () => {
    try {
      const note = window.prompt("Optional note for this session") || undefined;
      const res = await stop(taskId, note);
      if (res && res.succeeded === undefined) {
        // if res is ApiResponse wrapper returned directly, tolerate both shapes
      }
      notify({ title: "Timer", message: "Stopped and saved session" });
      if (onStopped) {
        try {
          onStopped();
        } catch {}
      }
    } catch (err) {
      notify({
        title: "Timer error",
        message: "Failed to stop timer",
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
    </div>
  );
}
