import { useState } from 'react';
import { fulfillOrder } from '../api';
import type { FulfillOrderResponseDto } from '../types';
import { X, ShieldAlert, Key, ClipboardCheck, CheckSquare, Square } from 'lucide-react';

interface FulfillModalProps {
  orderId: number;
  onClose: () => void;
  onSuccess: () => void;
}

export default function FulfillModal({ orderId, onClose, onSuccess }: FulfillModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [fulfillResult, setFulfillResult] = useState<FulfillOrderResponseDto | null>(null);
  
  // Clipboard copy status
  const [copied, setCopied] = useState(false);
  const [isPasswordSaved, setIsPasswordSaved] = useState(false);

  const handleConfirmFulfill = async () => {
    setError('');
    try {
      setIsSubmitting(true);
      const res = await fulfillOrder(orderId);
      setFulfillResult(res);
    } catch (err: any) {
      setError(err.message || 'Lỗi khi kích hoạt đơn hàng.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyPassword = () => {
    if (!fulfillResult?.tempPassword) return;
    navigator.clipboard.writeText(fulfillResult.tempPassword);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleComplete = () => {
    if (!isPasswordSaved) return;
    onSuccess();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl transition-all animate-in fade-in zoom-in duration-200">
        
        {/* Header - conditional title */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-6 py-4.5">
          <div className="flex items-center gap-2">
            <Key className="text-blue-600 animate-pulse" size={20} />
            <h3 className="text-lg font-bold text-slate-800">
              {fulfillResult ? 'Kích Hoạt Thành Công' : `Xác Nhận Fulfill Đơn #${orderId}`}
            </h3>
          </div>
          {/* Prevent closing header button once order is fulfilled to avoid password loss */}
          {!fulfillResult && (
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-full p-1.5 hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Content Block */}
        <div className="p-6">
          {error && (
            <div className="mb-4 rounded-xl bg-rose-50 border border-rose-200 p-3.5 text-xs font-semibold text-rose-800">
              {error}
            </div>
          )}

          {!fulfillResult ? (
            /* Dialog 1: Confirmation Prompt */
            <div className="space-y-4">
              <div className="flex gap-3 rounded-2xl bg-amber-50 border border-amber-150 p-4 text-xs text-amber-800 leading-relaxed">
                <ShieldAlert className="flex-shrink-0 mt-0.5" size={18} />
                <div>
                  <p className="font-bold text-amber-900">Cảnh Báo Vận Hành</p>
                  <p className="mt-1">
                    Bạn đang thực hiện **Fulfill thủ công** (kích hoạt bằng tay) đơn hàng #{orderId}. Hành động này chỉ nên dùng khi bạn đã kiểm tra và nhận được tiền thanh toán thực tế của khách hàng (chuyển khoản ngân hàng trực tiếp).
                  </p>
                  <p className="mt-2 font-bold">
                    Hệ thống sẽ tự động tạo tài khoản doanh nghiệp quản trị mới. Hành động này KHÔNG THỂ HOÀN TÁC.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleConfirmFulfill}
                  disabled={isSubmitting}
                  className="rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-emerald-500/20 hover:bg-emerald-500 transition flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Đang Xử Lý...
                    </>
                  ) : (
                    'Xác Nhận Fulfill'
                  )}
                </button>
              </div>
            </div>
          ) : (
            /* Dialog 2: Fulfillment Results & Password copy */
            <div className="space-y-4">
              <div className="rounded-xl bg-emerald-50 border border-emerald-150 p-4 text-xs text-emerald-800">
                Khởi tạo tổ chức thành công. Mã định danh ID: <strong className="text-emerald-900">{fulfillResult.organizationId}</strong>.
              </div>

              {/* Password Display box */}
              <div className="space-y-2">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-550">
                  Mật Khẩu Quản Trị Tạm Thời
                </label>
                <div className="flex rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <code className="flex-1 text-sm font-extrabold text-slate-800 font-mono tracking-wider select-all select-none">
                    {fulfillResult.tempPassword}
                  </code>
                  <button
                    type="button"
                    onClick={handleCopyPassword}
                    className="ml-2 flex items-center gap-1 rounded-lg bg-blue-50 hover:bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-600 transition"
                  >
                    <ClipboardCheck size={14} />
                    <span>{copied ? 'Đã copy!' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              {/* Danger Warning Warning */}
              <div className="rounded-xl bg-rose-50 border border-rose-150 p-3.5 text-[11px] leading-relaxed text-rose-800">
                ⚠️ <strong>Cảnh báo quan trọng:</strong> Mật khẩu này chỉ được hiển thị <strong>DUY NHẤT MỘT LẦN</strong> tại màn hình này. Hãy chắc chắn đã sao chép mật khẩu gửi cho khách hàng trước khi bấm đóng.
              </div>

              {/* Confirmation Checkbox */}
              <button
                type="button"
                onClick={() => setIsPasswordSaved(!isPasswordSaved)}
                className="flex items-center gap-3 w-full text-left text-xs font-medium text-slate-700 hover:text-slate-900 border border-slate-100 rounded-xl p-3 bg-slate-50/50 hover:bg-slate-50 transition"
              >
                {isPasswordSaved ? (
                  <CheckSquare size={18} className="text-blue-600 flex-shrink-0" />
                ) : (
                  <Square size={18} className="text-slate-400 flex-shrink-0" />
                )}
                <span>Tôi xác nhận đã sao chép mật khẩu tạm thời an toàn.</span>
              </button>

              {/* Finish Actions */}
              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  type="button"
                  onClick={handleComplete}
                  disabled={!isPasswordSaved}
                  className={`w-full rounded-xl py-3 text-sm font-semibold transition ${
                    isPasswordSaved
                      ? 'bg-blue-600 text-white shadow-md hover:bg-blue-500'
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  Xác Nhận Hoàn Tất
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
