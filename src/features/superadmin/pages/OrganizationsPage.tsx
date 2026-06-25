import { useEffect, useState, useRef } from 'react';
import { searchOrganizations, updateOrganizationStatus } from '../api';
import type { OrganizationDto } from '../types';
import CreateOrganizationModal from '../components/CreateOrganizationModal';
import OrgDetailDrawer from '../components/OrgDetailDrawer';
import {
  Search,
  Filter,
  Plus,
  Lock,
  Unlock,
  Shield,
  Key,
  Calendar,
  Layers,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';

export default function OrganizationsPage() {
  const [organizations, setOrganizations] = useState<OrganizationDto[]>([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Pagination State
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Modals / Drawer Control
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedOrgId, setSelectedOrgId] = useState<number | null>(null);

  // Debouncing Search
  const searchTimeoutRef = useRef<number | null>(null);

  const fetchOrgs = async (searchVal: string, statusVal: string, pageNum: number = 1) => {
    try {
      setLoading(true);
      const data = await searchOrganizations(searchVal, statusVal, pageNum, pageSize);
      setOrganizations(data.items || []);
      setTotalPages(data.totalPages || 1);
      setTotalCount(data.totalCount || 0);
      setPage(data.pageNumber || 1);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Không thể tải danh sách tổ chức');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrgs('', '', 1);
  }, []);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    fetchOrgs(search, status, newPage);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearch(val);

    if (searchTimeoutRef.current) {
      window.clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = window.setTimeout(() => {
      fetchOrgs(val, status, 1);
    }, 300);
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setStatus(val);
    fetchOrgs(search, val, 1);
  };

  const toggleOrgStatus = async (org: OrganizationDto, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent drawer trigger
    const newStatus = org.status === 'Suspended' ? 'Active' : 'Suspended';
    const message = org.status === 'Suspended' 
      ? `Bạn có chắc chắn muốn mở khóa cho tổ chức "${org.name}"?`
      : `Bạn có chắc chắn muốn KHÓA tổ chức "${org.name}"? Quá trình đăng nhập của quản trị viên và nhân viên thuộc tổ chức này sẽ bị chặn.`;

    if (!window.confirm(message)) return;

    try {
      await updateOrganizationStatus(org.id, newStatus);
      fetchOrgs(search, status, page);
    } catch (err: any) {
      alert(err.message || 'Lỗi cập nhật trạng thái tổ chức');
    }
  };

  const handleCreateSuccess = () => {
    setShowCreateModal(false);
    fetchOrgs(search, status, 1);
  };

  return (
    <div className="space-y-6">
      {/* Search & Filter Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        
        {/* Left Controls */}
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              value={search}
              onChange={handleSearchChange}
              placeholder="Tìm theo tên, slug, email..."
              className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-sm transition focus:border-cyan-400/80 focus:outline-none focus:ring-1 focus:ring-cyan-400/10"
            />
          </div>

          {/* Status Dropdown */}
          <div className="relative w-full sm:w-48">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
            <select
              value={status}
              onChange={handleStatusChange}
              className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-8 py-2.5 text-sm appearance-none focus:border-cyan-400/80 focus:outline-none"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="Active">Hoạt động</option>
              <option value="Suspended">Đang bị Khóa</option>
              <option value="Cancelled">Đã Hủy</option>
            </select>
          </div>
        </div>

        {/* Right Actions */}
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center justify-center gap-2 rounded-xl bg-cyan-400 px-5 py-2.5 text-sm font-bold text-slate-950 shadow-sm hover:bg-cyan-300 transition duration-150 active:scale-[0.98]"
        >
          <Plus size={18} />
          <span>Tạo Tổ Chức</span>
        </button>
      </div>

      {error && (
        <div className="rounded-xl bg-rose-50 border border-rose-200 p-4 text-sm text-rose-800">
          {error}
        </div>
      )}

      {/* Organizations Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-[700px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/70 text-xs font-bold uppercase tracking-wider text-slate-500">
              <th className="px-6 py-4">ID</th>
              <th className="px-6 py-4">Tên Doanh Nghiệp</th>
              <th className="px-6 py-4">Email Quản Trị</th>
              <th className="px-6 py-4">Trạng Thái</th>
              <th className="px-6 py-4">Gói Đăng Ký</th>
              <th className="px-6 py-4">Ngày Hết Hạn</th>
              <th className="px-6 py-4 text-right">Hành Động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                  <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent" />
                  <span className="mt-2 block text-xs">Đang tải danh sách tổ chức...</span>
                </td>
              </tr>
            ) : organizations.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                  Không tìm thấy tổ chức nào phù hợp.
                </td>
              </tr>
            ) : (
              organizations.map((org) => {
                const sub = org.activeSubscription;
                const isSuspended = org.status === 'Suspended';
                
                // Days remaining badge evaluation
                let daysBadge = null;
                if (!sub) {
                  daysBadge = <span className="rounded-lg bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-500">Chưa có gói</span>;
                } else if (sub.daysRemaining === 0) {
                  daysBadge = <span className="rounded-lg bg-rose-100 px-2 py-1 text-[10px] font-bold text-rose-600">Hết hạn</span>;
                } else if (sub.daysRemaining < 30) {
                  daysBadge = <span className="rounded-lg bg-amber-100 px-2 py-1 text-[10px] font-bold text-amber-600">Sắp hết hạn</span>;
                } else {
                  daysBadge = <span className="rounded-lg bg-emerald-100 px-2 py-1 text-[10px] font-bold text-emerald-600">Hoạt động</span>;
                }

                return (
                  <tr
                    key={org.id}
                    onClick={() => setSelectedOrgId(org.id)}
                    className={`cursor-pointer transition hover:bg-slate-50/50 ${
                      isSuspended ? 'bg-slate-50/40 text-slate-400' : 'text-slate-700'
                    }`}
                  >
                    <td className="px-6 py-4.5 font-semibold text-slate-500">{org.id}</td>
                    <td className="px-6 py-4.5">
                      <div className="flex items-center gap-2">
                        {isSuspended && <Lock size={14} className="text-rose-500 flex-shrink-0" />}
                        <div>
                          <p className="font-bold text-slate-800 leading-tight">{org.name}</p>
                          <p className="text-[11px] text-slate-400 font-mono mt-0.5">{org.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4.5 font-medium">{org.contactEmail}</td>
                    <td className="px-6 py-4.5">
                      {org.status === 'Active' ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">
                          Active
                        </span>
                      ) : org.status === 'Suspended' ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-1 text-xs font-semibold text-rose-700">
                          Suspended
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-500">
                          Cancelled
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4.5">
                      {sub ? (
                        <div>
                          <p className="font-semibold text-slate-800 text-xs">{sub.planName}</p>
                          <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{sub.billingCycle}</p>
                        </div>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4.5">
                      {sub ? (
                        <div>
                          <p className="font-semibold text-xs text-slate-700">
                            {new Date(sub.endDate).toLocaleDateString('vi-VN')}
                          </p>
                          <div className="mt-1">{daysBadge}</div>
                        </div>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Lock / Unlock Toggle Button */}
                        <button
                          type="button"
                          onClick={(e) => toggleOrgStatus(org, e)}
                          title={isSuspended ? 'Mở khóa' : 'Khóa tổ chức'}
                          className={`rounded-xl border p-2 transition ${
                            isSuspended 
                              ? 'border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                              : 'border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100'
                          }`}
                        >
                          {isSuspended ? <Unlock size={15} /> : <Lock size={15} />}
                        </button>

                        <ChevronRight size={18} className="text-slate-300" />
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Control */}
      {!loading && organizations.length > 0 && (
        <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row">
          <p className="text-xs text-slate-500 font-medium">
            Hiển thị <span className="font-bold text-slate-800">{((page - 1) * pageSize) + 1}</span> đến{' '}
            <span className="font-bold text-slate-800">
              {Math.min(page * pageSize, totalCount)}
            </span>{' '}
            trong tổng số <span className="font-bold text-slate-800">{totalCount}</span> tổ chức
          </p>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page <= 1}
              className="rounded-xl border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent"
            >
              <ChevronLeft size={16} />
            </button>

            {/* Render page numbers */}
            {(() => {
              const pages = [];
              const maxVisible = 5;
              
              let start = Math.max(1, page - Math.floor(maxVisible / 2));
              let end = Math.min(totalPages, start + maxVisible - 1);
              
              if (end - start + 1 < maxVisible) {
                start = Math.max(1, end - maxVisible + 1);
              }
              
              for (let i = start; i <= end; i++) {
                pages.push(
                  <button
                    key={i}
                    onClick={() => handlePageChange(i)}
                    className={`h-9 w-9 rounded-xl text-xs font-bold transition-all ${
                      page === i
                        ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                        : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {i}
                  </button>
                );
              }
              
              return pages;
            })()}

            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page >= totalPages}
              className="rounded-xl border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Create Modal Popup */}
      {showCreateModal && (
        <CreateOrganizationModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleCreateSuccess}
        />
      )}

      {/* Slide-in Detail Drawer */}
      {selectedOrgId !== null && (
        <OrgDetailDrawer
          orgId={selectedOrgId}
          onClose={() => setSelectedOrgId(null)}
          onRefresh={() => fetchOrgs(search, status, page)}
        />
      )}
    </div>
  );
}
