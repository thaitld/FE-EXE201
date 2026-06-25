import { useEffect, useMemo, useState } from 'react';
import { getMyOrders, cancelOrder, repayOrder, downloadInvoice } from '../api';
import type { OrderSummaryDto } from '../types';
import CustomerLayout from '../components/CustomerLayout';
import {
  Loader2,
  AlertCircle,
  CheckCircle,
  CreditCard,
  Trash2,
  Download,
  ExternalLink,
  HelpCircle,
} from 'lucide-react';

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderSummaryDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [cancelConfirmId, setCancelConfirmId] = useState<number | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Parse query parameters
  const queryParams = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    const hash = window.location.hash;
    const hashQuestionIndex = hash.indexOf('?');
    if (hashQuestionIndex !== -1) {
      const hashParams = new URLSearchParams(hash.substring(hashQuestionIndex + 1));
      for (const [key, value] of hashParams.entries()) {
        params.set(key, value);
      }
    }
    return params;
  }, []);

  const paymentStatus = useMemo(() => queryParams.get('payment'), [queryParams]);
  const errorCode = useMemo(() => queryParams.get('code'), [queryParams]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await getMyOrders();
      // Sort orders by id descending (latest first)
      const sorted = [...data].sort((a, b) => b.id - a.id);
      setOrders(sorted);
    } catch (err: any) {
      console.warn('Failed to load orders:', err);
      setError(err.message || 'Không thể tải danh sách đơn hàng.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Find latest order for banner details (e.g. email)
  const latestOrder = useMemo(() => {
    if (orders.length === 0) return null;
    return orders[0];
  }, [orders]);

  const handleRepay = async (orderId: number) => {
    try {
      setActionLoading(orderId);
      const data = await repayOrder(orderId);
      if (data && data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        throw new Error('Không nhận được link thanh toán mới.');
      }
    } catch (err: any) {
      showToast(err.message || 'Lấy link thanh toán thất bại. Vui lòng thử lại.', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancelOrder = async (orderId: number) => {
    try {
      setActionLoading(orderId);
      await cancelOrder(orderId);
      showToast('Hủy đơn hàng thành công.');
      setCancelConfirmId(null);
      loadOrders();
    } catch (err: any) {
      showToast(err.message || 'Hủy đơn hàng thất bại.', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDownloadInvoice = async (orderId: number) => {
    try {
      setActionLoading(orderId);
      await downloadInvoice(orderId);
      showToast('Bắt đầu tải hóa đơn...');
    } catch (err: any) {
      showToast(err.message || 'Tải hóa đơn thất bại.', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const formatVND = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const getStatusBadge = (status: string) => {
    const s = status.toUpperCase();
    if (s === 'PAID') {
      return (
        <span className="bg-emerald-500/20 text-emerald-400 text-xs px-2.5 py-1 rounded-full font-bold inline-flex items-center gap-1.5 border border-emerald-500/10">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          ĐÃ THANH TOÁN
        </span>
      );
    }
    if (s === 'PENDING_PAYMENT') {
      return (
        <span className="bg-amber-500/20 text-amber-400 text-xs px-2.5 py-1 rounded-full font-bold inline-flex items-center gap-1.5 border border-amber-500/10">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
          CHỜ THANH TOÁN
        </span>
      );
    }
    if (s === 'CANCELLED') {
      return (
        <span className="bg-slate-800 text-slate-400 text-xs px-2.5 py-1 rounded-full font-bold inline-flex items-center gap-1.5 border border-slate-700/50">
          ĐÃ HỦY
        </span>
      );
    }
    return (
      <span className="bg-rose-500/20 text-rose-400 text-xs px-2.5 py-1 rounded-full font-bold inline-flex items-center gap-1.5 border border-rose-500/10">
        THẤT BẠI
      </span>
    );
  };

  return (
    <CustomerLayout pageTitle="Đơn Hàng Của Tôi">
      {/* Toast popup */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 animate-bounce">
          <div className={`flex items-center gap-3 px-5 py-4 rounded-xl border shadow-xl ${
            toast.type === 'error'
              ? 'bg-rose-950/90 border-rose-500/30 text-rose-200'
              : 'bg-emerald-950/90 border-emerald-500/30 text-emerald-200'
          }`}>
            <AlertCircle size={18} />
            <span className="text-sm font-semibold">{toast.message}</span>
          </div>
        </div>
      )}

      {/* VNPay redirect banners */}
      {paymentStatus === 'success' && (
        <div className="mb-8 p-5 bg-emerald-950/40 border border-emerald-500/25 rounded-3xl flex items-start gap-4">
          <CheckCircle size={24} className="text-emerald-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold text-white text-lg">Thanh toán thành công!</h4>
            <p className="text-slate-300 text-sm leading-relaxed">
              Đội ngũ MANTO đã kích hoạt tài khoản doanh nghiệp của bạn. Vui lòng kiểm tra hộp thư đến của bạn để nhận thông tin đăng nhập tài khoản Admin quản trị.
            </p>
          </div>
        </div>
      )}

      {paymentStatus === 'fail' && (
        <div className="mb-8 p-5 bg-rose-950/40 border border-rose-500/25 rounded-3xl flex items-start gap-4">
          <AlertCircle size={24} className="text-rose-400 shrink-0 mt-0.5" />
          <div className="space-y-2 flex-1">
            <h4 className="font-bold text-white text-lg">Thanh toán thất bại!</h4>
            <p className="text-slate-300 text-sm leading-relaxed">
              Giao dịch qua VNPay không thành công {errorCode ? `(Mã lỗi: ${errorCode})` : ''}. Bạn có thể thử thanh toán lại hoặc hủy đơn cũ để tạo mới.
            </p>
            {latestOrder && (latestOrder.status === 'PENDING_PAYMENT' || latestOrder.status === 'FAILED') && (
              <div className="pt-2 flex gap-3">
                <button
                  onClick={() => handleRepay(latestOrder.id)}
                  disabled={actionLoading !== null}
                  className="bg-rose-500 hover:bg-rose-600 text-white text-xs px-4 py-2 rounded-xl font-bold transition flex items-center gap-1.5"
                >
                  {actionLoading === latestOrder.id ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <CreditCard size={12} />
                  )}
                  Thanh toán lại ngay
                </button>
                <button
                  onClick={() => setCancelConfirmId(latestOrder.id)}
                  disabled={actionLoading !== null}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs px-4 py-2 rounded-xl font-bold transition flex items-center gap-1.5"
                >
                  <Trash2 size={12} />
                  Hủy đơn hàng
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {cancelConfirmId && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-2">Hủy Đơn Hàng?</h3>
            <p className="text-sm text-slate-400 mb-6">
              Bạn có chắc chắn muốn hủy đơn hàng #{cancelConfirmId} không? Hành động này không thể hoàn tác.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setCancelConfirmId(null)}
                className="px-4 py-2 bg-slate-850 hover:bg-slate-800 text-slate-300 text-sm font-semibold rounded-xl transition"
              >
                Hủy bỏ
              </button>
              <button
                onClick={() => handleCancelOrder(cancelConfirmId)}
                disabled={actionLoading !== null}
                className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white text-sm font-semibold rounded-xl transition flex items-center gap-1.5"
              >
                {actionLoading === cancelConfirmId && <Loader2 size={14} className="animate-spin" />}
                Xác nhận hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <Loader2 size={40} className="text-emerald-400 animate-spin" />
          <p className="text-slate-400">Đang tải danh sách đơn hàng...</p>
        </div>
      ) : error ? (
        <div className="max-w-md mx-auto text-center py-16 bg-slate-950/50 rounded-2xl border border-slate-800 p-8">
          <AlertCircle size={40} className="text-rose-400 mx-auto mb-4" />
          <p className="text-rose-200 font-semibold mb-4">{error}</p>
          <button
            onClick={loadOrders}
            className="px-5 py-2.5 bg-slate-850 hover:bg-slate-800 text-white rounded-xl font-medium transition"
          >
            Thử lại
          </button>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20 bg-slate-950/50 border border-slate-800 rounded-3xl p-8">
          <HelpCircle size={40} className="text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 font-semibold mb-2">Bạn chưa có đơn hàng nào.</p>
          <p className="text-sm text-slate-500 mb-6">Hãy tham khảo bảng giá dịch vụ để bắt đầu nâng cấp doanh nghiệp của bạn.</p>
          <a
            href="#/pricing"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-400 to-cyan-400 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-sm shadow-md hover:brightness-110 transition-all"
          >
            <CreditCard size={16} /> Xem Bảng Giá Gói Dịch Vụ
          </a>
        </div>
      ) : (
        <div className="bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/50 text-slate-400 text-xs font-bold uppercase tracking-wider">
                  <th className="py-4 px-6">ID</th>
                  <th className="py-4 px-6">Doanh nghiệp</th>
                  <th className="py-4 px-6">Gói dịch vụ</th>
                  <th className="py-4 px-6">Chu kỳ</th>
                  <th className="py-4 px-6">Tổng tiền</th>
                  <th className="py-4 px-6">Trạng thái</th>
                  <th className="py-4 px-6 text-center">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-sm">
                {orders.map((order) => {
                  const isPending = order.status === 'PENDING_PAYMENT';
                  const isFailed = order.status === 'FAILED';
                  const isPaid = order.status === 'PAID';

                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-slate-900/40 transition duration-150 cursor-pointer"
                      onClick={() => {
                        window.location.hash = `#/orders/${order.id}`;
                      }}
                    >
                      <td className="py-4 px-6 font-semibold text-white">#{order.id}</td>
                      <td className="py-4 px-6">
                        <div className="font-semibold text-slate-200">{order.companyName}</div>
                        <div className="text-xs text-slate-500 mt-0.5">Ngày tạo: {new Date(order.createdAt).toLocaleDateString('vi-VN')}</div>
                      </td>
                      <td className="py-4 px-6 text-slate-300">{order.planName}</td>
                      <td className="py-4 px-6 text-slate-400">
                        {order.billingCycle === 'MONTHLY' ? 'Tháng' : 'Năm'}
                      </td>
                      <td className="py-4 px-6 font-bold text-white">{formatVND(order.amount)}</td>
                      <td className="py-4 px-6">{getStatusBadge(order.status)}</td>
                      <td
                        className="py-4 px-6 text-center"
                        onClick={(e) => e.stopPropagation()} // Prevent row navigation click
                      >
                        <div className="flex items-center justify-center gap-2">
                          {(isPending || isFailed) && (
                            <>
                              <button
                                onClick={() => handleRepay(order.id)}
                                disabled={actionLoading !== null}
                                title="Thanh toán lại"
                                className="p-2 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-slate-950 rounded-lg transition"
                              >
                                {actionLoading === order.id ? (
                                  <Loader2 size={15} className="animate-spin" />
                                ) : (
                                  <CreditCard size={15} />
                                )}
                              </button>
                              <button
                                onClick={() => setCancelConfirmId(order.id)}
                                disabled={actionLoading !== null}
                                title="Hủy đơn hàng"
                                className="p-2 bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white rounded-lg transition"
                              >
                                <Trash2 size={15} />
                              </button>
                            </>
                          )}
                          {isPaid && (
                            <button
                              onClick={() => handleDownloadInvoice(order.id)}
                              disabled={actionLoading !== null}
                              title="Tải hóa đơn"
                              className="p-2 bg-blue-500/10 hover:bg-blue-50 text-blue-400 hover:text-slate-950 rounded-lg transition flex items-center gap-1"
                            >
                              {actionLoading === order.id ? (
                                <Loader2 size={15} className="animate-spin" />
                              ) : (
                                <Download size={15} />
                              )}
                              <span className="text-xs font-medium">Hóa đơn</span>
                            </button>
                          )}
                          <a
                            href={`#/orders/${order.id}`}
                            title="Xem chi tiết"
                            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg transition"
                          >
                            <ExternalLink size={15} />
                          </a>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </CustomerLayout>
  );
}
