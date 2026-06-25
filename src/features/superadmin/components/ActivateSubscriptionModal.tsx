import { useEffect, useState } from 'react';
import { getSuperPlans, activateSubscription } from '../api';
import type { SubscriptionPlanDto } from '../types';
import { X, Sparkles, AlertCircle } from 'lucide-react';

interface ActivateSubscriptionModalProps {
  orgId: number;
  orgName: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ActivateSubscriptionModal({
  orgId,
  orgName,
  onClose,
  onSuccess
}: ActivateSubscriptionModalProps) {
  const [plans, setPlans] = useState<SubscriptionPlanDto[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<number>(0);
  const [billingCycle, setBillingCycle] = useState<'MONTHLY' | 'YEARLY'>('MONTHLY');
  
  // Administrator Info Inputs
  const [adminEmail, setAdminEmail] = useState('');
  const [adminFirstName, setAdminFirstName] = useState('');
  const [adminLastName, setAdminLastName] = useState('');

  const [loadingPlans, setLoadingPlans] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoadingPlans(true);
        // Only load active plans for subscription activation
        const allPlans = await getSuperPlans();
        const activePlans = allPlans.filter((p) => p.isActive);
        setPlans(activePlans);
        if (activePlans.length > 0) {
          setSelectedPlanId(activePlans[0].id);
        }
      } catch (err) {
        console.warn('Failed to load plans:', err);
      } finally {
        setLoadingPlans(false);
      }
    };
    fetchPlans();
  }, []);

  const selectedPlan = plans.find((p) => p.id === selectedPlanId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedPlanId) {
      setError('Vui lòng chọn một gói dịch vụ.');
      return;
    }

    if (!adminEmail.trim() || !adminFirstName.trim() || !adminLastName.trim()) {
      setError('Vui lòng điền đầy đủ thông tin quản trị viên.');
      return;
    }

    try {
      setIsSubmitting(true);
      await activateSubscription(orgId, {
        planId: selectedPlanId,
        billingCycle,
        adminEmail,
        adminFirstName,
        adminLastName
      });
      alert(`Đã kích hoạt gói "${selectedPlan?.name}" thành công! Mật khẩu chào mừng đã được gửi tới email: ${adminEmail}`);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Lỗi khi kích hoạt gói dịch vụ.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPricePreview = () => {
    if (!selectedPlan) return '0đ';
    const amount = billingCycle === 'MONTHLY' ? selectedPlan.priceMonthly : selectedPlan.priceYearly;
    return `${amount.toLocaleString('vi-VN')}đ`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl transition-all animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-6 py-4.5">
          <div className="flex items-center gap-2">
            <Sparkles className="text-blue-600 animate-pulse" size={20} />
            <h3 className="text-lg font-bold text-slate-800">Kích Hoạt Gói Sử Dụng Lần Đầu</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex gap-2 rounded-xl bg-rose-50 border border-rose-200 p-3.5 text-xs font-semibold text-rose-800">
              <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Org Target Warning */}
          <div className="rounded-xl bg-blue-50 border border-blue-150 px-4 py-3 text-xs text-blue-800">
            Kích hoạt gói dịch vụ cho tổ chức: <strong className="text-blue-900">{orgName}</strong>.
            Hành động này sẽ khởi tạo tài khoản quản trị đầu tiên cho doanh nghiệp.
          </div>

          {/* Plan Dropdown & Cycle Toggle */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Gói Dịch Vụ</label>
              {loadingPlans ? (
                <div className="h-10 w-full rounded-xl bg-slate-100 animate-pulse" />
              ) : (
                <select
                  value={selectedPlanId}
                  onChange={(e) => setSelectedPlanId(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm appearance-none focus:border-blue-500 focus:outline-none focus:bg-white"
                >
                  {plans.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Chu Kỳ Thanh Toán</label>
              <div className="flex rounded-xl bg-slate-100 p-1">
                <button
                  type="button"
                  onClick={() => setBillingCycle('MONTHLY')}
                  className={`flex-1 rounded-lg py-1.5 text-xs font-bold transition ${
                    billingCycle === 'MONTHLY' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Hàng Tháng
                </button>
                <button
                  type="button"
                  onClick={() => setBillingCycle('YEARLY')}
                  className={`flex-1 rounded-lg py-1.5 text-xs font-bold transition ${
                    billingCycle === 'YEARLY' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Hàng Năm
                </button>
              </div>
            </div>
          </div>

          {/* Price Preview Block */}
          {selectedPlan && (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-3.5 flex items-center justify-between text-xs">
              <span className="text-slate-500">Đơn giá trị tương ứng:</span>
              <strong className="text-sm font-extrabold text-blue-900">{getPricePreview()}</strong>
            </div>
          )}

          {/* Admin User Section Header */}
          <div className="border-t border-slate-100 pt-4">
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Tài Khoản Admin Khởi Tạo</h5>
            
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Email Đăng Ký Admin *</label>
                <input
                  type="email"
                  required
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="admin@manto-corp.com"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm transition focus:border-blue-500 focus:bg-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Họ *</label>
                  <input
                    type="text"
                    required
                    value={adminLastName}
                    onChange={(e) => setAdminLastName(e.target.value)}
                    placeholder="Nguyễn"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm transition focus:border-blue-500 focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Tên *</label>
                  <input
                    type="text"
                    required
                    value={adminFirstName}
                    onChange={(e) => setAdminFirstName(e.target.value)}
                    placeholder="Văn A"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm transition focus:border-blue-500 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-gradient-to-r from-blue-700 to-blue-500 px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-500/20 hover:from-blue-600 hover:to-blue-400 transition flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Đang Kích Hoạt...
                </>
              ) : (
                'Kích Hoạt Gói'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
