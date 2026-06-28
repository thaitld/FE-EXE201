import { useState } from 'react';
import { X, AlertCircle, Loader2, Calendar, ShieldAlert } from 'lucide-react';
import { requestRefund } from '../api';
import type { OrderDetailDto } from '../types';
import { useTranslation } from 'react-i18next';

interface RefundRequestModalProps {
  order: OrderDetailDto;
  onClose: () => void;
  onSuccess: () => void;
}

export default function RefundRequestModal({ order, onClose, onSuccess }: RefundRequestModalProps) {
  const { i18n } = useTranslation();
  const isVi = i18n.language === 'vi';
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const daysSincePaid = Math.floor(
    (Date.now() - new Date(order.paidAt || order.createdAt).getTime()) / (1000 * 60 * 60 * 24)
  );
  const daysRemaining = Math.max(0, 7 - daysSincePaid);

  const formatVND = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const handleSubmit = async () => {
    if (!reason.trim()) {
      setError(isVi ? 'Vui lòng nhập lý do yêu cầu hoàn tiền.' : 'Please provide a reason for the refund request.');
      return;
    }
    try {
      setSubmitting(true);
      setError(null);
      await requestRefund(order.id, reason.trim());
      onSuccess();
    } catch (err: any) {
      setError(err.message || (isVi ? 'Lỗi khi gửi yêu cầu hoàn tiền.' : 'Failed to submit refund request.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50/50">
          <h3 className="text-lg font-bold text-slate-900">
            {isVi ? 'Yêu Cầu Hoàn Tiền' : 'Request Refund'}
          </h3>
          <button onClick={onClose} disabled={submitting} className="rounded-full p-1.5 hover:bg-slate-200 text-slate-400 hover:text-slate-650 transition">
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4 p-6">
          {/* Order Info Summary */}
          <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 space-y-2.5 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">{isVi ? 'Đơn hàng:' : 'Order:'}</span>
              <span className="font-bold text-slate-900">#{order.id} — {order.planName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">{isVi ? 'Số tiền hoàn:' : 'Refund Amount:'}</span>
              <span className="font-bold text-blue-600">{formatVND(order.amount)}</span>
            </div>
            {order.paidAt && (
              <div className="flex justify-between items-center text-xs text-slate-500">
                <span className="flex items-center gap-1"><Calendar size={13} /> {isVi ? 'Ngày thanh toán:' : 'Payment Date:'}</span>
                <span className="font-semibold text-slate-700">{new Date(order.paidAt).toLocaleDateString(isVi ? 'vi-VN' : 'en-US')}</span>
              </div>
            )}
            <div className="flex justify-between items-center text-xs text-slate-500 pt-1.5 border-t border-slate-100">
              <span>{isVi ? 'Thời hạn hoàn tiền:' : 'Refund Eligibility:'}</span>
              <span className={`px-2 py-0.5 rounded-full font-bold ${daysRemaining > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                {isVi ? `Còn lại ${daysRemaining} ngày` : `${daysRemaining} days remaining`}
              </span>
            </div>
          </div>

          {/* Org Suspension Warning */}
          <div className="flex gap-2.5 rounded-2xl bg-amber-50 border border-amber-200 p-4 text-xs text-amber-800 leading-relaxed">
            <ShieldAlert className="flex-shrink-0 mt-0.5 text-amber-600" size={16} />
            <p>
              {isVi 
                ? 'Lưu ý: Nếu yêu cầu hoàn tiền được duyệt, tài khoản tổ chức (workspace) sẽ bị tạm ngưng và các gói dịch vụ đang hoạt động sẽ bị hủy.' 
                : 'Warning: If your refund request is approved, your organization workspace will be suspended and active subscription plans will be cancelled.'}
            </p>
          </div>

          {error && (
            <div className="rounded-xl bg-rose-50 border border-rose-200 p-3.5 text-xs font-semibold text-rose-800 flex items-start gap-2">
              <AlertCircle size={14} className="shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              {isVi ? 'Lý do hoàn tiền *' : 'Reason for Refund *'}
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              maxLength={500}
              rows={4}
              placeholder={isVi ? 'Vui lòng giải thích rõ lý do bạn muốn hoàn tiền...' : 'Explain why you\'re requesting a refund...'}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm transition focus:border-blue-500 focus:bg-white focus:outline-none resize-none"
            />
            <p className="mt-1 text-right text-xs text-slate-400">{reason.length}/500</p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-3 border-t border-slate-100 px-6 py-4 bg-slate-50/30">
          <button
            onClick={onClose}
            disabled={submitting}
            className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            {isVi ? 'Hủy' : 'Cancel'}
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="rounded-xl bg-gradient-to-r from-blue-700 to-blue-500 px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-500/20 hover:from-blue-600 hover:to-blue-400 transition flex items-center gap-2 disabled:opacity-60"
          >
            {submitting && <Loader2 size={14} className="animate-spin" />}
            {isVi ? 'Gửi Yêu Cầu' : 'Submit Request'}
          </button>
        </div>
      </div>
    </div>
  );
}
