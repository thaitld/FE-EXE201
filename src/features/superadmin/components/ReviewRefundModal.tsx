import { useState } from 'react';
import { X, ShieldAlert } from 'lucide-react';
import { reviewRefundRequest } from '../api';
import type { RefundRequestDto } from '../types';

interface ReviewRefundModalProps {
  request: RefundRequestDto;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ReviewRefundModal({ request, onClose, onSuccess }: ReviewRefundModalProps) {
  const [reviewNotes, setReviewNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleReview = async (action: 'APPROVE' | 'REJECT') => {
    try {
      setSubmitting(true);
      setError('');
      await reviewRefundRequest(request.id, { action, reviewNotes: reviewNotes.trim() || undefined });
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Lỗi khi xử lý yêu cầu hoàn tiền.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatVND = (price: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-6 py-4">
          <h3 className="text-lg font-bold text-slate-800">Yêu Cầu Hoàn Tiền #{request.id}</h3>
          <button onClick={onClose} disabled={submitting} className="rounded-full p-1.5 hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {error && (
            <div className="rounded-xl bg-rose-50 border border-rose-200 p-3.5 text-xs font-semibold text-rose-800">
              {error}
            </div>
          )}

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Công ty:</span>
              <span className="font-semibold text-slate-900">{request.companyName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Khách hàng:</span>
              <span className="font-semibold text-slate-900">{request.customerName} ({request.customerEmail})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Gói:</span>
              <span className="font-semibold text-slate-900">{request.planName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Số tiền:</span>
              <span className="font-bold text-slate-900">{formatVND(request.amount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Đã thanh toán:</span>
              <span className="font-semibold text-slate-900">{request.daysSincePaid} ngày trước</span>
            </div>
          </div>

          <div className="rounded-xl bg-slate-50 border border-slate-200 p-3.5 text-xs text-slate-700">
            <span className="font-semibold text-slate-800">Lý do khách hàng: </span>
            {request.reason}
          </div>

          <div className="flex gap-3 rounded-2xl bg-amber-50 border border-amber-150 p-4 text-xs text-amber-800 leading-relaxed">
            <ShieldAlert className="flex-shrink-0 mt-0.5" size={18} />
            <p>
              Duyệt yêu cầu sẽ: chuyển đơn hàng sang <strong>REFUNDED</strong>, tổ chức liên quan sang <strong>Suspended</strong>,
              và hủy mọi subscription đang active. Hành động này không thể hoàn tác.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Ghi chú duyệt (tuỳ chọn)
            </label>
            <textarea
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              maxLength={500}
              rows={3}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm transition focus:border-blue-500 focus:bg-white focus:outline-none resize-none"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-100 px-6 py-4">
          <button
            onClick={() => handleReview('REJECT')}
            disabled={submitting}
            className="rounded-xl border border-rose-200 bg-rose-50 px-5 py-2.5 text-sm font-semibold text-rose-700 hover:bg-rose-100 transition disabled:opacity-60"
          >
            Từ Chối
          </button>
          <button
            onClick={() => handleReview('APPROVE')}
            disabled={submitting}
            className="rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-emerald-500/20 hover:bg-emerald-500 transition disabled:opacity-60"
          >
            Duyệt
          </button>
        </div>
      </div>
    </div>
  );
}
