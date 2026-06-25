import { useEffect, useMemo, useState } from 'react';
import { getPublicPlans, createOrder } from '../api';
import type { SubscriptionPlanDto } from '../types';
import CustomerLayout from '../components/CustomerLayout';
import { Loader2, AlertCircle, ShoppingBag, CreditCard, User, Building, Phone, Mail } from 'lucide-react';

export default function CreateOrderPage() {
  const [plans, setPlans] = useState<SubscriptionPlanDto[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasPendingOrderError, setHasPendingOrderError] = useState(false);

  // Form Fields
  const [companyName, setCompanyName] = useState('');
  const [companyEmail, setCompanyEmail] = useState('');
  const [companyPhone, setCompanyPhone] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminFirstName, setAdminFirstName] = useState('');
  const [adminLastName, setAdminLastName] = useState('');

  // Read URL query params
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

  const planId = useMemo(() => {
    const id = queryParams.get('planId');
    return id ? parseInt(id, 10) : null;
  }, [queryParams]);

  const cycle = useMemo(() => {
    const c = queryParams.get('cycle');
    return c === 'MONTHLY' ? 'MONTHLY' : 'YEARLY';
  }, [queryParams]);

  useEffect(() => {
    async function loadPlans() {
      try {
        setLoadingPlans(true);
        const data = await getPublicPlans();
        setPlans(data);
      } catch (err: any) {
        console.warn('Failed to load plans:', err);
        setError('Unable to load plan details.');
      } finally {
        setLoadingPlans(false);
      }
    }
    loadPlans();
  }, []);

  const selectedPlan = useMemo(() => {
    if (!planId) return null;
    return plans.find((p) => p.id === planId) || null;
  }, [plans, planId]);

  const amount = useMemo(() => {
    if (!selectedPlan) return 0;
    return cycle === 'MONTHLY' ? selectedPlan.priceMonthly : selectedPlan.priceYearly;
  }, [selectedPlan, cycle]);

  const formatVND = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const isEmailValid = (emailVal: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal.trim());
  };

  const isFormValid = useMemo(() => {
    return (
      planId !== null &&
      companyName.trim().length > 0 &&
      isEmailValid(companyEmail) &&
      isEmailValid(adminEmail) &&
      adminFirstName.trim().length > 0 &&
      adminLastName.trim().length > 0
    );
  }, [planId, companyName, companyEmail, adminEmail, adminFirstName, adminLastName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || submitting || !planId) return;

    setSubmitting(true);
    setError(null);
    setHasPendingOrderError(false);

    try {
      const response = await createOrder({
        planId,
        billingCycle: cycle,
        companyName: companyName.trim(),
        companyEmail: companyEmail.trim(),
        companyPhone: companyPhone.trim() || undefined,
        adminEmail: adminEmail.trim(),
        adminFirstName: adminFirstName.trim(),
        adminLastName: adminLastName.trim(),
      });

      // Redirect to VNPay
      if (response && response.paymentUrl) {
        window.location.href = response.paymentUrl;
      } else {
        throw new Error('Could not retrieve payment link from system.');
      }
    } catch (err: any) {
      const errMsg = err.message || 'Order creation failed. Please verify your details.';
      setError(errMsg);

      // Check if error is related to pending orders
      if (
        errMsg.toLowerCase().includes('chưa thanh toán') ||
        errMsg.toLowerCase().includes('pending') ||
        errMsg.toLowerCase().includes('huỷ đơn cũ')
      ) {
        setHasPendingOrderError(true);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <CustomerLayout pageTitle="Checkout & Subscriptions">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start mb-12">
        {/* Left: Input Form */}
        <div className="lg:col-span-2 space-y-6">
          {error && (
            <div className={`p-4 rounded-xl border flex flex-col gap-2 ${
              hasPendingOrderError
                ? 'bg-amber-50 border-amber-200 text-amber-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}>
              <div className="flex items-center gap-3">
                <AlertCircle size={20} className={hasPendingOrderError ? 'text-amber-600' : 'text-rose-600'} />
                <span className="font-semibold">{error}</span>
              </div>
              {hasPendingOrderError && (
                <div className="mt-2 pt-2 border-t border-amber-200/50 flex gap-4">
                  <a
                    href="#/orders"
                    className="inline-flex items-center gap-1.5 text-sm bg-amber-500 text-slate-950 px-3 py-1.5 rounded-lg font-bold hover:brightness-110 transition"
                  >
                    <ShoppingBag size={14} /> View My Orders
                  </a>
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm">
            {/* Section 1: Company Profile */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
                <Building size={18} className="text-blue-600" />
                Company Profile
              </h3>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Company / Enterprise Name</label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Manto Vietnam LLC"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Company Contact Email</label>
                  <input
                    type="email"
                    required
                    value={companyEmail}
                    onChange={(e) => setCompanyEmail(e.target.value)}
                    placeholder="contact@company.com"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                  {companyEmail && !isEmailValid(companyEmail) && (
                    <p className="text-xs text-rose-650 font-medium">Invalid email format</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Company Phone Number</label>
                  <input
                    type="text"
                    value={companyPhone}
                    onChange={(e) => setCompanyPhone(e.target.value)}
                    placeholder="+84 24xxxxxxxx"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Organization Administrator Credentials */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
                <User size={18} className="text-blue-600" />
                Administrator Account (Admin)
              </h3>
              <p className="text-xs text-blue-800 bg-blue-50/50 p-3.5 rounded-xl border border-blue-200/50 leading-relaxed">
                ⚠️ <strong>Important Note:</strong> This email address will be used to log in to the enterprise admin panel once the order is active. Please enter a valid, active email.
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Last Name</label>
                  <input
                    type="text"
                    required
                    value={adminLastName}
                    onChange={(e) => setAdminLastName(e.target.value)}
                    placeholder="Smith"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">First Name</label>
                  <input
                    type="text"
                    required
                    value={adminFirstName}
                    onChange={(e) => setAdminFirstName(e.target.value)}
                    placeholder="John"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Admin Login Email</label>
                <input
                  type="email"
                  required
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="admin@company.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
                {adminEmail && !isEmailValid(adminEmail) && (
                  <p className="text-xs text-rose-650 font-medium">Invalid email format</p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={!isFormValid || submitting}
                className="w-full bg-blue-600 text-white font-extrabold py-4 px-6 rounded-2xl shadow-md hover:bg-blue-700 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Connecting to VNPay Payment Gateway...
                  </>
                ) : (
                  <>
                    <CreditCard size={18} />
                    Proceed to Payment via VNPay ({formatVND(amount)})
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right: Summary Sidebar */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 pb-3 border-b border-slate-100">
              Order Summary
            </h3>

            {loadingPlans ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 size={24} className="text-blue-600 animate-spin" />
              </div>
            ) : selectedPlan ? (
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-slate-900 text-base">{selectedPlan.name}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Cycle: {cycle === 'MONTHLY' ? 'Monthly' : 'Yearly'}
                    </p>
                  </div>
                  <span className="bg-blue-50 text-blue-700 border border-blue-100 text-xs px-2.5 py-1 rounded-full font-bold">
                    Active
                  </span>
                </div>

                <div className="border-t border-b border-slate-100 py-3.5 space-y-2 text-sm text-slate-600">
                  <div className="flex justify-between">
                    <span>Account Limit:</span>
                    <span className="font-semibold text-slate-900">{selectedPlan.maxUsers} users</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Departments Limit:</span>
                    <span className="font-semibold text-slate-900">{selectedPlan.maxDepartments} departments</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Teams Limit:</span>
                    <span className="font-semibold text-slate-900">{selectedPlan.maxTeams} teams</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-slate-500">
                    <span>List Price:</span>
                    <span>{formatVND(amount)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-slate-500">
                    <span>VAT (0%):</span>
                    <span>0 ₫</span>
                  </div>
                  <div className="border-t border-slate-100 pt-3 flex justify-between items-baseline">
                    <span className="text-sm font-bold text-slate-900">Total Amount:</span>
                    <span className="text-2xl font-extrabold text-blue-650 text-blue-600">
                      {formatVND(amount)}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-slate-500 py-6 text-sm">
                Could not find plan details. Please return to the pricing page.
                <a href="#/pricing" className="block text-blue-600 hover:underline mt-2">
                  ← View Pricing
                </a>
              </div>
            )}
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-slate-500 space-y-2">
            <h4 className="font-bold text-slate-700">Subscription Terms:</h4>
            <p>
              - Payments via VNPay gateway support domestic & international cards, or QR code scan.
            </p>
            <p>
              - Orders are processed and activated automatically immediately upon transaction completion.
            </p>
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
}
