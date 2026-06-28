import { useEffect, useState } from 'react';
import { getMyRefundRequests } from '../api';
import type { RefundRequestDto } from '../types';
import CustomerLayout from '../components/CustomerLayout';
import { Loader2, AlertCircle, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function RefundHistoryPage() {
  const { t, i18n } = useTranslation();
  const isVi = i18n.language === 'vi';
  const [requests, setRequests] = useState<RefundRequestDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await getMyRefundRequests();
        setRequests(data);
      } catch (err: any) {
        setError(err.message || (isVi ? 'Không thể tải yêu cầu hoàn tiền.' : 'Unable to load refund requests.'));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [isVi]);

  const formatVND = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const renderStatusBadge = (status: RefundRequestDto['status']) => {
    if (status === 'APPROVED') {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 border border-emerald-200">
          <CheckCircle size={12} /> {isVi ? 'Đã duyệt' : 'Approved'}
        </span>
      );
    }
    if (status === 'REJECTED') {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-700 border border-rose-200">
          <XCircle size={12} /> {isVi ? 'Đã từ chối' : 'Rejected'}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700 border border-amber-200">
        <Clock size={12} /> {isVi ? 'Chờ duyệt' : 'Pending'}
      </span>
    );
  };

  return (
    <CustomerLayout pageTitle={t("customer_layout.refunds")}>
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4 bg-white border border-slate-200 rounded-3xl">
          <Loader2 size={40} className="text-blue-600 animate-spin" />
          <p className="text-slate-500 font-medium">
            {isVi ? 'Đang tải danh sách hoàn tiền...' : 'Loading refund requests...'}
          </p>
        </div>
      ) : error ? (
        <div className="max-w-md mx-auto text-center py-16 bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
          <AlertCircle size={40} className="text-rose-500 mx-auto mb-4" />
          <p className="text-slate-800 font-semibold">{error}</p>
        </div>
      ) : requests.length === 0 ? (
        <div className="max-w-md mx-auto text-center py-16 bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
          <p className="text-slate-500 font-semibold">
            {isVi ? 'Bạn chưa gửi yêu cầu hoàn tiền nào.' : "You haven't submitted any refund requests."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => (
            <div key={req.id} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                <div>
                  <h3 className="font-bold text-slate-900">
                    {isVi ? `Đơn hàng #${req.orderId} — Gói ${req.planName}` : `Order #${req.orderId} — ${req.planName}`}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {isVi 
                      ? `Yêu cầu gửi ngày ${new Date(req.createdAt).toLocaleDateString('vi-VN')}`
                      : `Requested on ${new Date(req.createdAt).toLocaleDateString('en-US')}`}
                  </p>
                </div>
                {renderStatusBadge(req.status)}
              </div>
              <p className="text-sm text-slate-600 mb-2">
                <span className="font-semibold text-slate-850 text-slate-800">
                  {isVi ? 'Lý do: ' : 'Reason: '}
                </span>
                {req.reason}
              </p>
              <p className="text-sm font-bold text-slate-900 mb-2">{formatVND(req.amount)}</p>
              {req.reviewNotes && (
                <div className="rounded-xl bg-slate-50 border border-slate-200 px-4 py-2.5 text-xs text-slate-650 text-slate-600">
                  <span className="font-semibold text-slate-850 text-slate-800">
                    {isVi ? 'Ghi chú duyệt: ' : 'Reviewer notes: '}
                  </span>
                  {req.reviewNotes}
                </div>
              )}

              {req.status === 'REJECTED' && (
                <div className="mt-3">
                  <a
                    href="mailto:support@manto.exe"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 px-4 py-2 text-xs font-semibold text-rose-700 transition"
                  >
                    {isVi ? 'Liên hệ hỗ trợ' : 'Contact Support'}
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </CustomerLayout>
  );
}
