import { useEffect, useState, useMemo } from 'react';
import { getOrderById, cancelOrder, repayOrder, downloadInvoice } from '../api';
import type { OrderDetailDto } from '../types';
import CustomerLayout from '../components/CustomerLayout';
import {
  Loader2,
  AlertCircle,
  Building,
  Mail,
  Phone,
  User,
  CreditCard,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  Download,
  Trash2,
  Shield,
  HelpCircle,
} from 'lucide-react';

export default function OrderDetailPage() {
  const [order, setOrder] = useState<OrderDetailDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Extract orderId from hash url: #/orders/:id
  const orderId = useMemo(() => {
    const hash = window.location.hash;
    const match = hash.match(/#\/orders\/(\d+)/);
    return match ? parseInt(match[1], 10) : null;
  }, []);

  const loadOrderDetail = async () => {
    if (!orderId) {
      setError('Đơn hàng không hợp lệ.');
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const data = await getOrderById(orderId);
      setOrder(data);
    } catch (err: any) {
      console.warn('Failed to load order details:', err);
      setError(err.message || 'Không thể tải thông tin chi tiết đơn hàng.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrderDetail();
  }, [orderId]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleRepay = async () => {
    if (!orderId) return;
    try {
      setActionLoading(true);
      const data = await repayOrder(orderId);
      if (data && data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        throw new Error('Không nhận được link thanh toán từ hệ thống.');
      }
    } catch (err: any) {
      showToast(err.message || 'Lấy link thanh toán thất bại.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!orderId) return;
    try {
      setActionLoading(true);
      await cancelOrder(orderId);
      showToast('Đã hủy đơn hàng thành công.');
      setShowCancelConfirm(false);
      loadOrderDetail();
    } catch (err: any) {
      showToast(err.message || 'Hủy đơn hàng thất bại.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDownloadInvoice = async () => {
    if (!orderId) return;
    try {
      setActionLoading(true);
      await downloadInvoice(orderId);
      showToast('Đang tải hóa đơn...');
    } catch (err: any) {
      showToast(err.message || 'Tải hóa đơn thất bại.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const formatVND = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const getStatusBadge = (status: string) => {
    const s = status.toUpperCase();
    if (s === 'PAID') {
      return (
        <span className="bg-emerald-500/20 text-emerald-400 text-xs px-3 py-1 rounded-full font-bold border border-emerald-500/10">
          ĐÃ THANH TOÁN
        </span>
      );
    }
    if (s === 'PENDING_PAYMENT') {
      return (
        <span className="bg-amber-500/20 text-amber-400 text-xs px-3 py-1 rounded-full font-bold border border-amber-500/10 animate-pulse">
          CHỜ THANH TOÁN
        </span>
      );
    }
    if (s === 'CANCELLED') {
      return (
        <span className="bg-slate-800 text-slate-400 text-xs px-3 py-1 rounded-full font-bold border border-slate-700/50">
          ĐÃ HỦY
        </span>
      );
    }
    return (
      <span className="bg-rose-500/20 text-rose-400 text-xs px-3 py-1 rounded-full font-bold border border-rose-500/10">
        THẤT BẠI
      </span>
    );
  };

  return (
    <CustomerLayout>
      {/* Toast Alert */}
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

      {/* Cancel Confirm Dialog */}
      {showCancelConfirm && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-2">Hủy Đơn Hàng?</h3>
            <p className="text-sm text-slate-400 mb-6">
              Bạn có chắc chắn muốn hủy đơn hàng #{orderId} không? Hành động này không thể hoàn tác.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="px-4 py-2 bg-slate-850 hover:bg-slate-800 text-slate-300 text-sm font-semibold rounded-xl transition"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleCancel}
                disabled={actionLoading}
                className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white text-sm font-semibold rounded-xl transition flex items-center gap-1.5"
              >
                {actionLoading && <Loader2 size={14} className="animate-spin" />}
                Xác nhận hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Return */}
      <div className="mb-6">
        <a
          href="#/orders"
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition"
        >
          <ChevronLeft size={16} /> Quay lại danh sách đơn hàng
        </a>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <Loader2 size={40} className="text-emerald-400 animate-spin" />
          <p className="text-slate-400">Đang tải thông tin đơn hàng...</p>
        </div>
      ) : error || !order ? (
        <div className="max-w-md mx-auto text-center py-16 bg-slate-950/50 rounded-2xl border border-slate-800 p-8">
          <AlertCircle size={40} className="text-rose-400 mx-auto mb-4" />
          <p className="text-rose-200 font-semibold mb-4">{error || 'Không tìm thấy đơn hàng.'}</p>
          <a
            href="#/orders"
            className="px-5 py-2.5 bg-slate-850 hover:bg-slate-800 text-white rounded-xl font-medium transition inline-block"
          >
            Quay lại danh sách
          </a>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Main header block */}
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xl">
            <div>
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <h2 className="text-2xl font-bold text-white">Đơn hàng #{order.id}</h2>
                {getStatusBadge(order.status)}
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-1">
                <Calendar size={13} />
                Được tạo ngày: {new Date(order.createdAt).toLocaleString('vi-VN')}
              </p>
            </div>

            {/* Top actions */}
            <div className="flex gap-3">
              {(order.status === 'PENDING_PAYMENT' || order.status === 'FAILED') && (
                <>
                  <button
                    onClick={handleRepay}
                    disabled={actionLoading}
                    className="bg-gradient-to-r from-emerald-400 to-cyan-400 text-slate-950 text-sm font-bold px-5 py-2.5 rounded-xl shadow-md hover:brightness-110 active:scale-[0.99] transition-all flex items-center gap-1.5"
                  >
                    {actionLoading ? <Loader2 size={15} className="animate-spin" /> : <CreditCard size={15} />}
                    Thanh toán ngay
                  </button>
                  <button
                    onClick={() => setShowCancelConfirm(true)}
                    disabled={actionLoading}
                    className="bg-slate-850 hover:bg-slate-800 text-rose-400 text-sm font-bold px-5 py-2.5 rounded-xl transition flex items-center gap-1.5"
                  >
                    <Trash2 size={15} />
                    Hủy đơn hàng
                  </button>
                </>
              )}

              {order.status === 'PAID' && (
                <button
                  onClick={handleDownloadInvoice}
                  disabled={actionLoading}
                  className="bg-slate-850 hover:bg-slate-800 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition flex items-center gap-1.5"
                >
                  {actionLoading ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
                  Tải hóa đơn (HTML)
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Left panels: profiles */}
            <div className="lg:col-span-2 space-y-6">
              {/* Profile card */}
              <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-xl">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2 pb-2 border-b border-slate-800 mb-4">
                    <Building size={18} className="text-emerald-400" />
                    Thông Tin Doanh Nghiệp & Tổ Chức
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                    <div className="space-y-1">
                      <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Tên doanh nghiệp</span>
                      <p className="text-white font-medium text-base">{order.companyName}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Email liên hệ</span>
                      <p className="text-white font-medium text-base flex items-center gap-1.5">
                        <Mail size={14} className="text-slate-400" /> {order.companyEmail}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Số điện thoại</span>
                      <p className="text-white font-medium text-base flex items-center gap-1.5">
                        <Phone size={14} className="text-slate-400" /> {order.companyPhone || 'Chưa cung cấp'}
                      </p>
                    </div>
                    {order.organizationId && (
                      <div className="space-y-1">
                        <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Mã tổ chức (Workspace ID)</span>
                        <p className="text-emerald-400 font-bold text-base flex items-center gap-1.5">
                          <CheckCircle2 size={14} /> Org #{order.organizationId}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-2">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2 pb-2 border-b border-slate-800 mb-4">
                    <User size={18} className="text-emerald-400" />
                    Tài Khoản Quản Trị Viên (Admin)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                    <div className="space-y-1">
                      <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Họ và tên Admin</span>
                      <p className="text-white font-medium text-base">{order.adminLastName} {order.adminFirstName}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Email đăng nhập quản trị</span>
                      <p className="text-white font-medium text-base flex items-center gap-1.5">
                        <Mail size={14} className="text-slate-400" /> {order.adminEmail}
                      </p>
                    </div>
                  </div>
                </div>

                {order.status === 'PAID' && (
                  <div className="bg-slate-900/50 p-4 border border-slate-850 rounded-2xl flex items-start gap-3">
                    <Shield size={20} className="text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-white text-sm mb-0.5">Tài khoản quản trị đã được phân quyền</h4>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Tài khoản Admin đã được tạo cho email <strong>{order.adminEmail}</strong>. Vui lòng kiểm tra email của bạn để lấy mật khẩu tạm thời đăng nhập.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right panels: Plan Limits & Total Cost */}
            <div className="space-y-6">
              {/* Cost card */}
              <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
                <h3 className="text-lg font-bold text-white pb-2 border-b border-slate-800">
                  Chi tiết thanh toán
                </h3>
                <div className="space-y-2.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Gói đăng ký:</span>
                    <span className="font-bold text-white">{order.planName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Chu kỳ thanh toán:</span>
                    <span className="text-slate-200">
                      {order.billingCycle === 'MONTHLY' ? 'Tháng' : 'Năm'}
                    </span>
                  </div>
                  {order.paidAt && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Ngày thanh toán:</span>
                      <span className="text-slate-300">
                        {new Date(order.paidAt).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                  )}
                  {order.vnpayTxnRef && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Mã giao dịch VNPay:</span>
                      <span className="text-slate-400 font-mono text-xs">{order.vnpayTxnRef}</span>
                    </div>
                  )}
                  <div className="border-t border-slate-800 pt-3 flex justify-between items-baseline">
                    <span className="font-bold text-white">Số tiền:</span>
                    <span className="text-xl font-extrabold text-emerald-400">
                      {formatVND(order.amount)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status details help */}
              {order.status === 'PENDING_PAYMENT' && (
                <div className="bg-amber-950/20 border border-amber-500/20 rounded-2xl p-4 text-xs text-amber-200/90 leading-relaxed flex items-start gap-2.5">
                  <HelpCircle size={16} className="shrink-0 text-amber-400 mt-0.5" />
                  <p>
                    Đơn hàng đang chờ thanh toán qua cổng VNPay. Giao dịch sẽ tự động hết hạn sau 15 phút. Bạn có thể nhấn <strong>"Thanh toán ngay"</strong> ở góc trên để tiếp tục.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </CustomerLayout>
  );
}
