import { useState, useEffect } from 'react';
import { createPlan, updatePlan } from '../api';
import type { SubscriptionPlanDto, CreateSubscriptionPlanDto } from '../types';
import { X, Sparkles, AlertCircle } from 'lucide-react';

interface PlanFormModalProps {
  plan?: SubscriptionPlanDto; // If provided, we are editing. Otherwise creating.
  onClose: () => void;
  onSuccess: () => void;
}

const defaultFormData: CreateSubscriptionPlanDto = {
  name: '',
  description: '',
  priceMonthly: 0,
  priceYearly: 0,
  maxUsers: 10,
  maxDepartments: 2,
  maxTeams: 5,
  allowAiFeatures: false,
  allowExport: false,
  allowCustomSurvey: false,
  allowBulkImport: false,
  allowKpi: false,
  allowAdvancedReports: false,
  allowBurnoutDetection: false,
  allowGoogleCalendar: false
};

export default function PlanFormModal({ plan, onClose, onSuccess }: PlanFormModalProps) {
  const isEdit = !!plan;
  const [formData, setFormData] = useState<CreateSubscriptionPlanDto>(defaultFormData);
  const [isActive, setIsActive] = useState(true);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (plan) {
      setFormData({
        name: plan.name,
        description: plan.description || '',
        priceMonthly: plan.priceMonthly,
        priceYearly: plan.priceYearly,
        maxUsers: plan.maxUsers,
        maxDepartments: plan.maxDepartments,
        maxTeams: plan.maxTeams,
        allowAiFeatures: plan.allowAiFeatures,
        allowExport: plan.allowExport,
        allowCustomSurvey: plan.allowCustomSurvey,
        allowBulkImport: plan.allowBulkImport,
        allowKpi: plan.allowKpi,
        allowAdvancedReports: plan.allowAdvancedReports,
        allowBurnoutDetection: plan.allowBurnoutDetection,
        allowGoogleCalendar: plan.allowGoogleCalendar
      });
      setIsActive(plan.isActive);
    }
  }, [plan]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      const parsedVal = type === 'number' ? Number(value) : value;
      setFormData((prev) => ({ ...prev, [name]: parsedVal }));
    }
  };

  const handleCheckboxChange = (name: keyof CreateSubscriptionPlanDto, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('Vui lòng nhập tên gói.');
      return;
    }

    try {
      setIsSubmitting(true);
      if (isEdit && plan) {
        await updatePlan(plan.id, {
          ...formData,
          isActive
        });
      } else {
        await createPlan(formData);
      }
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Lỗi khi lưu thông tin gói dịch vụ.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl transition-all animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-6 py-4">
          <div className="flex items-center gap-2">
            <Sparkles className="text-blue-600" size={20} />
            <h3 className="text-lg font-bold text-slate-800">
              {isEdit ? `Chỉnh Sửa Gói: ${plan?.name}` : 'Tạo Gói Dịch Vụ Mới'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="flex gap-2 rounded-xl bg-rose-50 border border-rose-200 p-3.5 text-xs font-semibold text-rose-800">
              <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Form Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Tên Gói *</label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="Ví dụ: Pro, Elite, Enterprise"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm transition focus:border-blue-500 focus:bg-white focus:outline-none"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Mô Tả</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Nhập mô tả các đặc quyền của gói..."
                rows={2}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm transition focus:border-blue-500 focus:bg-white focus:outline-none resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Giá Hàng Tháng (VND) *</label>
              <input
                type="number"
                name="priceMonthly"
                required
                min={0}
                value={formData.priceMonthly}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm transition focus:border-blue-500 focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Giá Hàng Năm (VND) *</label>
              <input
                type="number"
                name="priceYearly"
                required
                min={0}
                value={formData.priceYearly}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm transition focus:border-blue-500 focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Số Lượng User Tối Đa *</label>
              <input
                type="number"
                name="maxUsers"
                required
                min={1}
                value={formData.maxUsers}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm transition focus:border-blue-500 focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Số Lượng Phòng Ban Tối Đa *</label>
              <input
                type="number"
                name="maxDepartments"
                required
                min={1}
                value={formData.maxDepartments}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm transition focus:border-blue-500 focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Số Lượng Team Tối Đa *</label>
              <input
                type="number"
                name="maxTeams"
                required
                min={1}
                value={formData.maxTeams}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm transition focus:border-blue-500 focus:bg-white focus:outline-none"
              />
            </div>

            {isEdit && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Trạng Thái Kích Hoạt</label>
                <div className="flex items-center h-10">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="isActive" className="ml-2 text-sm font-semibold text-slate-700">Gói đang hoạt động</label>
                </div>
              </div>
            )}
          </div>

          {/* Feature Flags Checklist Block */}
          <div className="border-t border-slate-100 pt-4">
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Tính Năng & Quyền Hạn</h5>
            
            <div className="grid grid-cols-2 gap-3.5">
              {[
                { key: 'allowAiFeatures', label: 'Tính năng AI (Gemini Report)' },
                { key: 'allowExport', label: 'Xuất báo cáo Excel' },
                { key: 'allowCustomSurvey', label: 'Khảo sát tùy chỉnh (HR Custom Survey)' },
                { key: 'allowBulkImport', label: 'Import User/Task hàng loạt' },
                { key: 'allowKpi', label: 'Báo cáo hiệu suất KPI' },
                { key: 'allowAdvancedReports', label: 'Báo cáo phân tích chuyên sâu' },
                { key: 'allowBurnoutDetection', label: 'Phát hiện rủi ro quá tải (Burnout)' },
                { key: 'allowGoogleCalendar', label: 'Đồng bộ Google Calendar' }
              ].map((flag) => {
                const isChecked = formData[flag.key as keyof CreateSubscriptionPlanDto] as boolean;
                return (
                  <label
                    key={flag.key}
                    className={`flex items-center gap-3 rounded-2xl border p-3 cursor-pointer transition ${
                      isChecked 
                        ? 'border-blue-200 bg-blue-50/30 text-blue-900 font-semibold' 
                        : 'border-slate-150 bg-white text-slate-650 hover:bg-slate-50/50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => handleCheckboxChange(flag.key as keyof CreateSubscriptionPlanDto, e.target.checked)}
                      className="h-4.5 w-4.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-xs">{flag.label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Footer Actions */}
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
                  Đang lưu...
                </>
              ) : (
                isEdit ? 'Lưu Thay Đổi' : 'Tạo Gói Mới'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
