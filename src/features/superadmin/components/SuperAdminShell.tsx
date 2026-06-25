import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import SuperAdminSidebar from './SuperAdminSidebar';
import { ChevronDown, Menu, Shield, LogOut, Grid } from 'lucide-react';
import UpgradeModal from './UpgradeModal';

interface SuperAdminShellProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function SuperAdminShell({
  title,
  subtitle,
  children,
  activeTab,
  onTabChange
}: SuperAdminShellProps) {
  const { logout, user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onDocumentClick = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocumentClick);
    return () => document.removeEventListener('mousedown', onDocumentClick);
  }, []);

  const handleLogout = () => {
    logout();
    window.location.hash = '#/';
  };

  const userInitials = user?.email ? user.email.slice(0, 2).toUpperCase() : 'SA';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 flex" style={{ fontFamily: "'Barlow', sans-serif" }}>
      <SuperAdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeTab={activeTab}
        onTabChange={onTabChange}
      />

      <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'md:ml-64' : ''}`}>
        <header className="border-b border-slate-200 bg-white sticky top-0 z-30">
          <div className="px-6 py-4 flex items-center justify-between">
            {/* Left Header content */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="rounded-lg p-2 transition hover:bg-slate-100 md:hidden"
              >
                <Menu size={20} />
              </button>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  {title}
                </h2>
                {subtitle && (
                  <p className="text-sm text-slate-500">{subtitle}</p>
                )}
              </div>
            </div>

            {/* Profile Menu Actions */}
            <div className="flex items-center gap-3" ref={profileRef}>
              <div className="relative">
                <button
                  type="button"
                  className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 transition hover:bg-slate-100"
                  onClick={() => setProfileOpen((v) => !v)}
                >
                  <div className="hidden text-right sm:block">
                    <p className="text-base font-semibold leading-tight text-blue-900">Platform SuperAdmin</p>
                    <p className="text-sm text-slate-500 leading-tight">SYSTEM ADMIN</p>
                  </div>
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 border border-slate-800 text-sm font-bold text-cyan-400 shadow-sm">
                    {userInitials}
                  </div>
                  <ChevronDown size={16} className={`text-slate-400 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 z-50 mt-3 w-80 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_20px_45px_rgba(15,23,42,0.16)]">
                    {/* Profile Card */}
                    <div className="border-b border-slate-200 bg-slate-50 px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 border border-slate-850 text-base font-bold text-cyan-400">
                          <span>{userInitials}</span>
                        </div>
                        <div>
                          <p className="text-2xl font-semibold leading-tight text-blue-900">
                            Platform SuperAdmin
                          </p>
                          <p className="text-sm text-slate-600">
                            {user?.email || 'admin@manto.com'}
                          </p>
                        </div>
                      </div>
                      <div className="mt-3 inline-flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700">
                        <Shield size={14} />
                        Current Role: SuperAdmin
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="px-3 py-2">
                      <button
                        type="button"
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-slate-700 transition hover:bg-slate-100"
                        onClick={() => {
                          onTabChange('dashboard');
                          setProfileOpen(false);
                        }}
                      >
                        <Grid size={16} />
                        <span className="font-medium">Dashboard</span>
                      </button>
                    </div>

                    {/* Logout */}
                    <div className="border-t border-slate-200 px-3 py-2">
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left font-semibold text-rose-600 transition hover:bg-rose-50"
                      >
                        <LogOut size={16} />
                        Đăng Xuất
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <div className="p-6">
          {children}
        </div>
      </main>

      {/* Global Upgrade Feature Gate modal */}
      <UpgradeModal />
    </div>
  );
}
