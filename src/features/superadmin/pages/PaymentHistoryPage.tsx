import { useEffect, useState } from 'react';
import { getPaymentHistory, getOrganizations } from '../api';
import type { PaymentHistoryDto, OrganizationDto } from '../types';
import { Search, Filter, HelpCircle, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';

export default function PaymentHistoryPage() {
  const [payments, setPayments] = useState<PaymentHistoryDto[]>([]);
  const [orgs, setOrgs] = useState<OrganizationDto[]>([]);
  const [selectedOrgId, setSelectedOrgId] = useState<string>('');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [paymentsData, orgsData] = await Promise.all([
        getPaymentHistory(selectedOrgId ? Number(selectedOrgId) : undefined),
        getOrganizations(1, 1000)
      ]);
      setPayments(paymentsData);
      setOrgs(orgsData.items || []);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Không thể tải lịch sử giao dịch.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedOrgId]);

  const formatCurrency = (val: number) => {
    return `${val.toLocaleString('vi-VN')}đ`;
  };

  const isPendingTimeout = (createdAtStr: string, status: string) => {
    if (status !== 'PENDING') return false;
    const createdAt = new Date(createdAtStr).getTime();
    const now = Date.now();
    const hoursDiff = (now - createdAt) / (1000 * 60 * 60);
    return hoursDiff > 24; // Treo hơn 24 giờ
  };

  const renderStatusBadge = (pay: PaymentHistoryDto) => {
    const isTimeout = isPendingTimeout(pay.createdAt, pay.status);
    
    if (isTimeout) {
      return (
        <div className="flex flex-col items-start gap-1">
          <span className="inline-flex items-center gap-1 rounded bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 border border-amber-200">
            <Clock size={11} />
            PENDING
          </span>
          <span className="rounded bg-orange-100 px-1.5 py-0.5 text-[9px] font-bold text-orange-700 animate-pulse">
            Treo &gt;24h?
          </span>
        </div>
      );
    }

    switch (pay.status) {
      case 'SUCCESS':
        return (
          <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-250">
            <CheckCircle size={11} />
            SUCCESS
          </span>
        );
      case 'FAILED':
        return (
          <div className="inline-flex items-center gap-1 relative group cursor-help rounded bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-700 border border-rose-250">
            <XCircle size={11} />
            <span>FAILED</span>
            {pay.failureReason && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-48 rounded-xl bg-slate-900 p-2 text-[10px] leading-normal text-white shadow-lg z-50 text-center font-normal">
                {pay.failureReason}
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
              </div>
            )}
          </div>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500 border border-slate-200">
            <XCircle size={11} />
            CANCELLED
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded bg-slate-50 px-2 py-0.5 text-[10px] font-bold text-slate-500 border border-slate-200">
            <Clock size={11} />
            PENDING
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Filter Control Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        
        {/* Organization Filter */}
        <div className="w-full sm:w-64">
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Lọc Theo Doanh Nghiệp</label>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
            <select
              value={selectedOrgId}
              onChange={(e) => setSelectedOrgId(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white pl-9 pr-8 py-2.5 text-sm appearance-none focus:border-blue-500 focus:outline-none"
            >
              <option value="">Tất cả doanh nghiệp</option>
              {orgs.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl bg-rose-50 border border-rose-200 p-4 text-sm text-rose-800">
          {error}
        </div>
      )}

      {/* Payments Logs table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-[900px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/70 text-xs font-bold uppercase tracking-wider text-slate-500">
              <th className="px-5 py-4">Mã GD</th>
              <th className="px-5 py-4">Tổ Chức Doanh Nghiệp</th>
              <th className="px-5 py-4">Gói / Chu Kỳ</th>
              <th className="px-5 py-4">Số Tiền</th>
              <th className="px-5 py-4">Cổng GD / Txn ID</th>
              <th className="px-5 py-4">Trạng Thái</th>
              <th className="px-5 py-4">Thời Gian Tạo</th>
              <th className="px-5 py-4">Ngày Thanh Toán</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
            {loading ? (
              <tr>
                <td colSpan={8} className="px-5 py-12 text-center text-slate-450">
                  <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
                  <span className="mt-2 block text-[11px]">Đang tải lịch sử giao dịch...</span>
                </td>
              </tr>
            ) : payments.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-5 py-12 text-center text-slate-400">
                  Chưa phát sinh giao dịch thanh toán nào.
                </td>
              </tr>
            ) : (
              payments.map((pay) => {
                return (
                  <tr key={pay.id} className="hover:bg-slate-50/40">
                    <td className="px-5 py-4 font-mono font-bold text-slate-500">#{pay.id}</td>
                    <td className="px-5 py-4 font-bold text-slate-800">{pay.organizationName}</td>
                    <td className="px-5 py-4">
                      <span className="font-semibold">{pay.planName}</span>
                      <span className="block text-[9px] font-bold text-slate-400 uppercase mt-0.5">{pay.billingCycle}</span>
                    </td>
                    <td className="px-5 py-4 font-bold text-slate-900">{formatCurrency(pay.amount)}</td>
                    <td className="px-5 py-4">
                      <span className="rounded bg-blue-50/50 px-1.5 py-0.5 text-[9px] font-bold text-blue-700 uppercase tracking-wide">
                        {pay.gateway}
                      </span>
                      {pay.gatewayTxnId && (
                        <span className="block text-[10px] text-slate-400 font-mono mt-1" title={pay.gatewayTxnId}>
                          Txn: {pay.gatewayTxnId}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4">{renderStatusBadge(pay)}</td>
                    <td className="px-5 py-4 text-slate-450">
                      {new Date(pay.createdAt).toLocaleString('vi-VN')}
                    </td>
                    <td className="px-5 py-4 text-slate-500">
                      {pay.paidAt ? new Date(pay.paidAt).toLocaleString('vi-VN') : <span className="text-slate-350">-</span>}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
