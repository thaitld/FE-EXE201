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
      for (const [key, value] of hashParams.entries()) {
        params.set(key, value);
      }
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
        setError('Không thể tải thông tin gói dịch vụ.');
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
        throw new Error('Không nhận được link thanh toán từ hệ thống.');
      }
    } catch (err: any) {
      const errMsg = err.message || 'Tạo đơn hàng thất bại. Vui lòng kiểm tra lại thông tin.';
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
    <CustomerLayout pageTitle="Thanh Toán Đăng Ký Gói">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start mb-12">
        {/* Left: Input Form */}
        <div className="lg:col-span-2 space-y-6">
          {error && (
            <div className={`p-4 rounded-xl border flex flex-col gap-2 ${
              hasPendingOrderError
                ? 'bg-amber-950/60 border-amber-500/30 text-amber-200'
                : 'bg-rose-950/60 border-rose-500/30 text-rose-200'
            }`}>
              <div className="flex items-center gap-3">
                <AlertCircle size={20} className={hasPendingOrderError ? 'text-amber-400' : 'text-rose-400'} />
                <span className="font-semibold">{error}</span>
              </div>
              {hasPendingOrderError && (
                <div className="mt-2 pt-2 border-t border-amber-500/20 flex gap-4">
                  <a
                    href="#/orders"
                    className="inline-flex items-center gap-1.5 text-sm bg-amber-500 text-slate-950 px-3 py-1.5 rounded-lg font-bold hover:brightness-110 transition"
                  >
                    <ShoppingBag size={14} /> Xem đơn hàng của tôi
                  </a>
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="bg-slate-950 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6">
            {/* Section 1: Company Profile */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2 pb-2 border-b border-slate-800">
                <Building size={18} className="text-emerald-400" />
                Thông Tin Doanh Nghiệp
              </h3>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tên công ty / doanh nghiệp</label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Công ty TNHH Manto Việt Nam"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 px-4 text-sm text-white placeholder-slate-600 outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Email liên hệ công ty</label>
                  <input
                    type="email"
                    required
                    value={companyEmail}
                    onChange={(e) => setCompanyEmail(e.target.value)}
                    placeholder="contact@company.com"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 px-4 text-sm text-white placeholder-slate-600 outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
                  />
                  {companyEmail && !isEmailValid(companyEmail) && (
                    <p className="text-xs text-rose-400">Định dạng email liên hệ không hợp lệ</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Số điện thoại liên hệ</label>
                  <input
                    type="text"
                    value={companyPhone}
                    onChange={(e) => setCompanyPhone(e.target.value)}
                    placeholder="024xxxxxxxx"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 px-4 text-sm text-white placeholder-slate-600 outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Organization Administrator Credentials */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2 pb-2 border-b border-slate-800">
                <User size={18} className="text-emerald-400" />
                Tài Khoản Quản Trị Viên (Admin)
              </h3>
              <p className="text-xs text-slate-400 bg-slate-900/50 p-3 rounded-xl border border-slate-800">
                ⚠️ <strong>Lưu ý quan trọng:</strong> Địa chỉ email này sẽ được dùng để đăng nhập vào trang quản trị doanh nghiệp sau khi đơn hàng được kích hoạt. Vui lòng nhập đúng email đang hoạt động.
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Họ</label>
                  <input
                    type="text"
                    required
                    value={adminLastName}
                    onChange={(e) => setAdminLastName(e.target.value)}
                    placeholder="Nguyễn"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 px-4 text-sm text-white placeholder-slate-600 outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tên</label>
                  <input
                    type="text"
                    required
                    value={adminFirstName}
                    onChange={(e) => setAdminFirstName(e.target.value)}
                    placeholder="Văn An"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 px-4 text-sm text-white placeholder-slate-600 outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Email Quản trị viên</label>
                <input
                  type="email"
                  required
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="admin@company.com"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 px-4 text-sm text-white placeholder-slate-600 outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
                />
                {adminEmail && !isEmailValid(adminEmail) && (
                  <p className="text-xs text-rose-400">Định dạng email quản trị không hợp lệ</p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={!isFormValid || submitting}
                className="w-full bg-gradient-to-r from-emerald-400 to-cyan-400 text-slate-950 font-black py-4 px-6 rounded-2xl shadow-xl hover:brightness-110 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Đang kết nối cổng thanh toán VNPay...
                  </>
                ) : (
                  <>
                    <CreditCard size={18} />
                    Tiến Hành Thanh Toán Qua VNPay ({formatVND(amount)})
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right: Summary Sidebar */}
        <div className="space-y-6">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 space-y-6">
            <h3 className="text-lg font-bold text-white pb-3 border-b border-slate-800">
              Tóm tắt đơn hàng
            </h3>

            {loadingPlans ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 size={24} className="text-emerald-400 animate-spin" />
              </div>
            ) : selectedPlan ? (
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-white text-base">{selectedPlan.name}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Chu kỳ: {cycle === 'MONTHLY' ? 'Hàng tháng' : 'Hàng năm'}
                    </p>
                  </div>
                  <span className="bg-emerald-500/20 text-emerald-400 text-xs px-2.5 py-1 rounded-full font-bold">
                    Active
                  </span>
                </div>

                <div className="border-t border-b border-slate-800/60 py-3.5 space-y-2 text-sm text-slate-300">
                  <div className="flex justify-between">
                    <span>Hạn mức tài khoản:</span>
                    <span className="font-semibold text-white">{selectedPlan.maxUsers} thành viên</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Số phòng ban:</span>
                    <span className="font-semibold text-white">{selectedPlan.maxDepartments} phòng</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Số nhóm làm việc:</span>
                    <span className="font-semibold text-white">{selectedPlan.maxTeams} nhóm</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-slate-400">
                    <span>Giá niêm yết:</span>
                    <span>{formatVND(amount)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-slate-400">
                    <span>Thuế GTGT (0%):</span>
                    <span>0 ₫</span>
                  </div>
                  <div className="border-t border-slate-800 pt-3 flex justify-between items-baseline">
                    <span className="text-sm font-bold text-white">Tổng cộng:</span>
                    <span className="text-2xl font-extrabold text-emerald-400">
                      {formatVND(amount)}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-slate-500 py-6 text-sm">
                Không tìm thấy thông tin gói dịch vụ. Vui lòng quay lại bảng giá.
                <a href="#/pricing" className="block text-emerald-400 hover:underline mt-2">
                  ← Xem bảng giá
                </a>
              </div>
            )}
          </div>

          <div className="bg-slate-950/40 border border-slate-850 rounded-2xl p-4 text-xs text-slate-500 space-y-2">
            <h4 className="font-bold text-slate-400">Điều khoản đăng ký:</h4>
            <p>
              - Thanh toán qua cổng VNPay hỗ trợ các loại thẻ nội địa, thẻ quốc tế hoặc quét mã QR.
            </p>
            <p>
              - Đơn hàng sẽ được xử lý kích hoạt tự động ngay sau khi hoàn tất giao dịch.
            </p>
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
}
