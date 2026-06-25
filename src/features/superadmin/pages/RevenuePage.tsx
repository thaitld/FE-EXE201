import { useEffect, useState } from 'react';
import { getRevenueStats } from '../api';
import type { RevenueDto } from '../types';
import { TrendingUp, ShoppingBag, CalendarDays } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const CHART_COLORS = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444'];
const AVAILABLE_YEARS = [2026, 2025, 2024];

export default function RevenuePage() {
  const [year, setYear] = useState<number>(() => new Date().getFullYear());
  const [data, setData] = useState<RevenueDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadStats = async () => {
    try {
      setLoading(true);
      const res = await getRevenueStats(year);
      setData(res);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Không thể tải thống kê doanh thu.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, [year]);

  const formatCurrency = (val: number) => {
    return `${val.toLocaleString('vi-VN')}đ`;
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-2xl bg-rose-50 border border-rose-200 p-6 text-rose-800">
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

  const monthlyChartData = data.monthly.map((m) => ({
    name: m.monthLabel,
    'Doanh Thu': m.amount,
    'Số Đơn': m.orderCount
  }));

  const planChartData = data.byPlan.map((p) => ({
    name: p.planName,
    value: p.amount,
    count: p.orderCount
  }));

  return (
    <div className="space-y-6">
      {/* Filters Bar */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">Phân tích chuyên sâu tình hình doanh thu phát sinh trên toàn hệ thống.</p>
        <div className="flex items-center gap-2">
          <CalendarDays size={16} className="text-slate-400" />
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold focus:outline-none"
          >
            {AVAILABLE_YEARS.map((y) => (
              <option key={y} value={y}>
                Năm {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Cards stats grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {/* Total Revenue */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Doanh Thu Năm {year}</span>
            <h4 className="mt-2 text-2xl font-black text-slate-800">{formatCurrency(data.totalRevenue)}</h4>
          </div>
          <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
            <TrendingUp size={24} />
          </div>
        </div>

        {/* Total Paid Orders */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Tổng Số Đơn Đã Thanh Toán</span>
            <h4 className="mt-2 text-2xl font-black text-slate-800">{data.totalOrders} đơn hàng</h4>
          </div>
          <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
            <ShoppingBag size={24} />
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* 12 Month Bar Chart */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
          <h5 className="text-sm font-bold text-slate-800 mb-4">Biểu Đồ Doanh Thu 12 Tháng</h5>
          <div className="h-72 text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(val) => `${(val / 1000000).toFixed(0)}tr`} />
                <Tooltip formatter={(value, name) => [name === 'Doanh Thu' ? formatCurrency(value as number) : `${value} đơn`, name]} />
                <Legend />
                <Bar dataKey="Doanh Thu" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Plan Breakdown Pie Chart */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h5 className="text-sm font-bold text-slate-800 mb-4">Doanh Thu Theo Gói Dịch Vụ</h5>
          <div className="h-72 text-xs">
            {planChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={planChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {planChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name, props) => [formatCurrency(value as number), `${props.payload.name} (${props.payload.count} đơn)`]} />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-slate-400">
                Chưa phát sinh doanh thu từ các gói.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
