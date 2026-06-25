import { useEffect, useState } from 'react';
import {
  getOrganizationById,
  getOrgUsers,
  getOrgSubscriptionHistory
} from '../api';
import type {
  OrganizationDto,
  OrgUserDto,
  SubscriptionHistoryDto
} from '../types';
import ActivateSubscriptionModal from './ActivateSubscriptionModal';
import RenewModal from './RenewModal';
import { X, Users, History, Briefcase, Mail, Phone, Calendar, ArrowRight } from 'lucide-react';

interface OrgDetailDrawerProps {
  orgId: number;
  onClose: () => void;
  onRefresh: () => void;
}

export default function OrgDetailDrawer({ orgId, onClose, onRefresh }: OrgDetailDrawerProps) {
  const [org, setOrg] = useState<OrganizationDto | null>(null);
  const [users, setUsers] = useState<OrgUserDto[]>([]);
  const [history, setHistory] = useState<SubscriptionHistoryDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [activeTab, setActiveTab] = useState<'users' | 'history'>('users');
  
  // Modal controllers
  const [showActivateModal, setShowActivateModal] = useState(false);
  const [showRenewModal, setShowRenewModal] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const [orgData, usersData, historyData] = await Promise.all([
        getOrganizationById(orgId),
        getOrgUsers(orgId),
        getOrgSubscriptionHistory(orgId)
      ]);
      setOrg(orgData);
      setUsers(usersData);
      setHistory(historyData);
    } catch (err: any) {
      setError(err.message || 'Không thể tải chi tiết tổ chức.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [orgId]);

  const handleActionSuccess = () => {
    setShowActivateModal(false);
    setShowRenewModal(false);
    loadData();
    onRefresh();
  };

  if (loading) {
    return (
      <div className="fixed inset-y-0 right-0 z-40 w-full max-w-2xl bg-white border-l border-slate-200 shadow-2xl flex items-center justify-center p-6 transition-all duration-300">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          <span className="mt-2 block text-xs text-slate-400">Đang tải chi tiết tổ chức...</span>
        </div>
      </div>
    );
  }

  if (error || !org) {
    return (
      <div className="fixed inset-y-0 right-0 z-40 w-full max-w-2xl bg-white border-l border-slate-200 shadow-2xl p-6 transition-all duration-300 flex flex-col justify-between">
        <div className="rounded-xl bg-rose-50 border border-rose-200 p-4 text-sm text-rose-800">
          {error || 'Không tìm thấy thông tin tổ chức.'}
        </div>
        <button onClick={onClose} className="w-full rounded-xl bg-slate-100 py-3 text-slate-700 font-semibold hover:bg-slate-200 transition">
          Đóng
        </button>
      </div>
    );
  }

  const sub = org.activeSubscription;

  return (
    <div className="fixed inset-0 z-40 overflow-hidden">
      {/* Black backdrop overlay */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer Container Panel */}
      <div className="absolute inset-y-0 right-0 flex max-w-full pl-10">
        <div className="w-screen max-w-2xl transform bg-white shadow-2xl transition-all animate-in slide-in-from-right duration-350">
          
          <div className="h-full flex flex-col overflow-y-auto">
            {/* Drawer Header Block */}
            <div className="border-b border-slate-100 bg-slate-50/50 p-6 relative">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 rounded-full bg-slate-200/50 p-1.5 text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition"
              >
                <X size={18} />
              </button>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                    org.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                  }`}>
                    {org.status}
                  </span>
                  <p className="text-xs text-slate-400 font-mono">ID: {org.id}</p>
                </div>
                <h3 className="text-xl font-bold text-slate-800 leading-tight">{org.name}</h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">slug: {org.slug}</p>
              </div>

              {/* Organization Contact Meta Grid */}
              <div className="mt-4 grid grid-cols-2 gap-4 text-xs text-slate-500 border-t border-slate-200/60 pt-4">
                <div className="flex items-center gap-1.5">
                  <Mail size={14} className="text-slate-400" />
                  <span className="truncate" title={org.contactEmail}>{org.contactEmail}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Phone size={14} className="text-slate-400" />
                  <span>{org.phone || 'Chưa cung cấp số ĐT'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar size={14} className="text-slate-400" />
                  <span>Tạo lúc: {new Date(org.createdAt).toLocaleDateString('vi-VN')}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Users size={14} className="text-slate-400" />
                  <span>Thành viên: <strong className="text-slate-700">{org.userCount}</strong></span>
                </div>
              </div>
            </div>

            {/* Active Plan Context Block */}
            <div className="mx-6 my-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 p-4.5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-blue-500">Gói Đăng Ký Đang Hoạt Động</p>
                  {sub ? (
                    <div className="mt-1">
                      <h4 className="text-lg font-extrabold text-blue-900">{sub.planName}</h4>
                      <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                        Chu kỳ: <strong className="uppercase">{sub.billingCycle}</strong> (Hết hạn: {new Date(sub.endDate).toLocaleDateString('vi-VN')})
                      </p>
                      <p className="mt-2 text-xs font-semibold text-indigo-700">
                        {sub.daysRemaining === 0 ? 'Gói dịch vụ đã hết hạn sử dụng.' : `Còn ${sub.daysRemaining} ngày sử dụng.`}
                      </p>
                    </div>
                  ) : (
                    <div className="mt-2">
                      <h4 className="text-sm font-semibold text-slate-500">Doanh nghiệp chưa kích hoạt gói sử dụng</h4>
                      <p className="text-[11px] text-slate-400">Vui lòng kích hoạt gói đầu tiên để cung cấp quyền quản trị.</p>
                    </div>
                  )}
                </div>

                {/* Sub Action Buttons */}
                <div className="flex-shrink-0">
                  {sub ? (
                    <button
                      onClick={() => setShowRenewModal(true)}
                      className="rounded-xl bg-blue-700 px-4 py-2 text-xs font-bold text-white hover:bg-blue-800 transition"
                    >
                      Gia Hạn
                    </button>
                  ) : (
                    <button
                      onClick={() => setShowActivateModal(true)}
                      className="rounded-xl bg-blue-700 px-4 py-2 text-xs font-bold text-white hover:bg-blue-800 transition"
                    >
                      Kích Hoạt Gói
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="border-b border-slate-100 px-6">
              <div className="flex gap-6">
                <button
                  onClick={() => setActiveTab('users')}
                  className={`flex items-center gap-2 border-b-2 pb-3 pt-2 text-sm font-semibold transition ${
                    activeTab === 'users' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <Users size={16} />
                  <span>Thành Viên ({users.length})</span>
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  className={`flex items-center gap-2 border-b-2 pb-3 pt-2 text-sm font-semibold transition ${
                    activeTab === 'history' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <History size={16} />
                  <span>Lịch Sử Gói ({history.length})</span>
                </button>
              </div>
            </div>

            {/* Drawer Tab Contents */}
            <div className="flex-1 p-6">
              {activeTab === 'users' ? (
                /* Tab 1: Users table */
                users.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 text-sm">Tổ chức chưa có thành viên nào.</div>
                ) : (
                  <div className="overflow-hidden rounded-xl border border-slate-100 bg-white">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-50 font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100">
                          <th className="px-4 py-3">Họ Tên / Email</th>
                          <th className="px-4 py-3">Roles</th>
                          <th className="px-4 py-3">Hoạt Động</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {users.map((u) => (
                          <tr key={u.id} className="hover:bg-slate-50/50">
                            <td className="px-4 py-3">
                              <p className="font-bold text-slate-800">{u.fullName}</p>
                              <p className="text-[10px] text-slate-400 mt-0.5">{u.email}</p>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex flex-wrap gap-1">
                                {u.roles.map((r, i) => (
                                  <span key={i} className="rounded bg-blue-50 px-1.5 py-0.5 text-[9px] font-bold text-blue-600 uppercase">
                                    {r}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                                u.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                              }`}>
                                {u.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )
              ) : (
                /* Tab 2: Subscription history */
                history.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 text-sm">Chưa có lịch sử gia hạn/kích hoạt gói.</div>
                ) : (
                  <div className="space-y-4">
                    {history.map((h) => (
                      <div key={h.id} className="relative rounded-2xl border border-slate-150 p-4 hover:bg-slate-50/50 transition">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className={`text-[10px] font-bold uppercase tracking-wider ${
                              h.status === 'Active' ? 'text-emerald-500' : 'text-slate-400'
                            }`}>{h.status}</span>
                            <h5 className="font-bold text-slate-800 mt-0.5">{h.planName}</h5>
                          </div>
                          <span className="rounded-xl border border-slate-100 bg-slate-50 px-2 py-1 text-[10px] font-bold text-slate-600 uppercase">
                            {h.billingCycle}
                          </span>
                        </div>
                        <div className="mt-3 flex items-center justify-between text-xs text-slate-400 border-t border-slate-100/60 pt-3">
                          <span>Từ: {new Date(h.startDate).toLocaleDateString('vi-VN')}</span>
                          <ArrowRight size={12} />
                          <span>Đến: {new Date(h.endDate).toLocaleDateString('vi-VN')}</span>
                          <span className="h-1 w-1 rounded-full bg-slate-300" />
                          <span className="text-slate-500 font-semibold">Đã dùng: {h.daysActive} ngày</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sub Modals */}
      {showActivateModal && (
        <ActivateSubscriptionModal
          orgId={orgId}
          orgName={org.name}
          onClose={() => setShowActivateModal(false)}
          onSuccess={handleActionSuccess}
        />
      )}

      {showRenewModal && (
        <RenewModal
          orgId={orgId}
          orgName={org.name}
          activePlanId={sub?.id || 0}
          currentEndDate={sub?.endDate || ''}
          daysRemaining={sub?.daysRemaining || 0}
          onClose={() => setShowRenewModal(false)}
          onSuccess={handleActionSuccess}
        />
      )}
    </div>
  );
}
