import { useEffect, useState } from 'react';
import { getSuperPlans, updatePlan } from '../api';
import type { SubscriptionPlanDto } from '../types';
import PlanFormModal from '../components/PlanFormModal';
import {
  Plus,
  Edit2,
  Users,
  CheckCircle,
  XCircle,
  HelpCircle
} from 'lucide-react';

export default function PlansManagementPage() {
  const [plans, setPlans] = useState<SubscriptionPlanDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal control
  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlanDto | undefined>(undefined);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const data = await getSuperPlans();
      setPlans(data);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Không thể tải danh sách gói dịch vụ.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleActiveToggle = async (plan: SubscriptionPlanDto) => {
    const newActiveState = !plan.isActive;
    
    // Warning prompt before disabling active plans
    if (!newActiveState) {
      const confirmMessage = `Cảnh báo: Tắt hoạt động gói "${plan.name}" sẽ ngăn chặn việc đăng ký/gia hạn mới gói này. Bạn có chắc chắn muốn ngắt kích hoạt?`;
      if (!window.confirm(confirmMessage)) return;
    }

    try {
      await updatePlan(plan.id, { isActive: newActiveState });
      fetchPlans();
    } catch (err: any) {
      alert(err.message || 'Lỗi cập nhật trạng thái hoạt động gói.');
    }
  };

  const handleEditClick = (plan: SubscriptionPlanDto) => {
    setEditingPlan(plan);
    setShowModal(true);
  };

  const handleCreateClick = () => {
    setEditingPlan(undefined);
    setShowModal(true);
  };

  const handleModalSuccess = () => {
    setShowModal(false);
    setEditingPlan(undefined);
    fetchPlans();
  };

  const formatCurrency = (val: number) => {
    return `${val.toLocaleString('vi-VN')}đ`;
  };

  const renderFeatureBadge = (label: string, allowed: boolean) => {
    return (
      <span
        title={label}
        className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-bold ${
          allowed 
            ? 'bg-emerald-50 text-emerald-700 border border-emerald-250' 
            : 'bg-slate-100 text-slate-450 border border-slate-200'
        }`}
      >
        {allowed ? <CheckCircle size={10} /> : <XCircle size={10} />}
        <span>{label}</span>
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top action header */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-slate-500">Cấu hình biểu giá và tính năng mở khóa tương ứng của gói subscription.</p>
        <button
          onClick={handleCreateClick}
          className="flex items-center gap-2 rounded-xl bg-cyan-400 px-5 py-2.5 text-sm font-bold text-slate-950 shadow-sm hover:bg-cyan-300 transition duration-150 active:scale-[0.98]"
        >
          <Plus size={18} />
          <span>Tạo Gói Mới</span>
        </button>
      </div>

      {error && (
        <div className="rounded-xl bg-rose-50 border border-rose-200 p-4 text-sm text-rose-800">
          {error}
        </div>
      )}

      {/* Grid view of Plans */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <div className="col-span-full py-16 text-center text-slate-400">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent" />
            <span className="mt-2 block text-xs">Đang tải danh sách gói...</span>
          </div>
        ) : plans.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-400 text-sm">
            Chưa có gói dịch vụ nào được cấu hình trong hệ thống.
          </div>
        ) : (
          plans.map((p) => (
            <div
              key={p.id}
              className={`rounded-xl border border-slate-200 bg-white p-6 shadow-sm relative transition hover:shadow-md ${
                !p.isActive ? 'opacity-60 border-dashed bg-slate-50/50' : ''
              }`}
            >
              {/* Card top details */}
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
                    {p.name}
                    {!p.isActive && (
                      <span className="rounded bg-rose-100 px-1.5 py-0.5 text-[9px] font-bold text-rose-700 uppercase">
                        Inactive
                      </span>
                    )}
                  </h4>
                  <p className="mt-1 text-xs text-slate-400 min-h-[32px] line-clamp-2">{p.description || 'Không có mô tả.'}</p>
                </div>
                
                {/* Active switch check */}
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleActiveToggle(p)}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-1 focus:ring-cyan-400/30 ${
                      p.isActive ? 'bg-cyan-500' : 'bg-slate-200'
                    }`}
                    title={p.isActive ? 'Tạm ngưng gói' : 'Kích hoạt gói'}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        p.isActive ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                  
                  <button
                    onClick={() => handleEditClick(p)}
                    className="rounded-lg border border-slate-200 p-2 text-slate-400 hover:text-cyan-600 hover:bg-cyan-50/50 hover:border-cyan-200 transition-all active:scale-[0.97]"
                    title="Chỉnh sửa gói"
                  >
                    <Edit2 size={13} />
                  </button>
                </div>
              </div>

              {/* Price details grid */}
              <div className="mt-4 grid grid-cols-2 gap-4 border-t border-slate-100 pt-4 text-xs">
                <div>
                  <span className="text-slate-400 block mb-0.5">Giá theo tháng</span>
                  <strong className="text-sm font-extrabold text-slate-700">{formatCurrency(p.priceMonthly)}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Giá theo năm</span>
                  <strong className="text-sm font-extrabold text-slate-700">{formatCurrency(p.priceYearly)}</strong>
                </div>
              </div>

              {/* Threshold limits */}
              <div className="mt-4 space-y-2 border-t border-slate-100 pt-4 text-xs text-slate-555">
                <div className="flex justify-between items-center">
                  <span>Giới hạn User:</span>
                  <strong className="text-slate-800">{p.maxUsers} users</strong>
                </div>
                <div className="flex justify-between items-center">
                  <span>Giới hạn Phòng ban:</span>
                  <strong className="text-slate-800">{p.maxDepartments} depts</strong>
                </div>
                <div className="flex justify-between items-center">
                  <span>Giới hạn Team:</span>
                  <strong className="text-slate-800">{p.maxTeams} teams</strong>
                </div>
              </div>

              {/* Feature flags chips panel */}
              <div className="mt-5 border-t border-slate-100 pt-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">Đặc quyền tính năng</span>
                <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto">
                  {renderFeatureBadge('AI Insights', p.allowAiFeatures)}
                  {renderFeatureBadge('Excel Export', p.allowExport)}
                  {renderFeatureBadge('Custom Survey', p.allowCustomSurvey)}
                  {renderFeatureBadge('Bulk Import', p.allowBulkImport)}
                  {renderFeatureBadge('KPI Report', p.allowKpi)}
                  {renderFeatureBadge('Advanced Analy.', p.allowAdvancedReports)}
                  {renderFeatureBadge('Burnout Risk', p.allowBurnoutDetection)}
                  {renderFeatureBadge('Calendar Sync', p.allowGoogleCalendar)}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create / Edit Plan Modal */}
      {showModal && (
        <PlanFormModal
          plan={editingPlan}
          onClose={() => { setShowModal(false); setEditingPlan(undefined); }}
          onSuccess={handleModalSuccess}
        />
      )}
    </div>
  );
}
