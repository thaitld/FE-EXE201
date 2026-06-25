import { useEffect, useState } from 'react';
import { getPublicPlans } from '../api';
import type { SubscriptionPlanDto } from '../types';
import CustomerLayout from '../components/CustomerLayout';
import { useAuth } from '@/features/auth/AuthContext';
import { Check, X, Loader2, AlertCircle, Sparkles } from 'lucide-react';

export default function PricingPage() {
  const [plans, setPlans] = useState<SubscriptionPlanDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<'MONTHLY' | 'YEARLY'>('YEARLY');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);
  const { isAuthenticated, role } = useAuth();

  useEffect(() => {
    async function loadPlans() {
      try {
        setLoading(true);
        const data = await getPublicPlans();
        // Filter only active plans and sort by monthly price ascending
        const sorted = data
          .filter((p) => p.isActive)
          .sort((a, b) => a.priceMonthly - b.priceMonthly);
        setPlans(sorted);
      } catch (err: any) {
        setError(err.message || 'Không thể tải bảng giá. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    }
    loadPlans();
  }, []);

  const showToast = (message: string, type: 'success' | 'error' | 'warning' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleBuyNow = (plan: SubscriptionPlanDto) => {
    if (!isAuthenticated) {
      const redirectPath = encodeURIComponent(`/orders/new?planId=${plan.id}&cycle=${billingCycle}`);
      window.location.hash = `#/customer/login?redirect=${redirectPath}`;
      return;
    }

    const hasRole = (targetRole: string) => {
      if (Array.isArray(role)) {
        return role.some((r) => typeof r === 'string' && r.toLowerCase() === targetRole.toLowerCase());
      }
      return typeof role === 'string' && role.toLowerCase() === targetRole.toLowerCase();
    };

    if (hasRole('customer')) {
      window.location.hash = `#/orders/new?planId=${plan.id}&cycle=${billingCycle}`;
    } else {
      showToast('Tài khoản nội bộ (Admin/Manager/Employee) không thể mua gói dịch vụ.', 'warning');
    }
  };

  const formatVND = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const getDiscountPercentage = (monthly: number, yearly: number) => {
    const originalYearly = monthly * 12;
    if (originalYearly <= yearly) return 0;
    return Math.round(((originalYearly - yearly) / originalYearly) * 100);
  };

  return (
    <CustomerLayout>
      {/* Toast Alert */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 animate-bounce">
          <div className={`flex items-center gap-3 px-5 py-4 rounded-xl border shadow-xl ${
            toast.type === 'error'
              ? 'bg-rose-950/90 border-rose-500/30 text-rose-200'
              : toast.type === 'warning'
              ? 'bg-amber-950/90 border-amber-500/30 text-amber-200'
              : 'bg-emerald-950/90 border-emerald-500/30 text-emerald-200'
          }`}>
            <AlertCircle size={18} />
            <span className="text-sm font-semibold">{toast.message}</span>
          </div>
        </div>
      )}

      {/* Header section */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <h2 className="text-4xl font-extrabold tracking-tight text-white mb-4 sm:text-5xl">
          Chọn Gói Dịch Vụ Phù Hợp Cho Doanh Nghiệp
        </h2>
        <p className="text-lg text-slate-400">
          Nâng cao hiệu suất và chăm sóc sức khỏe tinh thần đội ngũ của bạn với nền tảng quản trị thông minh MANTO.
        </p>

        {/* Toggle billing */}
        <div className="mt-8 flex items-center justify-center gap-3">
          <span className={`text-sm font-medium ${billingCycle === 'MONTHLY' ? 'text-white' : 'text-slate-400'}`}>
            Thanh toán hàng tháng
          </span>
          <button
            onClick={() => setBillingCycle(billingCycle === 'MONTHLY' ? 'YEARLY' : 'MONTHLY')}
            className="w-14 h-8 bg-slate-800 rounded-full p-1 transition-colors relative flex items-center focus:outline-none"
            aria-label="Toggle billing cycle"
          >
            <div className={`w-6 h-6 bg-emerald-400 rounded-full shadow-md transition-transform duration-300 ${
              billingCycle === 'YEARLY' ? 'translate-x-6' : 'translate-x-0'
            }`} />
          </button>
          <span className={`text-sm font-medium flex items-center gap-1.5 ${billingCycle === 'YEARLY' ? 'text-white' : 'text-slate-400'}`}>
            Thanh toán hàng năm
            <span className="bg-emerald-500/20 text-emerald-400 text-xs px-2 py-0.5 rounded-full font-bold">
              Tiết kiệm đến 20%+
            </span>
          </span>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <Loader2 size={40} className="text-emerald-400 animate-spin" />
          <p className="text-slate-400">Đang tải bảng giá dịch vụ...</p>
        </div>
      ) : error ? (
        <div className="max-w-md mx-auto text-center py-16 bg-slate-950/50 rounded-2xl border border-slate-800 p-8">
          <AlertCircle size={40} className="text-rose-400 mx-auto mb-4" />
          <p className="text-rose-200 font-semibold mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-medium transition"
          >
            Tải lại trang
          </button>
        </div>
      ) : plans.length === 0 ? (
        <div className="max-w-md mx-auto text-center py-16 bg-slate-950/50 rounded-2xl border border-slate-800 p-8">
          <AlertCircle size={40} className="text-amber-400 mx-auto mb-4" />
          <p className="text-slate-300 font-semibold mb-4">Hiện chưa có gói dịch vụ nào được kích hoạt.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start mb-16">
          {plans.map((plan) => {
            const isYearly = billingCycle === 'YEARLY';
            const price = isYearly ? plan.priceYearly : plan.priceMonthly;
            const savings = getDiscountPercentage(plan.priceMonthly, plan.priceYearly);
            const isPopular = plan.name.toLowerCase().includes('elite') || plan.name.toLowerCase().includes('popular') || plans.length === 2 && plan.id === plans[1].id;

            return (
              <div
                key={plan.id}
                className={`relative rounded-3xl p-8 transition-all duration-300 flex flex-col h-full ${
                  isPopular
                    ? 'bg-slate-950 border-2 border-emerald-400 shadow-[0_20px_50px_rgba(16,185,129,0.15)] scale-[1.02] z-10'
                    : 'bg-slate-950/60 border border-slate-800 hover:border-slate-700 shadow-xl'
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-emerald-400 to-cyan-400 text-slate-950 text-xs uppercase tracking-widest font-black px-4 py-1.5 rounded-full flex items-center gap-1.5 shadow-md">
                    <Sparkles size={12} /> Gợi ý nhiều nhất
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                  <p className="text-sm text-slate-400 h-12 overflow-hidden">{plan.description || 'Gói dịch vụ cao cấp cho quản lý doanh nghiệp.'}</p>
                </div>

                <div className="mb-6 flex flex-col justify-end">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold text-white tracking-tight">
                      {formatVND(price)}
                    </span>
                    <span className="text-slate-400 text-sm">
                      /{isYearly ? 'năm' : 'tháng'}
                    </span>
                  </div>

                  {isYearly && savings > 0 && (
                    <span className="text-xs text-emerald-400 font-bold mt-1.5 inline-block">
                      Tiết kiệm {savings}% so với đóng hàng tháng
                    </span>
                  )}
                </div>

                {/* Buy Button */}
                <button
                  onClick={() => handleBuyNow(plan)}
                  className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm shadow-md transition-all active:scale-[0.99] mb-8 ${
                    isPopular
                      ? 'bg-gradient-to-r from-emerald-400 to-cyan-400 text-slate-950 hover:brightness-110'
                      : 'bg-slate-850 hover:bg-slate-800 text-white'
                  }`}
                >
                  Mua ngay
                </button>

                {/* Features comparison */}
                <div className="space-y-4 flex-1">
                  <div className="text-xs uppercase tracking-wider font-bold text-slate-400 mb-3 border-b border-slate-800 pb-2">
                    Giới hạn & Tính năng
                  </div>

                  <ul className="space-y-3.5 text-sm text-slate-300">
                    <li className="flex items-center gap-3">
                      <Check size={16} className="text-emerald-400 shrink-0" />
                      <span>Tối đa <strong>{plan.maxUsers}</strong> thành viên</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <Check size={16} className="text-emerald-400 shrink-0" />
                      <span>Tối đa <strong>{plan.maxDepartments}</strong> phòng ban</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <Check size={16} className="text-emerald-400 shrink-0" />
                      <span>Tối đa <strong>{plan.maxTeams}</strong> nhóm làm việc</span>
                    </li>

                    <li className="flex items-center gap-3 border-t border-slate-800/40 pt-3">
                      {plan.allowAiFeatures ? (
                        <Check size={16} className="text-emerald-400 shrink-0" />
                      ) : (
                        <X size={16} className="text-slate-600 shrink-0" />
                      )}
                      <span className={plan.allowAiFeatures ? '' : 'text-slate-500 line-through'}>
                        Tính năng phân tích AI
                      </span>
                    </li>

                    <li className="flex items-center gap-3">
                      {plan.allowBurnoutDetection ? (
                        <Check size={16} className="text-emerald-400 shrink-0" />
                      ) : (
                        <X size={16} className="text-slate-600 shrink-0" />
                      )}
                      <span className={plan.allowBurnoutDetection ? '' : 'text-slate-500 line-through'}>
                        Phát hiện kiệt sức (Burnout Detection)
                      </span>
                    </li>

                    <li className="flex items-center gap-3">
                      {plan.allowKpi ? (
                        <Check size={16} className="text-emerald-400 shrink-0" />
                      ) : (
                        <X size={16} className="text-slate-600 shrink-0" />
                      )}
                      <span className={plan.allowKpi ? '' : 'text-slate-500 line-through'}>
                        Đánh giá chỉ số KPI tinh thần
                      </span>
                    </li>

                    <li className="flex items-center gap-3">
                      {plan.allowCustomSurvey ? (
                        <Check size={16} className="text-emerald-400 shrink-0" />
                      ) : (
                        <X size={16} className="text-slate-600 shrink-0" />
                      )}
                      <span className={plan.allowCustomSurvey ? '' : 'text-slate-500 line-through'}>
                        Khảo sát tùy chỉnh linh hoạt
                      </span>
                    </li>

                    <li className="flex items-center gap-3">
                      {plan.allowAdvancedReports ? (
                        <Check size={16} className="text-emerald-400 shrink-0" />
                      ) : (
                        <X size={16} className="text-slate-600 shrink-0" />
                      )}
                      <span className={plan.allowAdvancedReports ? '' : 'text-slate-500 line-through'}>
                        Báo cáo & phân tích chuyên sâu
                      </span>
                    </li>

                    <li className="flex items-center gap-3">
                      {plan.allowGoogleCalendar ? (
                        <Check size={16} className="text-emerald-400 shrink-0" />
                      ) : (
                        <X size={16} className="text-slate-600 shrink-0" />
                      )}
                      <span className={plan.allowGoogleCalendar ? '' : 'text-slate-500 line-through'}>
                        Tích hợp Google Calendar
                      </span>
                    </li>

                    <li className="flex items-center gap-3">
                      {plan.allowBulkImport ? (
                        <Check size={16} className="text-emerald-400 shrink-0" />
                      ) : (
                        <X size={16} className="text-slate-600 shrink-0" />
                      )}
                      <span className={plan.allowBulkImport ? '' : 'text-slate-500 line-through'}>
                        Nhập thành viên hàng loạt (Bulk Import)
                      </span>
                    </li>

                    <li className="flex items-center gap-3">
                      {plan.allowExport ? (
                        <Check size={16} className="text-emerald-400 shrink-0" />
                      ) : (
                        <X size={16} className="text-slate-600 shrink-0" />
                      )}
                      <span className={plan.allowExport ? '' : 'text-slate-500 line-through'}>
                        Xuất dữ liệu báo cáo (PDF/Excel)
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </CustomerLayout>
  );
}
