import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import SuperAdminShell from '../components/SuperAdminShell';

// Lazy imports of pages
import DashboardPage from './DashboardPage';
import OrganizationsPage from './OrganizationsPage';
import PlansManagementPage from './PlansManagementPage';
import OrdersPage from './OrdersPage';
import RevenuePage from './RevenuePage';
import PaymentHistoryPage from './PaymentHistoryPage';

interface SuperAdminTabItem {
  id: string;
  label: string;
  description: string;
}

const tabs: SuperAdminTabItem[] = [
  { id: 'dashboard', label: 'Platform Dashboard', description: 'Tổng quan tình hình sử dụng, doanh thu và đơn hàng.' },
  { id: 'organizations', label: 'Quản Lý Tổ Chức', description: 'Danh sách doanh nghiệp, người dùng và kích hoạt/gia hạn gói.' },
  { id: 'plans', label: 'Quản Lý Gói Dịch Vụ', description: 'Thiết lập hạn mức và các tính năng mở khóa cho từng gói subscription.' },
  { id: 'orders', label: 'Quản Lý Đơn Hàng', description: 'Xử lý đơn thanh toán, thực hiện fulfill thủ công và tải hóa đơn.' },
  { id: 'revenue', label: 'Thống Kê Doanh Thu', description: 'Biểu đồ chi tiết doanh thu theo tháng và phân bổ theo gói.' },
  { id: 'payments', label: 'Lịch Sử Giao Dịch', description: 'Logs chi tiết tất cả giao dịch thanh toán qua cổng.' }
];

const routeByTab: Record<string, string> = {
  dashboard: '#/super/dashboard',
  organizations: '#/super/organizations',
  plans: '#/super/plans',
  orders: '#/super/orders',
  revenue: '#/super/revenue',
  payments: '#/super/payments'
};

function getTabFromHash(hash: string) {
  const parts = hash.replace(/^#\/?/, '').split('/').filter(Boolean);
  const candidate = parts[1] || 'dashboard';
  return tabs.some((tab) => tab.id === candidate) ? candidate : 'dashboard';
}

export default function SuperAdminWorkspace() {
  const { user, isAuthenticated, refreshUser, role: authRole } = useAuth();
  const [activeTab, setActiveTab] = useState(() => getTabFromHash(window.location.hash || '#/super'));

  const allowed = useMemo(() => {
    const rawRole = authRole || user?.roleName || user?.role;
    if (!rawRole) return false;
    if (Array.isArray(rawRole)) {
      return rawRole.some((x) => typeof x === 'string' && x.toUpperCase() === 'SUPERADMIN');
    }
    return typeof rawRole === 'string' && rawRole.toUpperCase() === 'SUPERADMIN';
  }, [user, authRole]);

  useEffect(() => {
    if (!isAuthenticated) {
      window.location.hash = '#/login';
      return;
    }

    if (isAuthenticated && !user) {
      (async () => {
        try {
          await refreshUser();
        } catch {
          // ignore
        }
      })();
      return;
    }

    if (!allowed) {
      window.location.hash = '#/';
      return;
    }

    const sync = () => {
      const nextTab = getTabFromHash(window.location.hash || '#/super');
      setActiveTab(nextTab);
    };

    sync();
    window.addEventListener('hashchange', sync);
    return () => window.removeEventListener('hashchange', sync);
  }, [allowed, isAuthenticated, user]);

  useEffect(() => {
    const expectedHash = routeByTab[activeTab];
    if (expectedHash && window.location.hash !== expectedHash) {
      window.location.hash = expectedHash;
    }
  }, [activeTab]);

  const activeTabMeta = tabs.find((t) => t.id === activeTab) || tabs[0];

  const content = (() => {
    switch (activeTab) {
      case 'organizations':
        return <OrganizationsPage />;
      case 'plans':
        return <PlansManagementPage />;
      case 'orders':
        return <OrdersPage />;
      case 'revenue':
        return <RevenuePage />;
      case 'payments':
        return <PaymentHistoryPage />;
      default:
        return <DashboardPage />;
    }
  })();

  return (
    <SuperAdminShell
      title={activeTabMeta.label}
      subtitle={activeTabMeta.description}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      {content}
    </SuperAdminShell>
  );
}
