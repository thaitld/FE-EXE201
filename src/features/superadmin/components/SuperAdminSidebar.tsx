import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getSuperAdminStats } from '../api';
import {
  Grid,
  Users,
  Briefcase,
  ShoppingCart,
  TrendingUp,
  CreditCard,
  X
} from 'lucide-react';

interface SuperAdminSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function SuperAdminSidebar({
  isOpen = true,
  onClose = () => {},
  activeTab,
  onTabChange
}: SuperAdminSidebarProps) {
  const { user } = useAuth();
  const [pendingOrders, setPendingOrders] = useState(0);
  const [expiringOrgs, setExpiringOrgs] = useState(0);

  useEffect(() => {
    // Load stats immediately and then poll every 60s
    const fetchCounts = async () => {
      try {
        const stats = await getSuperAdminStats();
        setPendingOrders(stats.pendingOrders || 0);
        setExpiringOrgs(stats.expiringIn30Days || 0);
      } catch (err) {
        console.warn('Failed to load sidebar indicator counts:', err);
      }
    };
    fetchCounts();
    const interval = setInterval(fetchCounts, 60000);
    return () => clearInterval(interval);
  }, []);

  const sidebarClass = `fixed left-0 top-0 h-screen w-64 bg-white border-r border-slate-100 z-40 transition-all duration-350 ease-in-out md:translate-x-0 ${
    !isOpen ? '-translate-x-full' : ''
  }`;

  const navItemClass =
    'w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition duration-200 text-slate-500 hover:bg-slate-50 hover:text-slate-800 text-[13.5px] font-medium text-left';
  const activeNavItemClass =
    'bg-blue-50/50 text-blue-700 font-semibold';

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/40 z-30 md:hidden backdrop-blur-sm transition-opacity" onClick={onClose} />
      )}

      <aside className={sidebarClass}>
        <div className="h-full flex flex-col overflow-y-auto">
          {/* Logo Section */}
          <div className="p-6 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <img
                  src="/manto.png"
                  className="h-24 w-auto object-contain transition-transform duration-300 hover:scale-102"
                  alt="MANTO"
                  loading="lazy"
                />
              </div>
              <button onClick={onClose} className="md:hidden p-1.5 hover:bg-slate-50 rounded-lg text-slate-500">
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            <button
              type="button"
              onClick={() => onTabChange('dashboard')}
              className={`${navItemClass} ${activeTab === 'dashboard' ? activeNavItemClass : ''}`}
            >
              <Grid size={18} />
              <span className="text-sm font-semibold">Dashboard</span>
            </button>

            <button
              type="button"
              onClick={() => onTabChange('organizations')}
              className={`${navItemClass} ${activeTab === 'organizations' ? activeNavItemClass : ''}`}
            >
              <Users size={18} />
              <span className="text-sm font-semibold">Tổ Chức</span>
              {expiringOrgs > 0 && (
                <span className="ml-auto flex h-5 min-w-[20px] items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-bold text-white">
                  {expiringOrgs}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => onTabChange('plans')}
              className={`${navItemClass} ${activeTab === 'plans' ? activeNavItemClass : ''}`}
            >
              <Briefcase size={18} />
              <span className="text-sm font-semibold">Gói Dịch Vụ</span>
            </button>

            <button
              type="button"
              onClick={() => onTabChange('orders')}
              className={`${navItemClass} ${activeTab === 'orders' ? activeNavItemClass : ''}`}
            >
              <ShoppingCart size={18} />
              <span className="text-sm font-semibold">Đơn Hàng</span>
              {pendingOrders > 0 && (
                <span className="ml-auto flex h-5 min-w-[20px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white animate-pulse">
                  {pendingOrders}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => onTabChange('revenue')}
              className={`${navItemClass} ${activeTab === 'revenue' ? activeNavItemClass : ''}`}
            >
              <TrendingUp size={18} />
              <span className="text-sm font-semibold">Doanh Thu</span>
            </button>

            <button
              type="button"
              onClick={() => onTabChange('payments')}
              className={`${navItemClass} ${activeTab === 'payments' ? activeNavItemClass : ''}`}
            >
              <CreditCard size={18} />
              <span className="text-sm font-semibold">Lịch Sử GD</span>
            </button>
          </nav>

          {/* Footer User Info */}
          <div className="p-4 border-t border-slate-100 bg-slate-50/50 mt-auto">
            <div className="flex items-center gap-3 px-2 py-1.5 rounded-xl border border-slate-100/80 bg-white shadow-sm">
              <div className="w-9 h-9 rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-blue-600 to-indigo-600 shadow-sm shadow-blue-500/10">
                <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold uppercase">
                  {(user?.email?.charAt(0) ?? 'S').toUpperCase()}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-700 truncate">Platform SuperAdmin</p>
                <p className="text-[10px] text-slate-400 truncate mt-0.5">{user?.email || 'superadmin@manto.com'}</p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
