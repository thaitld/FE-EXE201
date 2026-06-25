import { useEffect, useState } from 'react';
import { getPublicPlans } from '../api';
import type { SubscriptionPlanDto } from '../types';
import CustomerLayout from '../components/CustomerLayout';
import { useAuth } from '@/features/auth/AuthContext';
import { Check, X, Loader2, AlertCircle, Sparkles } from 'lucide-react';
import { BorderBeam } from '@/components/ui/border-beam';

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
        setError(err.message || 'Unable to load pricing details. Please try again later.');
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
      showToast('Internal roles (Admin/Manager/Employee) cannot purchase service plans.', 'warning');
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
          <div className={`flex items-center gap-3 px-5 py-4 rounded-xl border shadow-xl bg-white text-slate-800 ${
            toast.type === 'error'
              ? 'border-rose-200'
              : toast.type === 'warning'
              ? 'border-amber-200'
              : 'border-emerald-200'
          }`}>
            <AlertCircle size={18} className={
              toast.type === 'error' ? 'text-rose-500' : toast.type === 'warning' ? 'text-amber-500' : 'text-emerald-500'
            } />
            <span className="text-sm font-semibold">{toast.message}</span>
          </div>
        </div>
      )}

      {/* Light Theme Card Wrapper */}
      <div className="bg-slate-50 text-slate-800 rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-sm flex-1">
        {/* Header section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-4 sm:text-5xl">
            Choose the Perfect Plan for Your Enterprise
          </h2>
          <p className="text-lg text-slate-600">
            Elevate efficiency and protect employee well-being with MANTO's smart administration platform.
          </p>

          {/* Toggle billing */}
          <div className="mt-8 flex items-center justify-center gap-3">
            <span className={`text-sm font-semibold transition-colors ${billingCycle === 'MONTHLY' ? 'text-slate-900' : 'text-slate-500'}`}>
              Monthly billing
            </span>
            <button
              onClick={() => setBillingCycle(billingCycle === 'MONTHLY' ? 'YEARLY' : 'MONTHLY')}
              className="w-14 h-8 bg-slate-200 rounded-full p-1 transition-colors relative flex items-center focus:outline-none border border-slate-300"
              aria-label="Toggle billing cycle"
            >
              <div className={`w-6 h-6 bg-blue-600 rounded-full shadow transition-transform duration-300 ${
                billingCycle === 'YEARLY' ? 'translate-x-6' : 'translate-x-0'
              }`} />
            </button>
            <span className={`text-sm font-semibold flex items-center gap-1.5 transition-colors ${billingCycle === 'YEARLY' ? 'text-slate-900' : 'text-slate-500'}`}>
              Annual billing
              <span className="bg-blue-100 text-blue-700 border border-blue-200 text-xs px-2.5 py-0.5 rounded-full font-bold">
                Save up to 20%+
              </span>
            </span>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 size={40} className="text-blue-600 animate-spin" />
            <p className="text-slate-500 font-medium">Loading pricing details...</p>
          </div>
        ) : error ? (
          <div className="max-w-md mx-auto text-center py-16 bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
            <AlertCircle size={40} className="text-rose-500 mx-auto mb-4" />
            <p className="text-slate-800 font-semibold mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-medium transition"
            >
              Reload Page
            </button>
          </div>
        ) : plans.length === 0 ? (
          <div className="max-w-md mx-auto text-center py-16 bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
            <AlertCircle size={40} className="text-amber-500 mx-auto mb-4" />
            <p className="text-slate-600 font-semibold mb-4">No active service plans are currently available.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
            {plans.map((plan) => {
              const isYearly = billingCycle === 'YEARLY';
              const price = isYearly ? plan.priceYearly : plan.priceMonthly;
              const savings = getDiscountPercentage(plan.priceMonthly, plan.priceYearly);
              const isPopular = plan.name.toLowerCase().includes('elite') || plan.name.toLowerCase().includes('popular') || plans.length === 2 && plan.id === plans[1].id;

              return (
                <div
                  key={plan.id}
                  className={`relative rounded-3xl p-8 transition-all duration-300 flex flex-col h-full bg-white ${
                    isPopular
                      ? 'border-2 border-blue-600 shadow-xl scale-[1.02] z-10'
                      : 'border border-slate-200/90 shadow-md hover:shadow-lg hover:border-slate-300 hover:scale-[1.01]'
                  }`}
                >
                  {isPopular ? (
                    <BorderBeam borderWidth={3} duration={6} colorFrom="#2563eb" />
                  ) : (
                    <BorderBeam borderWidth={1.5} duration={12} colorFrom="#cbd5e1" />
                  )}
                  {isPopular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs uppercase tracking-widest font-black px-4 py-1.5 rounded-full flex items-center gap-1.5 shadow-md z-20">
                      <Sparkles size={12} /> Most Popular
                    </div>
                  )}

                  <div className="mb-6">
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">{plan.name}</h3>
                    <p className="text-sm text-slate-500 h-12 overflow-hidden">{plan.description || 'Premium service plan for enterprise management.'}</p>
                  </div>

                  <div className="mb-6 flex flex-col justify-end">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-extrabold text-slate-900 tracking-tight">
                        {formatVND(price)}
                      </span>
                      <span className="text-slate-500 text-sm">
                        /{isYearly ? 'year' : 'month'}
                      </span>
                    </div>

                    {isYearly && savings > 0 && (
                      <span className="text-xs text-blue-600 font-bold mt-1.5 inline-block">
                        Save {savings}% compared to monthly billing
                      </span>
                    )}
                  </div>

                  {/* Buy Button */}
                  <button
                    onClick={() => handleBuyNow(plan)}
                    className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm shadow-sm transition-all active:scale-[0.99] mb-8 ${
                      isPopular
                        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                    }`}
                  >
                    Buy Now
                  </button>

                  {/* Features comparison */}
                  <div className="space-y-4 flex-1">
                    <div className="text-xs uppercase tracking-wider font-bold text-slate-400 mb-3 border-b border-slate-100 pb-2">
                      Limits & Features
                    </div>

                    <ul className="space-y-3.5 text-sm text-slate-600">
                      <li className="flex items-center gap-3">
                        <Check size={16} className="text-blue-600 shrink-0" />
                        <span>Up to <strong className="text-slate-900">{plan.maxUsers}</strong> users</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <Check size={16} className="text-blue-600 shrink-0" />
                        <span>Up to <strong className="text-slate-900">{plan.maxDepartments}</strong> departments</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <Check size={16} className="text-blue-600 shrink-0" />
                        <span>Up to <strong className="text-slate-900">{plan.maxTeams}</strong> teams</span>
                      </li>

                      <li className="flex items-center gap-3 border-t border-slate-100 pt-3">
                        {plan.allowAiFeatures ? (
                          <Check size={16} className="text-blue-600 shrink-0" />
                        ) : (
                          <X size={16} className="text-slate-300 shrink-0" />
                        )}
                        <span className={plan.allowAiFeatures ? 'text-slate-700' : 'text-slate-400 line-through'}>
                          AI Analysis Features
                        </span>
                      </li>

                      <li className="flex items-center gap-3">
                        {plan.allowBurnoutDetection ? (
                          <Check size={16} className="text-blue-600 shrink-0" />
                        ) : (
                          <X size={16} className="text-slate-300 shrink-0" />
                        )}
                        <span className={plan.allowBurnoutDetection ? 'text-slate-700' : 'text-slate-400 line-through'}>
                          Burnout Detection System
                        </span>
                      </li>

                      <li className="flex items-center gap-3">
                        {plan.allowKpi ? (
                          <Check size={16} className="text-blue-600 shrink-0" />
                        ) : (
                          <X size={16} className="text-slate-300 shrink-0" />
                        )}
                        <span className={plan.allowKpi ? 'text-slate-700' : 'text-slate-400 line-through'}>
                          Mental Health KPI Assessment
                        </span>
                      </li>

                      <li className="flex items-center gap-3">
                        {plan.allowCustomSurvey ? (
                          <Check size={16} className="text-blue-600 shrink-0" />
                        ) : (
                          <X size={16} className="text-slate-300 shrink-0" />
                        )}
                        <span className={plan.allowCustomSurvey ? 'text-slate-700' : 'text-slate-400 line-through'}>
                          Customizable Survey Engine
                        </span>
                      </li>

                      <li className="flex items-center gap-3">
                        {plan.allowAdvancedReports ? (
                          <Check size={16} className="text-blue-600 shrink-0" />
                        ) : (
                          <X size={16} className="text-slate-300 shrink-0" />
                        )}
                        <span className={plan.allowAdvancedReports ? 'text-slate-700' : 'text-slate-400 line-through'}>
                          In-depth Reports & Analytics
                        </span>
                      </li>

                      <li className="flex items-center gap-3">
                        {plan.allowGoogleCalendar ? (
                          <Check size={16} className="text-blue-600 shrink-0" />
                        ) : (
                          <X size={16} className="text-slate-300 shrink-0" />
                        )}
                        <span className={plan.allowGoogleCalendar ? 'text-slate-700' : 'text-slate-400 line-through'}>
                          Google Calendar Integration
                        </span>
                      </li>

                      <li className="flex items-center gap-3">
                        {plan.allowBulkImport ? (
                          <Check size={16} className="text-blue-600 shrink-0" />
                        ) : (
                          <X size={16} className="text-slate-300 shrink-0" />
                        )}
                        <span className={plan.allowBulkImport ? 'text-slate-700' : 'text-slate-400 line-through'}>
                          Bulk Member Import
                        </span>
                      </li>

                      <li className="flex items-center gap-3">
                        {plan.allowExport ? (
                          <Check size={16} className="text-blue-600 shrink-0" />
                        ) : (
                          <X size={16} className="text-slate-300 shrink-0" />
                        )}
                        <span className={plan.allowExport ? 'text-slate-700' : 'text-slate-400 line-through'}>
                          Report Data Export (PDF/Excel)
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </CustomerLayout>
  );
}
