import { useState } from 'react';
import { X, AlertCircle, Loader2 } from 'lucide-react';
import { requestRefund } from '../api';

interface RefundRequestModalProps {
  orderId: number;
  onClose: () => void;
  onSuccess: () => void;
}

export default function RefundRequestModal({ orderId, onClose, onSuccess }: RefundRequestModalProps) {
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!reason.trim()) {
      setError('Please provide a reason for the refund request.');
      return;
    }
    try {
      setSubmitting(true);
      setError(null);
      await requestRefund(orderId, reason.trim());
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to submit refund request.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h3 className="text-lg font-bold text-slate-900">Request Refund</h3>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4 p-6">
          <div className="rounded-xl bg-blue-50 border border-blue-150 px-4 py-3 text-xs text-blue-800">
            Refund requests are only accepted within 7 days of payment, and only one request per order is allowed.
          </div>

          {error && (
            <div className="rounded-xl bg-rose-50 border border-rose-200 p-3.5 text-xs font-semibold text-rose-800 flex items-start gap-2">
              <AlertCircle size={14} className="shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Reason
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              maxLength={500}
              rows={4}
              placeholder="Explain why you're requesting a refund..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm transition focus:border-blue-500 focus:bg-white focus:outline-none resize-none"
            />
            <p className="mt-1 text-right text-xs text-slate-400">{reason.length}/500</p>
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-100 px-6 py-4">
          <button
            onClick={onClose}
            disabled={submitting}
            className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="rounded-xl bg-gradient-to-r from-blue-700 to-blue-500 px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-500/20 hover:from-blue-600 hover:to-blue-400 transition flex items-center gap-2 disabled:opacity-60"
          >
            {submitting && <Loader2 size={14} className="animate-spin" />}
            Submit Request
          </button>
        </div>
      </div>
    </div>
  );
}
