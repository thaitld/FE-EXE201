import { useEffect, useState } from "react";
import { useTimeTracking } from "./useTimeTracking";
import { notify } from "@/lib/notify";
import { CheckCircle2, AlertCircle } from "lucide-react";

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
  const [showStopModal, setShowStopModal] = useState(false);
  const [stopNote, setStopNote] = useState("");
  const [toast, setToast] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToast({ text, type });
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  };

  useEffect(() => {
    // If there's an active session for a different task, ignore — UI should reconcile
  }, [session]);

  const handleStart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setError(null);
    try {
      await start(taskId);
      showToast("Đã bắt đầu đếm giờ làm việc!");
      if (onStarted) {
        try {
          onStarted();
        } catch {}
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || "Không thể bắt đầu đếm giờ.";
      setError(msg);
      showToast("Không thể bắt đầu đếm giờ!", "error");
      notify({
        title: "Lỗi đếm giờ",
        message: msg,
        type: "ERROR",
      });
    }
  };

  const handlePause = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setError(null);
    try {
      await pause(taskId);
      showToast("Đã tạm dừng đếm giờ.");
      if (onPaused) {
        try {
          onPaused();
        } catch {}
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || "Không thể tạm dừng đếm giờ.";
      setError(msg);
      showToast("Không thể tạm dừng đếm giờ!", "error");
      notify({
        title: "Lỗi đếm giờ",
        message: msg,
        type: "ERROR",
      });
    }
  };

  const handleResume = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setError(null);
    try {
      await resume(taskId);
      showToast("Đã tiếp tục đếm giờ làm việc!");
      if (onResumed) {
        try {
          onResumed();
        } catch {}
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || "Không thể tiếp tục đếm giờ.";
      setError(msg);
      showToast("Không thể tiếp tục đếm giờ!", "error");
      notify({
        title: "Lỗi đếm giờ",
        message: msg,
        type: "ERROR",
      });
    }
  };

  const handleStopClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setStopNote("");
    setShowStopModal(true);
  };

  const confirmStop = async () => {
    setError(null);
    try {
      const res = await stop(taskId, stopNote.trim() || undefined);
      if (res && res.succeeded === false) {
        setError(res.message || "Không thể kết thúc đếm giờ.");
        showToast(res.message || "Không thể dừng phiên đếm giờ", "error");
        return;
      }
      setShowStopModal(false);
      showToast("Đã dừng đếm giờ và ghi nhận kết quả thành công!");
      notify({
        title: "Đếm giờ",
        message: "Đã dừng đếm giờ và lưu phiên làm việc thành công"
      });
      if (onStopped) {
        try {
          onStopped();
        } catch {}
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || "Không thể kết thúc đếm giờ.";
      setError(msg);
      showToast("Lỗi: Không thể dừng đếm giờ!", "error");
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
              type="button"
              className="rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600 transition"
              onClick={handleStart}
              disabled={loading}
            >
              ▶ Bắt đầu
            </button>
          )}

          {isRunning && (
            <>
              <button
                type="button"
                className="rounded bg-orange-400 px-4 py-2 text-white hover:bg-orange-500 transition"
                onClick={handlePause}
                disabled={loading}
              >
                ⏸ Tạm dừng
              </button>
              <button
                type="button"
                className="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600 transition"
                onClick={handleStopClick}
                disabled={loading}
              >
                ⏹ Dừng
              </button>
            </>
          )}

          {isPaused && (
            <>
              <button
                type="button"
                className="rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600 transition"
                onClick={handleResume}
                disabled={loading}
              >
                ▶ Tiếp tục
              </button>
              <button
                type="button"
                className="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600 transition"
                onClick={handleStopClick}
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

      {/* Modern Dialog Modal for Stopping Tasks */}
      {showStopModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm transition-opacity"
            onClick={() => setShowStopModal(false)}
          />

          {/* Modal Content */}
          <div className="relative z-10 w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 shadow-2xl transition-all border border-slate-100">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Ghi chú kết thúc task</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Nhập ghi chú (tùy chọn) về kết quả hoặc nội dung bạn đã hoàn thành trong phiên này.
                </p>
              </div>

              <textarea
                value={stopNote}
                onChange={(e) => setStopNote(e.target.value)}
                placeholder="Ví dụ: Đã viết xong unit test cho UserService và fix bug..."
                className="w-full h-28 rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition resize-none"
              />

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowStopModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={confirmStop}
                  className="rounded-xl bg-slate-900 hover:bg-slate-800 px-4 py-2 text-sm font-semibold text-white transition"
                >
                  Xác nhận
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-6 left-1/2 z-50 -translate-x-1/2 flex items-center gap-3 rounded-2xl bg-slate-900/95 backdrop-blur-md px-5 py-3.5 text-white shadow-2xl border border-slate-800/50 animate-in fade-in slide-in-from-top-4 duration-300">
          {toast.type === "success" ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="h-5 w-5 text-rose-400 shrink-0" />
          )}
          <span className="text-sm font-medium text-slate-100">{toast.text}</span>
        </div>
      )}
    </div>
  );
}
