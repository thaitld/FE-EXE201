import { useState } from "react";
import { useSurveyStatus } from "@/features/survey/useSurveyStatus";
import { notify } from "@/lib/notify";
import {
  Sparkles,
  CheckCircle2,
  Calendar,
  TrendingUp,
  TrendingDown,
  Minus,
  Loader2,
  MessageSquare,
  BarChart2,
  ChevronRight,
} from "lucide-react";

// ── Helpers ──────────────────────────────────────────────────────────────────

const MORALE_CONFIG = [
  { score: 1, emoji: "😞", label: "Rất tệ", color: "#ef4444", bg: "#fef2f2", border: "#fecaca" },
  { score: 2, emoji: "😟", label: "Không tốt", color: "#f97316", bg: "#fff7ed", border: "#fed7aa" },
  { score: 3, emoji: "😐", label: "Bình thường", color: "#eab308", bg: "#fefce8", border: "#fef08a" },
  { score: 4, emoji: "😊", label: "Tốt", color: "#22c55e", bg: "#f0fdf4", border: "#bbf7d0" },
  { score: 5, emoji: "😄", label: "Rất tốt", color: "#3b82f6", bg: "#eff6ff", border: "#bfdbfe" },
];

const STRESS_CONFIG = [
  { score: 1, emoji: "😌", label: "Rất thư giãn", color: "#3b82f6", bg: "#eff6ff", border: "#bfdbfe" },
  { score: 2, emoji: "🙂", label: "Khá thư thái", color: "#22c55e", bg: "#f0fdf4", border: "#bbf7d0" },
  { score: 3, emoji: "😤", label: "Chút áp lực", color: "#eab308", bg: "#fefce8", border: "#fef08a" },
  { score: 4, emoji: "😰", label: "Khá căng thẳng", color: "#f97316", bg: "#fff7ed", border: "#fed7aa" },
  { score: 5, emoji: "🤯", label: "Cực kỳ căng thẳng", color: "#ef4444", bg: "#fef2f2", border: "#fecaca" },
];

