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
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderSummaryDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [cancelConfirmId, setCancelConfirmId] = useState<number | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Parse query parameters
  const queryParams = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    const hash = window.location.hash;
    const hashQuestionIndex = hash.indexOf('?');
    if (hashQuestionIndex !== -1) {
      const hashParams = new URLSearchParams(hash.substring(hashQuestionIndex + 1));
      hashParams.forEach((value, key) => {
        params.set(key, value);
      });
    }
    return params;
  }, []);

  const paymentStatus = useMemo(() => queryParams.get('payment'), [queryParams]);
  const errorCode = useMemo(() => queryParams.get('code'), [queryParams]);

  const loadOrders = async (pageNum: number = 1) => {
    try {
      setLoading(true);
      const data = await getMyOrders(pageNum, pageSize);
      // Sort orders by id descending (latest first)
      const sorted = [...data.items].sort((a, b) => b.id - a.id);
      setOrders(sorted);
      setTotalPages(data.totalPages || 1);
      setTotalCount(data.totalCount || 0);
      setPage(data.page || 1);
    } catch (err: any) {
      console.warn('Failed to load orders:', err);
      setError(err.message || 'Unable to load orders list.');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    loadOrders(newPage);
  };

  useEffect(() => {
    loadOrders(1);
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
        throw new Error('Could not retrieve new payment link.');
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to get payment link. Please try again.', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancelOrder = async (orderId: number) => {
    try {
      setActionLoading(orderId);
      await cancelOrder(orderId);
      showToast('Order cancelled successfully.');
      setCancelConfirmId(null);
      loadOrders(page);
    } catch (err: any) {
      showToast(err.message || 'Failed to cancel order.', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDownloadInvoice = async (orderId: number) => {
    try {
      setActionLoading(orderId);
      await downloadInvoice(orderId);
      showToast('Downloading invoice...');
    } catch (err: any) {
      showToast(err.message || 'Failed to download invoice.', 'error');
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
        <span className="bg-emerald-50 text-emerald-700 text-xs px-2.5 py-1 rounded-full font-bold inline-flex items-center gap-1.5 border border-emerald-200">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          PAID
        </span>
      );
    }
    if (s === 'PENDING_PAYMENT') {
      return (
        <span className="bg-amber-50 text-amber-700 text-xs px-2.5 py-1 rounded-full font-bold inline-flex items-center gap-1.5 border border-amber-200">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
          PENDING
        </span>
      );
    }
    if (s === 'CANCELLED') {
      return (
        <span className="bg-slate-100 text-slate-600 text-xs px-2.5 py-1 rounded-full font-bold inline-flex items-center gap-1.5 border border-slate-200">
          CANCELLED
        </span>
      );
    }
    if (s === 'REFUNDED') {
      return (
        <span className="bg-purple-50 text-purple-700 text-xs px-2.5 py-1 rounded-full font-bold inline-flex items-center gap-1.5 border border-purple-200">
          REFUNDED
        </span>
      );
    }
    return (
      <span className="bg-rose-50 text-rose-700 text-xs px-2.5 py-1 rounded-full font-bold inline-flex items-center gap-1.5 border border-rose-200">
        FAILED
      </span>
    );
  };

  return (
    <CustomerLayout pageTitle="My Orders">
      {/* Toast popup */}
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

      {/* VNPay redirect banners */}
      {paymentStatus === 'success' && (
        <div className="mb-8 p-5 bg-emerald-50 border border-emerald-200 rounded-3xl flex items-start gap-4 text-emerald-800">
          <CheckCircle size={24} className="text-emerald-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold text-slate-900 text-lg">Payment successful!</h4>
            <p className="text-slate-600 text-sm leading-relaxed">
              The MANTO team has activated your enterprise account. Please check your inbox for credentials to log in to your Admin Dashboard.
            </p>
          </div>
        </div>
      )}

      {paymentStatus === 'fail' && (
        <div className="mb-8 p-5 bg-rose-50 border border-rose-200 rounded-3xl flex items-start gap-4 text-rose-800">
          <AlertCircle size={24} className="text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-2 flex-1">
            <h4 className="font-bold text-slate-900 text-lg">Payment failed!</h4>
            <p className="text-slate-600 text-sm leading-relaxed">
              The VNPay transaction was unsuccessful {errorCode ? `(Error code: ${errorCode})` : ''}. You can try again or cancel the pending order to create a new one.
            </p>
            {latestOrder && (latestOrder.status === 'PENDING_PAYMENT' || latestOrder.status === 'FAILED') && (
              <div className="pt-2 flex gap-3">
                <button
                  onClick={() => handleRepay(latestOrder.id)}
                  disabled={actionLoading !== null}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-4 py-2 rounded-xl font-bold transition flex items-center gap-1.5"
                >
                  {actionLoading === latestOrder.id ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <CreditCard size={12} />
                  )}
                  Pay Now
                </button>
                <button
                  onClick={() => setCancelConfirmId(latestOrder.id)}
                  disabled={actionLoading !== null}
                  className="bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs px-4 py-2 rounded-xl font-bold transition flex items-center gap-1.5"
                >
                  <Trash2 size={12} />
                  Cancel Order
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {cancelConfirmId && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Cancel Order?</h3>
            <p className="text-sm text-slate-500 mb-6">
              Are you sure you want to cancel order #{cancelConfirmId}? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setCancelConfirmId(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl transition"
              >
                No, Keep it
              </button>
              <button
                onClick={() => handleCancelOrder(cancelConfirmId)}
                disabled={actionLoading !== null}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold rounded-xl transition flex items-center gap-1.5"
              >
                {actionLoading === cancelConfirmId && <Loader2 size={14} className="animate-spin" />}
                Confirm Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4 bg-white border border-slate-200 rounded-3xl">
          <Loader2 size={40} className="text-blue-600 animate-spin" />
          <p className="text-slate-500 font-medium">Loading your orders...</p>
        </div>
      ) : error ? (
        <div className="max-w-md mx-auto text-center py-16 bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
          <AlertCircle size={40} className="text-rose-500 mx-auto mb-4" />
          <p className="text-slate-800 font-semibold mb-4">{error}</p>
          <button
            onClick={() => loadOrders(1)}
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-medium transition"
          >
            Try Again
          </button>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20 bg-white border border-slate-200 rounded-3xl p-8">
          <HelpCircle size={40} className="text-slate-400 mx-auto mb-4" />
          <p className="text-slate-700 font-semibold mb-2">You haven't placed any orders yet.</p>
          <p className="text-sm text-slate-500 mb-6">Browse our pricing plans to get started upgrading your business.</p>
          <a
            href="#/pricing"
            className="inline-flex items-center gap-2 bg-blue-600 text-white font-bold px-5 py-2.5 rounded-xl text-sm shadow-md hover:bg-blue-700 transition-all"
          >
            <CreditCard size={16} /> View Pricing Plans
          </a>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                  <th className="py-4 px-6">ID</th>
                  <th className="py-4 px-6">Company</th>
                  <th className="py-4 px-6">Service Plan</th>
                  <th className="py-4 px-6">Billing Cycle</th>
                  <th className="py-4 px-6">Total Amount</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {orders.map((order) => {
                  const isPending = order.status === 'PENDING_PAYMENT';
                  const isFailed = order.status === 'FAILED';
                  const isPaid = order.status === 'PAID';

                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-slate-50/50 transition duration-150 cursor-pointer"
                      onClick={() => {
                        window.location.hash = `#/orders/${order.id}`;
                      }}
                    >
                      <td className="py-4 px-6 font-semibold text-slate-900">#{order.id}</td>
                      <td className="py-4 px-6">
                        <div className="font-semibold text-slate-900">{order.companyName}</div>
                        <div className="text-xs text-slate-500 mt-0.5">Created: {new Date(order.createdAt).toLocaleDateString('en-US')}</div>
                      </td>
                      <td className="py-4 px-6 text-slate-700">{order.planName}</td>
                      <td className="py-4 px-6 text-slate-600 font-medium">
                        {order.billingCycle === 'MONTHLY' ? 'Monthly' : 'Yearly'}
                      </td>
                      <td className="py-4 px-6 font-bold text-slate-900">{formatVND(order.amount)}</td>
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
                                title="Pay Now"
                                className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition"
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
                                title="Cancel Order"
                                className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition"
                              >
                                <Trash2 size={15} />
                              </button>
                            </>
                          )}
                          {isPaid && (
                            <button
                              onClick={() => handleDownloadInvoice(order.id)}
                              disabled={actionLoading !== null}
                              title="Download Invoice"
                              className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition flex items-center gap-1.5"
                            >
                              {actionLoading === order.id ? (
                                <Loader2 size={15} className="animate-spin" />
                              ) : (
                                <Download size={15} />
                              )}
                              <span className="text-xs font-semibold">Invoice</span>
                            </button>
                          )}
                          <a
                            href={`#/orders/${order.id}`}
                            title="View Details"
                            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition"
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

      {!loading && orders.length > 0 && (
        <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row mt-4">
          <p className="text-xs text-slate-500 font-medium">
            Showing <span className="font-bold text-slate-800">{((page - 1) * pageSize) + 1}</span> to{' '}
            <span className="font-bold text-slate-800">{Math.min(page * pageSize, totalCount)}</span> of{' '}
            <span className="font-bold text-slate-800">{totalCount}</span> orders
          </p>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page <= 1}
              className="rounded-xl border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="px-2 text-xs font-semibold text-slate-600">Page {page} / {totalPages}</span>
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
    </CustomerLayout>
  );
}
