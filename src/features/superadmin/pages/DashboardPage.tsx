import { useEffect, useState } from 'react';
import { getSuperAdminStats } from '../api';
import type { SuperAdminStatsDto } from '../types';
import {
  Grid,
  Users,
  CreditCard,
  AlertTriangle,
  Clock,
  ArrowRight,
  TrendingUp
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend
} from 'recharts';

const CHART_COLORS = ['#0ea5e9', '#06b6d4', '#10b981', '#f59e0b', '#ec4899'];

export default function DashboardPage() {
  const [stats, setStats] = useState<SuperAdminStatsDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await getSuperAdminStats();
      setStats(data);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Không thể tải dữ liệu thống kê');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const formatCurrency = (val: number) => {
    return `${val.toLocaleString('vi-VN')}đ`;
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl bg-rose-50 border border-rose-200 p-6 text-rose-800">
        <p className="font-semibold">Lỗi tải dữ liệu</p>
        <p className="mt-1 text-sm">{error}</p>
        <button
          onClick={loadStats}
          className="mt-4 rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700 transition"
        >
          Thử Lại
        </button>
      </div>
    );
  }

  const chartData = stats?.planDistribution.map((item) => ({
    name: item.planName,
    value: item.count
  })) || [];

  return (
    <div className="space-y-6">
      {/* 4 KPI Grid Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Total Orgs */}
        <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Tổng Số Tổ Chức</p>
              <h4 className="mt-2 text-3xl font-bold text-slate-800">{stats?.totalOrganizations || 0}</h4>
            </div>
            <div className="rounded-xl bg-cyan-50 p-2.5 text-cyan-600">
              <Users size={22} />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-4 text-xs text-slate-500 border-t border-slate-100 pt-3">
            <span>Hoạt động: <strong className="text-slate-800">{stats?.activeOrganizations || 0}</strong></span>
            <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
            <span>Khóa: <strong className="text-slate-800">{stats?.suspendedOrganizations || 0}</strong></span>
          </div>
        </div>

        {/* Card 2: Revenue */}
        <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Doanh Thu Tích Lũy</p>
              <h4 className="mt-2 text-2xl font-bold text-slate-800 truncate" title={formatCurrency(stats?.totalRevenue || 0)}>
                {formatCurrency(stats?.totalRevenue || 0)}
              </h4>
            </div>
            <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600">
              <TrendingUp size={22} />
            </div>
          </div>
          <div className="mt-4 text-xs text-slate-550 border-t border-slate-100 pt-3 flex items-center gap-1.5">
            <span>Đã thanh toán qua VNPay / Manual</span>
          </div>
        </div>

        {/* Card 3: Expiring Orgs */}
        <div className={`relative overflow-hidden rounded-xl border bg-white p-5 shadow-sm transition ${
          stats?.expiringIn30Days && stats.expiringIn30Days > 0 ? 'border-amber-350 bg-amber-50/15' : 'border-slate-200'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Sắp Hết Hạn (30 Ngày)</p>
              <h4 className="mt-2 text-3xl font-bold text-slate-800">{stats?.expiringIn30Days || 0}</h4>
            </div>
            <div className={`rounded-xl p-2.5 ${
              stats?.expiringIn30Days && stats.expiringIn30Days > 0 ? 'bg-amber-100 text-amber-600' : 'bg-slate-50 text-slate-500'
            }`}>
              <AlertTriangle size={22} />
            </div>
          </div>
          <div className="mt-4 text-xs text-slate-500 border-t border-slate-100 pt-3">
            {stats?.expiringIn30Days && stats.expiringIn30Days > 0 ? (
              <span className="font-semibold text-amber-700">Yêu cầu liên hệ gia hạn ngay!</span>
            ) : (
              <span>Hệ thống ổn định</span>
            )}
          </div>
        </div>

        {/* Card 4: Pending Orders */}
        <div className={`relative overflow-hidden rounded-xl border bg-white p-5 shadow-sm transition ${
          stats?.pendingOrders && stats.pendingOrders > 0 ? 'border-rose-350 bg-rose-50/15' : 'border-slate-200'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Đơn Hàng Chờ Xử Lý</p>
              <h4 className="mt-2 text-3xl font-bold text-slate-800">{stats?.pendingOrders || 0}</h4>
            </div>
            <div className={`rounded-xl p-2.5 ${
              stats?.pendingOrders && stats.pendingOrders > 0 ? 'bg-rose-100 text-rose-600' : 'bg-slate-50 text-slate-500'
            }`}>
              <Clock size={22} />
            </div>
          </div>
          <div className="mt-4 text-xs text-slate-550 border-t border-slate-100 pt-3">
            {stats?.pendingOrders && stats.pendingOrders > 0 ? (
              <span className="font-semibold text-rose-700 animate-pulse">Có đơn thanh toán cần duyệt!</span>
            ) : (
              <span>Không có đơn treo</span>
            )}
          </div>
        </div>
      </div>

      {/* Main Stats Chart & Quick Links */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Plan Share Pie Chart */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
          <h5 className="text-base font-bold text-slate-800">Phân Phối Gói Dịch Vụ</h5>
          <p className="text-xs text-slate-400">Tỷ trọng các gói subscription đang hoạt động</p>
          
          <div className="mt-4 h-64">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} tổ chức`, 'Số lượng']} />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-slate-400">
                Chưa có dữ liệu phân bổ gói
              </div>
            )}
          </div>
        </div>

        {/* Quick Link/Actions Card */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col justify-between">
          <div>
            <h5 className="text-base font-bold text-slate-800">Phím Tắt Vận Hành</h5>
            <p className="text-xs text-slate-400">Các tác vụ thường nhật của SuperAdmin</p>
            
            <div className="mt-6 space-y-3">
              <button
                onClick={() => { window.location.hash = '#/super/orders'; }}
                className="w-full flex items-center justify-between rounded-xl border border-slate-200/60 bg-slate-50/50 px-4 py-3 hover:bg-slate-50 hover:border-slate-350 hover:shadow-sm transition-all duration-150 active:scale-[0.98] text-left text-sm font-semibold text-slate-700"
              >
                <span>Xử lý Đơn hàng chờ</span>
                <span className="flex items-center gap-1.5 text-xs text-cyan-600">
                  {stats?.pendingOrders || 0} đơn <ArrowRight size={14} />
                </span>
              </button>

              <button
                onClick={() => { window.location.hash = '#/super/organizations'; }}
                className="w-full flex items-center justify-between rounded-xl border border-slate-200/60 bg-slate-50/50 px-4 py-3 hover:bg-slate-50 hover:border-slate-350 hover:shadow-sm transition-all duration-150 active:scale-[0.98] text-left text-sm font-semibold text-slate-700"
              >
                <span>Kích hoạt Tổ chức mới</span>
                <span className="flex items-center gap-1.5 text-xs text-cyan-600">
                  Xem danh sách <ArrowRight size={14} />
                </span>
              </button>

              <button
                onClick={() => { window.location.hash = '#/super/plans'; }}
                className="w-full flex items-center justify-between rounded-xl border border-slate-200/60 bg-slate-50/50 px-4 py-3 hover:bg-slate-50 hover:border-slate-350 hover:shadow-sm transition-all duration-150 active:scale-[0.98] text-left text-sm font-semibold text-slate-700"
              >
                <span>Quản lý biểu giá</span>
                <span className="flex items-center gap-1.5 text-xs text-cyan-600">
                  Điều chỉnh <ArrowRight size={14} />
                </span>
              </button>
            </div>
          </div>

          <div className="mt-6 border-t border-slate-100 pt-4 text-center">
            <p className="text-[11px] text-slate-400">MANTO Management Console v1.0</p>
          </div>
        </div>
      </div>
    </div>
  );
}