function ScorePicker({
  value,
  onChange,
  config,
}: {
  value: number;
  onChange: (v: number) => void;
  config: typeof MORALE_CONFIG;
}) {
  return (
    <div className="flex gap-3">
      {config.map((c) => (
        <button
          key={c.score}
          type="button"
          onClick={() => onChange(c.score)}
          style={
            value === c.score
              ? { background: c.bg, borderColor: c.color, color: c.color }
              : {}
          }
          className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-2xl border-2 transition-all duration-200 ${
            value === c.score
              ? "scale-105 shadow-md"
              : "border-slate-200 bg-white text-slate-400 hover:border-slate-300 hover:bg-slate-50"
          }`}
        >
          <span className="text-2xl">{c.emoji}</span>
          <span className="text-[11px] font-semibold leading-tight text-center">{c.label}</span>
          <span
            className="text-xs font-bold"
            style={{ color: value === c.score ? c.color : "#94a3b8" }}
          >
            {c.score}
          </span>
        </button>
      ))}
    </div>
  );
}

function ScoreBadge({ score, config }: { score: number; config: typeof MORALE_CONFIG }) {
  const c = config.find((x) => x.score === score) ?? config[2];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-bold"
      style={{ background: c.bg, color: c.color, border: `1.5px solid ${c.border}` }}
    >
      {c.emoji} {c.score} — {c.label}
    </span>
  );
}

function TrendIcon({ current, prev }: { current: number; prev: number }) {
  if (current > prev) return <TrendingUp size={14} className="text-emerald-500" />;
  if (current < prev) return <TrendingDown size={14} className="text-rose-500" />;
  return <Minus size={14} className="text-slate-400" />;
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function Survey() {
  const { status, history, loading, error, refetch, submit } = useSurveyStatus();
  const [morale, setMorale] = useState(3);
  const [stress, setStress] = useState(3);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const hasSubmitted = status?.hasSubmittedThisMonth || submitted;
  const daysLeft = status?.daysRemainingInMonth ?? 0;

  const now = new Date();
  const monthLabel = now.toLocaleDateString("vi-VN", { month: "long", year: "numeric" });

  const handleSubmit = async () => {
    if (hasSubmitted || submitting) return;
    try {
      setSubmitting(true);
      const ok = await submit({ moraleScore: morale, stressScore: stress, comment: comment || undefined });
      if (ok) {
        setSubmitted(true);
        notify({ title: "Survey", message: "Cảm ơn bạn đã gửi khảo sát!" });
        void refetch();
        setComment("");
      } else {
        notify({ title: "Survey failed", message: "Không thể gửi khảo sát. Vui lòng thử lại.", severity: "medium" });
      }
    } catch (err) {
      console.error(err);
      notify({ title: "Survey error", message: "Lỗi khi gửi khảo sát", type: "ERROR" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && !status) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-10">

      {/* ── Header ── */}
      <div className="rounded-3xl overflow-hidden relative"
        style={{ background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #a855f7 100%)" }}>
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
        <div className="relative p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={18} className="text-purple-200" />
              <span className="text-purple-200 text-sm font-semibold uppercase tracking-widest">Monthly Check-in</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white mb-1">Khảo sát Tinh thần</h1>
            <p className="text-purple-200 text-sm">{monthLabel} · Còn {daysLeft} ngày để gửi khảo sát</p>
          </div>
          <div className="flex gap-4">
            <div className="text-center bg-white/15 backdrop-blur rounded-2xl px-5 py-3">
              <p className="text-2xl font-extrabold text-white">{history.length}</p>
              <p className="text-purple-200 text-xs font-semibold mt-0.5">Lần đã gửi</p>
            </div>
            {history.length > 0 && (
              <div className="text-center bg-white/15 backdrop-blur rounded-2xl px-5 py-3">
                <p className="text-2xl font-extrabold text-white">
                  {(history.reduce((s, h) => s + h.moraleScore, 0) / history.length).toFixed(1)}
                </p>
                <p className="text-purple-200 text-xs font-semibold mt-0.5">Avg tinh thần</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl bg-rose-50 border border-rose-200 p-4 text-sm text-rose-700">{error}</div>
      )}

      {/* ── Survey Form or Submitted State ── */}
      {hasSubmitted ? (
        <div className="rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 p-8 flex flex-col items-center text-center shadow-sm">
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
            <CheckCircle2 size={32} className="text-emerald-600" />
          </div>
          <h2 className="text-xl font-bold text-emerald-900 mb-1">Đã gửi khảo sát tháng này!</h2>
          <p className="text-emerald-700 text-sm max-w-sm">
            Cảm ơn bạn đã chia sẻ. Phản hồi của bạn giúp chúng tôi cải thiện môi trường làm việc.
          </p>
          {history[0] && (
            <div className="mt-6 flex flex-wrap gap-3 justify-center">
              <ScoreBadge score={history[0].moraleScore} config={MORALE_CONFIG} />
              <ScoreBadge score={history[0].stressScore} config={STRESS_CONFIG} />
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          {/* Form Header */}
          <div className="px-8 py-5 border-b border-slate-100 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center">
              <Sparkles size={18} className="text-indigo-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Khảo sát tháng này</h2>
              <p className="text-xs text-slate-500">Chọn điểm phù hợp với cảm nhận của bạn</p>
            </div>
          </div>

          <div className="p-8 space-y-8">
            {/* Morale */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-slate-800">
                  😊 Tinh thần làm việc
                </label>
                <span className="text-xs text-slate-500 bg-slate-100 rounded-full px-3 py-1 font-semibold">
                  {MORALE_CONFIG.find(c => c.score === morale)?.label}
                </span>
              </div>
              <ScorePicker value={morale} onChange={setMorale} config={MORALE_CONFIG} />
            </div>

            {/* Stress */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-slate-800">
                  🧠 Mức độ căng thẳng
                </label>
                <span className="text-xs text-slate-500 bg-slate-100 rounded-full px-3 py-1 font-semibold">
                  {STRESS_CONFIG.find(c => c.score === stress)?.label}
                </span>
              </div>
              <ScorePicker value={stress} onChange={setStress} config={STRESS_CONFIG} />
            </div>

            {/* Comment */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <MessageSquare size={15} className="text-slate-500" />
                Chia sẻ thêm <span className="font-normal text-slate-400">(tùy chọn)</span>
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Điều gì đang ảnh hưởng đến bạn tuần này? Có điều gì bạn muốn chia sẻ với quản lý?"
                rows={3}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 placeholder:text-slate-400 outline-none focus:border-indigo-400 focus:bg-white transition resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl py-3 text-sm font-bold text-white transition disabled:opacity-60"
                style={{ background: "linear-gradient(135deg, #4f46e5, #7c3aed)" }}
              >
                {submitting ? (
                  <><Loader2 size={16} className="animate-spin" /> Đang gửi...</>
                ) : (
                  <><Sparkles size={16} /> Gửi khảo sát</>
                )}
              </button>
              <button
                onClick={() => { setMorale(3); setStress(3); setComment(""); }}
                className="px-5 py-3 rounded-2xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
              >
                Đặt lại
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── History ── */}
      {history.length > 0 && (
        <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center">
                <BarChart2 size={18} className="text-slate-600" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Lịch sử khảo sát</h2>
                <p className="text-xs text-slate-500">{history.length} lần đã gửi</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Calendar size={13} />
              <span>Gần nhất trước</span>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {history.map((h, idx) => {
              const prev = history[idx + 1];
              const date = new Date(h.submittedAt || h.createdAt);
              return (
                <div key={h.id} className="px-8 py-5 hover:bg-slate-50 transition group">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      {/* Date */}
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Calendar size={12} />
                        <span className="font-semibold">
                          {date.toLocaleDateString("vi-VN", { day: "2-digit", month: "long", year: "numeric" })}
                        </span>
                        <span>·</span>
                        <span>{date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}</span>
                      </div>

                      {/* Scores */}
                      <div className="flex flex-wrap gap-2">
                        <ScoreBadge score={h.moraleScore} config={MORALE_CONFIG} />
                        <ScoreBadge score={h.stressScore} config={STRESS_CONFIG} />
                      </div>

                      {/* Comment */}
                      {h.comment && (
                        <p className="text-sm text-slate-600 bg-slate-50 rounded-xl px-4 py-3 border border-slate-100 italic">
                          "{h.comment}"
                        </p>
                      )}
                    </div>

                    {/* Trend vs previous */}
                    {prev && (
                      <div className="flex flex-col items-end gap-1.5 shrink-0 text-xs text-slate-400">
                        <div className="flex items-center gap-1">
                          <TrendIcon current={h.moraleScore} prev={prev.moraleScore} />
                          <span>Tinh thần</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <TrendIcon current={h.stressScore} prev={prev.stressScore} />
                          <span>Căng thẳng</span>
                        </div>
                      </div>
                    )}

                    <ChevronRight size={16} className="text-slate-300 group-hover:text-slate-400 shrink-0 mt-1 transition" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {history.length === 0 && !loading && (
        <div className="rounded-3xl border border-slate-200 bg-white shadow-sm p-12 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
            <BarChart2 size={28} className="text-slate-400" />
          </div>
          <p className="text-slate-600 font-semibold">Chưa có lịch sử khảo sát</p>
          <p className="text-slate-400 text-sm mt-1">Gửi khảo sát đầu tiên của bạn ngay hôm nay!</p>
        </div>
      )}
    </div>
  );
}
