import { useEffect, useState } from 'react';
import {
  getOrders,
  getSuperPlans,
  cancelOrder,
  updateOrderNotes,
  downloadInvoice
} from '../api';
import type { OrderDetailDto, SubscriptionPlanDto } from '../types';
import FulfillModal from '../components/FulfillModal';
import {
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Download,
  Notebook,
  FileText,
  ExternalLink,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderDetailDto[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlanDto[]>([]);
  
  const [statusFilter, setStatusFilter] = useState('');
  const [planFilter, setPlanFilter] = useState<number | ''>('');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Pagination State
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Manual Fulfill target
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  
  // Note inline edit target
  const [editingNoteOrderId, setEditingNoteOrderId] = useState<number | null>(null);
  const [editingNoteValue, setEditingNoteValue] = useState('');

  const loadData = async (pageNum: number = 1) => {
    try {
      setLoading(true);
      const [ordersData, plansData] = await Promise.all([
        getOrders(statusFilter || undefined, planFilter || undefined, pageNum, pageSize),
        getSuperPlans()
      ]);
      setOrders(ordersData.items || []);
      setTotalPages(ordersData.totalPages || 1);
      setTotalCount(ordersData.totalCount || 0);
      setPage(ordersData.pageNumber || 1);
      setPlans(plansData);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Không thể tải danh sách đơn hàng.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(1);
  }, [statusFilter, planFilter]);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    loadData(newPage);
  };

  const handleCancelOrder = async (order: OrderDetailDto) => {
    const reason = window.prompt(`Nhập lý do hủy đơn #${order.id}:`);
    if (reason === null) return; // Prompt cancelled
    if (!reason.trim()) {
      alert('Vui lòng nhập lý do hủy đơn.');
      return;
    }

    try {
      await cancelOrder(order.id, reason);
      loadData(page);
    } catch (err: any) {
      alert(err.message || 'Lỗi khi hủy đơn hàng.');
    }
  };

  const handleDownloadInvoice = async (orderId: number) => {
    try {
      await downloadInvoice(orderId);
    } catch (err: any) {
      alert(err.message || 'Lỗi khi tải hóa đơn.');
    }
  };

  // Inline Note Editor handlers
  const startEditingNote = (order: OrderDetailDto) => {
    setEditingNoteOrderId(order.id);
    setEditingNoteValue(order.notes || '');
  };

  const handleNoteSave = async (orderId: number) => {
    try {
      const finalNote = editingNoteValue.trim() || null;
      await updateOrderNotes(orderId, finalNote);
      setEditingNoteOrderId(null);
      loadData(page);
    } catch (err: any) {
      alert(err.message || 'Lỗi cập nhật ghi chú.');
    }
  };

  const handleFulfillSuccess = () => {
    setSelectedOrderId(null);
    loadData(page);
  };

  const formatCurrency = (val: number) => {
    return `${val.toLocaleString('vi-VN')}đ`;
  };

  const renderStatusBadge = (status: OrderDetailDto['status']) => {
    switch (status) {
      case 'PAID':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">
            <CheckCircle size={12} />
            Đã Thanh Toán
          </span>
        );
      case 'PENDING_PAYMENT':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700">
            <Clock size={12} />
            Chờ Xử Lý
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-500">
            <XCircle size={12} />
            Đã Hủy
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-1 text-xs font-semibold text-rose-700">
            <AlertTriangle size={12} />
            Thất Bại
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        
        {/* Status Filter */}
        <div className="w-full sm:w-48">
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Lọc Trạng Thái</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm appearance-none focus:border-cyan-400/80 focus:outline-none"
          >
            <option value="">Tất cả</option>
            <option value="PENDING_PAYMENT">Chờ thanh toán</option>
            <option value="PAID">Đã thanh toán</option>
            <option value="CANCELLED">Đã hủy</option>
            <option value="FAILED">Thất bại</option>
          </select>
        </div>

        {/* Plan Filter */}
        <div className="w-full sm:w-48">
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Lọc Gói Subscription</label>
          <select
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value ? Number(e.target.value) : '')}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm appearance-none focus:border-cyan-400/80 focus:outline-none"
          >
            <option value="">Tất cả gói</option>
            {plans.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-rose-50 border border-rose-200 p-4 text-sm text-rose-800">
          {error}
        </div>
      )}

      {/* Orders Table Grid */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-[900px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/70 text-xs font-bold uppercase tracking-wider text-slate-500">
              <th className="px-5 py-4">ID</th>
              <th className="px-5 py-4">Khách Hàng / Công Ty</th>
              <th className="px-5 py-4">Gói / Chu Kỳ</th>
              <th className="px-5 py-4">Giá Trị</th>
              <th className="px-5 py-4">Trạng Thái</th>
              <th className="px-5 py-4">Ngày Tạo</th>
              <th className="px-5 py-4">Ghi Chú Nội Bộ</th>
              <th className="px-5 py-4 text-right">Thao Tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {loading ? (
              <tr>
                <td colSpan={8} className="px-5 py-12 text-center text-slate-450">
                  <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent" />
                  <span className="mt-2 block text-[11px]">Đang tải danh sách đơn hàng...</span>
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-5 py-12 text-center text-slate-400">
                  Không tìm thấy đơn hàng nào.
                </td>
              </tr>
            ) : (
              orders.map((order) => {
                return (
                  <tr key={order.id} className="hover:bg-slate-50/40 text-slate-700">
                    <td className="px-5 py-4 font-mono font-bold text-slate-500">#{order.id}</td>
                    <td className="px-5 py-4">
                      <p className="font-bold text-slate-800">{order.customerEmail}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{order.organizationName || 'Chưa liên kết Org'}</p>
                    </td>
                    <td className="px-5 py-4 font-semibold text-slate-800">
                      {order.planName}
                      <span className="block text-[9px] font-bold text-slate-400 uppercase mt-0.5">{order.billingCycle}</span>
                    </td>
                    <td className="px-5 py-4 font-bold text-slate-900">{formatCurrency(order.amount)}</td>
                    <td className="px-5 py-4">{renderStatusBadge(order.status)}</td>
                    <td className="px-5 py-4 text-slate-500">
                      {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                      {order.paidAt && (
                        <span className="block text-[10px] text-emerald-600 mt-0.5">
                          Paid: {new Date(order.paidAt).toLocaleDateString('vi-VN')}
                        </span>
                      )}
                    </td>
                    
                    {/* Internal notes editor */}
                    <td className="px-5 py-4 max-w-[200px]">
                      {editingNoteOrderId === order.id ? (
                        <textarea
                          autoFocus
                          value={editingNoteValue}
                          onChange={(e) => setEditingNoteValue(e.target.value)}
                          onBlur={() => handleNoteSave(order.id)}
                          className="w-full rounded border border-slate-350 p-1.5 focus:outline-none focus:border-blue-500 resize-none"
                          rows={2}
                        />
                      ) : (
                        <div
                          onClick={() => startEditingNote(order)}
                          className="flex items-start gap-1 cursor-pointer group text-slate-500 hover:text-slate-900 min-h-[20px]"
                        >
                          <Notebook size={12} className="mt-0.5 flex-shrink-0 text-slate-300 group-hover:text-blue-500" />
                          <span className="line-clamp-2 italic text-[11px] leading-tight">
                            {order.notes || 'Thêm ghi chú nội bộ...'}
                          </span>
                        </div>
                      )}
                    </td>

                    {/* Actions Context buttons */}
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {order.status === 'PENDING_PAYMENT' && (
                          <>
                            <button
                              type="button"
                              onClick={() => setSelectedOrderId(order.id)}
                              className="rounded-lg bg-emerald-50 px-2.5 py-1.5 font-bold text-emerald-700 hover:bg-emerald-100 transition duration-150 active:scale-[0.96]"
                            >
                              Fulfill
                            </button>
                            <button
                              type="button"
                              onClick={() => handleCancelOrder(order)}
                              className="rounded-lg bg-slate-100/75 hover:bg-slate-200/80 px-2.5 py-1.5 font-bold text-slate-600 transition duration-150 active:scale-[0.96]"
                            >
                              Hủy
                            </button>
                          </>
                        )}

                        {order.status === 'PAID' && !order.organizationId && (
                          <button
                            type="button"
                            onClick={() => setSelectedOrderId(order.id)}
                            className="rounded-lg bg-emerald-50 px-2.5 py-1.5 font-bold text-emerald-700 hover:bg-emerald-100 transition duration-150 active:scale-[0.96]"
                          >
                            Fulfill (Org)
                          </button>
                        )}

                        {order.status === 'PAID' && order.organizationId && (
                          <button
                            type="button"
                            onClick={() => { window.location.hash = `#/super/organizations`; }}
                            className="inline-flex items-center gap-1 rounded-lg bg-cyan-50 px-2.5 py-1.5 font-bold text-cyan-700 hover:bg-cyan-100 transition duration-150 active:scale-[0.96]"
                            title="Xem chi tiết doanh nghiệp"
                          >
                            <ExternalLink size={12} />
                            <span>Xem Org</span>
                          </button>
                        )}

                        {/* Invoice download button */}
                        <button
                          type="button"
                          onClick={() => handleDownloadInvoice(order.id)}
                          title="Tải hóa đơn"
                          className="rounded-lg border border-slate-200 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition duration-150 active:scale-[0.96]"
                        >
                          <Download size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Control */}
      {!loading && orders.length > 0 && (
        <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row">
          <p className="text-xs text-slate-500 font-medium">
            Hiển thị <span className="font-bold text-slate-800">{((page - 1) * pageSize) + 1}</span> đến{' '}
            <span className="font-bold text-slate-800">
              {Math.min(page * pageSize, totalCount)}
            </span>{' '}
            trong tổng số <span className="font-bold text-slate-800">{totalCount}</span> đơn hàng
          </p>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page <= 1}
              className="rounded-xl border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent"
            >
              <ChevronLeft size={16} />
            </button>

            {/* Render page numbers */}
            {(() => {
              const pages = [];
              const maxVisible = 5;
              
              let start = Math.max(1, page - Math.floor(maxVisible / 2));
              let end = Math.min(totalPages, start + maxVisible - 1);
              
              if (end - start + 1 < maxVisible) {
                start = Math.max(1, end - maxVisible + 1);
              }
              
              for (let i = start; i <= end; i++) {
                pages.push(
                  <button
                    key={i}
                    onClick={() => handlePageChange(i)}
                    className={`h-9 w-9 rounded-xl text-xs font-bold transition-all ${
                      page === i
                        ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                        : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {i}
                  </button>
                );
              }
              
              return pages;
            })()}

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

      {/* Manual Fulfill Modal */}
      {selectedOrderId !== null && (
        <FulfillModal
          orderId={selectedOrderId}
          onClose={() => setSelectedOrderId(null)}
          onSuccess={handleFulfillSuccess}
        />
      )}
    </div>
  );
}
