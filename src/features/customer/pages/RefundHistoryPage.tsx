import { useEffect, useState } from 'react';
import { getMyRefundRequests } from '../api';
import type { RefundRequestDto } from '../types';
import CustomerLayout from '../components/CustomerLayout';
import { Loader2, AlertCircle, Clock, CheckCircle, XCircle } from 'lucide-react';

export default function RefundHistoryPage() {
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
        setError(err.message || 'Unable to load refund requests.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const formatVND = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const renderStatusBadge = (status: RefundRequestDto['status']) => {
    if (status === 'APPROVED') {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 border border-emerald-200">
          <CheckCircle size={12} /> Approved
        </span>
      );
    }
    if (status === 'REJECTED') {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-700 border border-rose-200">
          <XCircle size={12} /> Rejected
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700 border border-amber-200">
        <Clock size={12} /> Pending
      </span>
    );
  };

  return (
    <CustomerLayout pageTitle="Refund Requests">
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4 bg-white border border-slate-200 rounded-3xl">
          <Loader2 size={40} className="text-blue-600 animate-spin" />
          <p className="text-slate-500 font-medium">Loading refund requests...</p>
        </div>
      ) : error ? (
        <div className="max-w-md mx-auto text-center py-16 bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
          <AlertCircle size={40} className="text-rose-500 mx-auto mb-4" />
          <p className="text-slate-800 font-semibold">{error}</p>
        </div>
      ) : requests.length === 0 ? (
        <div className="max-w-md mx-auto text-center py-16 bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
          <p className="text-slate-500 font-semibold">You haven't submitted any refund requests.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => (
            <div key={req.id} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                <div>
                  <h3 className="font-bold text-slate-900">
                    Order #{req.orderId} — {req.planName}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Requested on {new Date(req.createdAt).toLocaleDateString('en-US')}
                  </p>
                </div>
                {renderStatusBadge(req.status)}
              </div>
              <p className="text-sm text-slate-600 mb-2">
                <span className="font-semibold text-slate-800">Reason: </span>
                {req.reason}
              </p>
              <p className="text-sm font-bold text-slate-900 mb-2">{formatVND(req.amount)}</p>
              {req.reviewNotes && (
                <div className="rounded-xl bg-slate-50 border border-slate-200 px-4 py-2.5 text-xs text-slate-600">
                  <span className="font-semibold text-slate-800">Reviewer notes: </span>
                  {req.reviewNotes}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </CustomerLayout>
  );
}
