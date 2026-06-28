import { useEffect, useState } from 'react';
import { getRefundRequests } from '../api';
import type { RefundRequestDto } from '../types';
import ReviewRefundModal from '../components/ReviewRefundModal';
import { ChevronLeft, ChevronRight, Clock, CheckCircle, XCircle } from 'lucide-react';

export default function RefundRequestsPage() {
  const [requests, setRequests] = useState<RefundRequestDto[]>([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [selectedRequest, setSelectedRequest] = useState<RefundRequestDto | null>(null);

  const fetchRequests = async (statusVal: string, pageNum: number = 1) => {
    try {
      setLoading(true);
      const data = await getRefundRequests(statusVal || undefined, pageNum, pageSize);
      setRequests(data.items || []);
      setTotalPages(data.totalPages || 1);
      setTotalCount(data.totalCount || 0);
      setPage(data.page || 1);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Không thể tải danh sách yêu cầu hoàn tiền.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests('', 1);
  }, []);

  const handleStatusChange = (val: string) => {
    setStatusFilter(val);
    fetchRequests(val, 1);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    fetchRequests(statusFilter, newPage);
  };

  const handleReviewSuccess = () => {
    setSelectedRequest(null);
    fetchRequests(statusFilter, page);
  };

  const formatVND = (price: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  const renderStatusBadge = (status: RefundRequestDto['status']) => {
    if (status === 'APPROVED') {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 border border-emerald-200">
          <CheckCircle size={12} /> Đã Duyệt
        </span>
      );
    }
    if (status === 'REJECTED') {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-700 border border-rose-200">
          <XCircle size={12} /> Đã Từ Chối
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700 border border-amber-200">
        <Clock size={12} /> Chờ Duyệt
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="w-full sm:w-56">
        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Lọc Trạng Thái</label>
        <select
          value={statusFilter}
          onChange={(e) => handleStatusChange(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm appearance-none focus:border-blue-500 focus:outline-none"
        >
          <option value="">Tất cả</option>
          <option value="PENDING">Chờ duyệt</option>
          <option value="APPROVED">Đã duyệt</option>
          <option value="REJECTED">Đã từ chối</option>
        </select>
      </div>

      {error && (
        <div className="rounded-xl bg-rose-50 border border-rose-200 p-3.5 text-sm font-semibold text-rose-800">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
        </div>
      ) : requests.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-500 font-medium">
          Không có yêu cầu hoàn tiền nào.
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => (
            <div key={req.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-slate-900">Đơn #{req.orderId} — {req.planName}</h3>
                  {renderStatusBadge(req.status)}
                </div>
                <p className="text-xs text-slate-500">{req.companyName} · {req.customerEmail}</p>
                <p className="text-sm text-slate-600">{req.reason}</p>
                <p className="text-xs text-slate-400">
                  {formatVND(req.amount)} · Thanh toán {req.daysSincePaid} ngày trước
                </p>
              </div>
              {req.status === 'PENDING' && (
                <button
                  onClick={() => setSelectedRequest(req)}
                  className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-500/20 hover:bg-blue-500 transition shrink-0"
                >
                  Xem Xét
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {!loading && requests.length > 0 && (
        <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row">
          <p className="text-xs text-slate-500 font-medium">
            Hiển thị <span className="font-bold text-slate-800">{((page - 1) * pageSize) + 1}</span> đến{' '}
            <span className="font-bold text-slate-800">{Math.min(page * pageSize, totalCount)}</span>{' '}
            trong tổng số <span className="font-bold text-slate-800">{totalCount}</span> yêu cầu
          </p>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page <= 1}
              className="rounded-xl border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="px-2 text-xs font-semibold text-slate-600">Trang {page} / {totalPages}</span>
            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page >= totalPages}
              className="rounded-xl border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {selectedRequest && (
        <ReviewRefundModal
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
          onSuccess={handleReviewSuccess}
        />
      )}
    </div>
  );
}
