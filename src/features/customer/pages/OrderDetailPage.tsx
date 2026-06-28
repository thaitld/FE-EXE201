import { useEffect, useState, useMemo } from 'react';
import { getOrderById, cancelOrder, repayOrder, downloadInvoice, getMyRefundRequests } from '../api';
import type { OrderDetailDto, RefundRequestDto } from '../types';
import CustomerLayout from '../components/CustomerLayout';
import RefundRequestModal from '../components/RefundRequestModal';
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
  Undo2,
} from 'lucide-react';

export default function OrderDetailPage() {
  const [order, setOrder] = useState<OrderDetailDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundRequest, setRefundRequest] = useState<RefundRequestDto | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const daysSincePaid = useMemo(() => {
    if (!order || !order.paidAt) return null;
    const diffTime = Date.now() - new Date(order.paidAt).getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  }, [order]);

  // Extract orderId from hash url: #/orders/:id
  const orderId = useMemo(() => {
    const hash = window.location.hash;
    const match = hash.match(/#\/orders\/(\d+)/);
    return match ? parseInt(match[1], 10) : null;
  }, []);

  const loadOrderDetail = async () => {
    if (!orderId) {
      setError('Invalid order ID.');
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const data = await getOrderById(orderId);
      setOrder(data);
      const refunds = await getMyRefundRequests();
      setRefundRequest(refunds.find((r) => r.orderId === orderId) ?? null);
    } catch (err: any) {
      console.warn('Failed to load order details:', err);
      setError(err.message || 'Unable to load order details.');
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
        throw new Error('Could not retrieve new payment link.');
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to get payment link.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!orderId) return;
    try {
      setActionLoading(true);
      await cancelOrder(orderId);
      showToast('Order cancelled successfully.');
      setShowCancelConfirm(false);
      loadOrderDetail();
    } catch (err: any) {
      showToast(err.message || 'Failed to cancel order.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDownloadInvoice = async () => {
    if (!orderId) return;
    try {
      setActionLoading(true);
      await downloadInvoice(orderId);
      showToast('Downloading invoice...');
    } catch (err: any) {
      showToast(err.message || 'Failed to download invoice.', 'error');
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
        <span className="bg-emerald-50 text-emerald-700 text-xs px-3 py-1 rounded-full font-bold border border-emerald-200">
          PAID
        </span>
      );
    }
    if (s === 'PENDING_PAYMENT') {
      return (
        <span className="bg-amber-50 text-amber-700 text-xs px-3 py-1 rounded-full font-bold border border-amber-200 animate-pulse">
          PENDING PAYMENT
        </span>
      );
    }
    if (s === 'CANCELLED') {
      return (
        <span className="bg-slate-100 text-slate-600 text-xs px-3 py-1 rounded-full font-bold border border-slate-200">
          CANCELLED
        </span>
      );
    }
    if (s === 'REFUNDED') {
      return (
        <span className="bg-purple-50 text-purple-700 text-xs px-3 py-1 rounded-full font-bold border border-purple-200">
          REFUNDED
        </span>
      );
    }
    return (
      <span className="bg-rose-50 text-rose-700 text-xs px-3 py-1 rounded-full font-bold border border-rose-200">
        FAILED
      </span>
    );
  };

  return (
    <CustomerLayout>
      {/* Toast Alert */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 animate-bounce">
          <div className={`flex items-center gap-3 px-5 py-4 rounded-xl border shadow-xl bg-white text-slate-800 ${
            toast.type === 'error'
              ? 'border-rose-200'
              : 'border-emerald-200'
          }`}>
            <AlertCircle size={18} className={toast.type === 'error' ? 'text-rose-500' : 'text-emerald-500'} />
            <span className="text-sm font-semibold">{toast.message}</span>
          </div>
        </div>
      )}

      {/* Cancel Confirm Dialog */}
      {showCancelConfirm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Cancel Order?</h3>
            <p className="text-sm text-slate-500 mb-6">
              Are you sure you want to cancel order #{orderId}? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl transition"
              >
                No, Keep it
              </button>
              <button
                onClick={handleCancel}
                disabled={actionLoading}
                className="px-4 py-2 bg-rose-650 hover:bg-rose-700 text-white text-sm font-semibold rounded-xl transition flex items-center gap-1.5"
              >
                {actionLoading && <Loader2 size={14} className="animate-spin" />}
                Confirm Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Return */}
      <div className="mb-6">
        <a
          href="#/orders"
          className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition"
        >
          <ChevronLeft size={16} /> Back to order list
        </a>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4 bg-white border border-slate-200 rounded-3xl">
          <Loader2 size={40} className="text-blue-600 animate-spin" />
          <p className="text-slate-500 font-medium">Loading order details...</p>
        </div>
      ) : error || !order ? (
        <div className="max-w-md mx-auto text-center py-16 bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
          <AlertCircle size={40} className="text-rose-500 mx-auto mb-4" />
          <p className="text-rose-800 font-semibold mb-4">{error || 'Order not found.'}</p>
          <a
            href="#/orders"
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-medium transition inline-block"
          >
            Back to List
          </a>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Main header block */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm">
            <div>
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <h2 className="text-2xl font-bold text-slate-900">Order #{order.id}</h2>
                {getStatusBadge(order.status)}
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-1">
                <Calendar size={13} />
                Created on: {new Date(order.createdAt).toLocaleString('en-US')}
              </p>
            </div>

            {/* Top actions */}
            <div className="flex gap-3">
              {(order.status === 'PENDING_PAYMENT' || order.status === 'FAILED') && (
                <>
                  <button
                    onClick={handleRepay}
                    disabled={actionLoading}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold px-5 py-2.5 rounded-xl shadow-md transition active:scale-[0.99] flex items-center gap-1.5"
                  >
                    {actionLoading ? <Loader2 size={15} className="animate-spin" /> : <CreditCard size={15} />}
                    Pay Now
                  </button>
                  <button
                    onClick={() => setShowCancelConfirm(true)}
                    disabled={actionLoading}
                    className="bg-slate-100 hover:bg-slate-200 text-rose-600 border border-slate-200 text-sm font-bold px-5 py-2.5 rounded-xl transition flex items-center gap-1.5"
                  >
                    <Trash2 size={15} />
                    Cancel Order
                  </button>
                </>
              )}

              {order.status === 'PAID' && (
                <>
                  <button
                    onClick={handleDownloadInvoice}
                    disabled={actionLoading}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-sm font-bold px-5 py-2.5 rounded-xl transition flex items-center gap-1.5"
                  >
                    {actionLoading ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
                    Download Invoice (HTML)
                  </button>
                  {!refundRequest && daysSincePaid !== null && daysSincePaid <= 7 && (
                    <button
                      onClick={() => setShowRefundModal(true)}
                      disabled={actionLoading}
                      className="bg-slate-100 hover:bg-slate-200 text-rose-600 border border-slate-200 text-sm font-bold px-5 py-2.5 rounded-xl transition flex items-center gap-1.5"
                    >
                      <Undo2 size={15} />
                      Request Refund
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          {refundRequest && (
            <div className={`rounded-2xl p-4 text-xs leading-relaxed flex items-start gap-2.5 border ${
              refundRequest.status === 'REJECTED'
                ? 'bg-rose-50 border-rose-200 text-rose-800'
                : refundRequest.status === 'APPROVED'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-amber-50 border-amber-200 text-amber-800'
            }`}>
              <Undo2 size={16} className="shrink-0 mt-0.5" />
              <p>
                {refundRequest.status === 'PENDING' &&
                  'You have a pending refund request for this order. Please wait for review.'}
                {refundRequest.status === 'REJECTED' &&
                  'Your refund request for this order has been rejected. Please contact support for further assistance.'}
                {refundRequest.status === 'APPROVED' &&
                  'Your refund request for this order has been approved.'}
                {refundRequest.reviewNotes && (
                  <>
                    {' '}
                    <strong>Notes:</strong> {refundRequest.reviewNotes}
                  </>
                )}
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Left panels: profiles */}
            <div className="lg:col-span-2 space-y-6">
              {/* Profile card */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100 mb-4">
                    <Building size={18} className="text-blue-600" />
                    Company & Organization Profile
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                    <div className="space-y-1">
                      <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Company Name</span>
                      <p className="text-slate-900 font-semibold text-base">{order.companyName}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Contact Email</span>
                      <p className="text-slate-700 font-medium text-base flex items-center gap-1.5">
                        <Mail size={14} className="text-slate-450" /> {order.companyEmail}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Phone Number</span>
                      <p className="text-slate-700 font-medium text-base flex items-center gap-1.5">
                        <Phone size={14} className="text-slate-450" /> {order.companyPhone || 'Not provided'}
                      </p>
                    </div>
                    {order.organizationId && (
                      <div className="space-y-1">
                        <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Workspace ID</span>
                        <p className="text-blue-600 font-bold text-base flex items-center gap-1.5">
                          <CheckCircle2 size={14} /> Org #{order.organizationId}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-2">
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100 mb-4">
                    <User size={18} className="text-blue-600" />
                    Administrator Account (Admin)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                    <div className="space-y-1">
                      <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Admin Full Name</span>
                      <p className="text-slate-900 font-semibold text-base">{order.adminLastName} {order.adminFirstName}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Login Email</span>
                      <p className="text-slate-700 font-medium text-base flex items-center gap-1.5">
                        <Mail size={14} className="text-slate-450" /> {order.adminEmail}
                      </p>
                    </div>
                  </div>
                </div>

                {order.status === 'PAID' && (
                  <div className="bg-blue-50/50 p-4 border border-blue-200/50 rounded-2xl flex items-start gap-3">
                    <Shield size={20} className="text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm mb-0.5">Admin Account Authorized</h4>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        An administrator account has been provisioned for <strong>{order.adminEmail}</strong>. Please check your inbox for the temporary password to log in.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right panels: Plan Limits & Total Cost */}
            <div className="space-y-6">
              {/* Cost card */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
                <h3 className="text-lg font-bold text-slate-900 pb-2 border-b border-slate-100">
                  Payment Summary
                </h3>
                <div className="space-y-2.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Subscription:</span>
                    <span className="font-bold text-slate-900">{order.planName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Billing Cycle:</span>
                    <span className="text-slate-800 font-semibold">
                      {order.billingCycle === 'MONTHLY' ? 'Monthly' : 'Yearly'}
                    </span>
                  </div>
                  {order.paidAt && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Payment Date:</span>
                      <span className="text-slate-700 font-medium">
                        {new Date(order.paidAt).toLocaleDateString('en-US')}
                      </span>
                    </div>
                  )}
                  {order.vnpayTxnRef && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">VNPay Transaction:</span>
                      <span className="text-slate-600 font-mono text-xs">{order.vnpayTxnRef}</span>
                    </div>
                  )}
                  <div className="border-t border-slate-100 pt-3 flex justify-between items-baseline">
                    <span className="font-bold text-slate-900">Total Price:</span>
                    <span className="text-2xl font-extrabold text-blue-650 text-blue-600">
                      {formatVND(order.amount)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status details help */}
              {order.status === 'PENDING_PAYMENT' && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-800 leading-relaxed flex items-start gap-2.5">
                  <HelpCircle size={16} className="shrink-0 text-amber-600 mt-0.5" />
                  <p>
                    This order is currently pending payment. Transactions automatically expire after 15 minutes. You can click <strong>"Pay Now"</strong> at the top to complete payment.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showRefundModal && order && (
        <RefundRequestModal
          order={order}
          onClose={() => setShowRefundModal(false)}
          onSuccess={() => {
            setShowRefundModal(false);
            showToast('Refund request submitted successfully.');
            loadOrderDetail();
          }}
        />
      )}
    </CustomerLayout>
  );
}
