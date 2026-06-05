import { useState } from "react";
import { useSurveyStatus } from "@/features/survey/useSurveyStatus";
import { notify } from "@/lib/notify";

export default function Survey() {
  const { status, history, loading, error, refetch, submit } =
    useSurveyStatus();
  const [morale, setMorale] = useState(3);
  const [stress, setStress] = useState(3);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (status?.hasSubmittedThisMonth) return;
    if (morale < 1 || morale > 5 || stress < 1 || stress > 5) return;
    try {
      setSubmitting(true);
      const ok = await submit({
        moraleScore: morale,
        stressScore: stress,
        comment: comment || undefined,
      });
      if (ok) {
        notify({ title: "Survey", message: "Cảm ơn bạn đã gửi khảo sát." });
        void refetch();
        setComment("");
      } else {
        notify({
          title: "Survey failed",
          message: "Không thể gửi khảo sát. Vui lòng thử lại.",
          severity: "medium",
        });
      }
    } catch (err) {
      console.error(err);
      notify({
        title: "Survey error",
        message: "Lỗi khi gửi khảo sát",
        type: "ERROR",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-2xl font-semibold">
        Khảo sát tinh thần & hiệu suất
      </h1>

      {loading && (
        <div className="mt-4 text-sm text-gray-500">Đang tải...</div>
      )}
      {error && <div className="mt-4 text-sm text-red-600">{error}</div>}

      {status && status.hasSubmittedThisMonth ? (
        <div className="mt-6 rounded-lg bg-amber-50 p-4">
          Bạn đã gửi khảo sát cho tháng này. Cảm ơn bạn!
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          <div>
            <label className="block text-sm text-gray-700">
              Điểm tinh thần (1-5)
            </label>
            <select
              value={morale}
              onChange={(e) => setMorale(parseInt(e.target.value, 10))}
              className="mt-1 rounded border px-3 py-2"
            >
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-700">
              Điểm căng thẳng (1-5)
            </label>
            <select
              value={stress}
              onChange={(e) => setStress(parseInt(e.target.value, 10))}
              className="mt-1 rounded border px-3 py-2"
            >
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-700">
              Ghi chú (tùy chọn)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="mt-1 w-full rounded border px-3 py-2"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="rounded bg-blue-600 px-4 py-2 text-white"
            >
              Gửi
            </button>
            <button
              onClick={() => {
                setComment("");
                setMorale(3);
                setStress(3);
              }}
              className="rounded border px-4 py-2"
            >
              Reset
            </button>
          </div>
        </div>
      )}

      <div className="mt-8">
        <h2 className="text-lg font-medium">Lịch sử</h2>
        <div className="mt-3 space-y-2">
          {history.length === 0 ? (
            <div className="text-sm text-gray-500">Chưa có lịch sử</div>
          ) : (
            history.map((h) => (
              <div key={h.id} className="rounded-lg bg-gray-50 p-3">
                <div className="text-sm text-gray-700">
                  {new Date(h.submittedAt || h.createdAt).toLocaleString()}
                </div>
                <div className="font-semibold">
                  Tinh thần: {h.moraleScore} — Căng thẳng: {h.stressScore}
                </div>
                {h.comment && (
                  <div className="text-sm text-gray-600 mt-1">
                    {h.comment}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
