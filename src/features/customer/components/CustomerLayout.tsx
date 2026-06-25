import { type ReactNode, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/features/auth/AuthContext';
import UserMenu from '@/features/auth/UserMenu';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { CreditCard, ShoppingBag, LayoutDashboard } from 'lucide-react';

interface CustomerLayoutProps {
  children: ReactNode;
  pageTitle?: string;
}

export default function CustomerLayout({ children, pageTitle }: CustomerLayoutProps) {
  const { t } = useTranslation();
  const { user, userEmail, isAuthenticated } = useAuth();

  const profileName = useMemo(() => {
    if (user?.firstName || user?.lastName) {
      return `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim();
    }
    if (userEmail) {
      const localPart = userEmail.split('@')[0] ?? '';
      return localPart
        .split(/[._-]/)
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
    }
    return 'Customer User';
  }, [user, userEmail]);

  return (
    <div
      className="min-h-screen bg-slate-900 text-slate-100 flex flex-col"
      style={{ fontFamily: "'Barlow', sans-serif" }}
    >
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/70 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            {/* Logo */}
            <a href="#/" className="flex items-center gap-2.5 group">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-emerald-400 to-cyan-400 p-2 flex items-center justify-center shadow-lg shadow-emerald-500/10 group-hover:scale-105 transition-all">
                <CreditCard size={18} className="text-slate-950 font-bold" />
              </div>
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                MANTO
              </span>
            </a>

            {/* Navigation links */}
            <nav className="hidden md:flex items-center gap-1">
              <a
                href="#/pricing"
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition"
              >
                <CreditCard size={15} />
                {t("customer_layout.pricing")}
              </a>
              {isAuthenticated && (
                <a
                  href="#/orders"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition"
                >
                  <ShoppingBag size={15} />
                  {t("customer_layout.my_orders")}
                </a>
              )}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                {/* Profile menu from Auth */}
                <UserMenu
                  user={user}
                  userEmail={userEmail}
                  profileName={profileName}
                />
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <a
                  href="#/customer/login"
                  className="px-4 py-2 rounded-xl text-sm font-medium text-slate-300 hover:text-white transition"
                >
                  {t("customer_layout.login")}
                </a>
                <a
                  href="#/customer/register"
                  className="bg-gradient-to-r from-emerald-400 to-cyan-400 text-slate-950 font-semibold px-4 py-2 rounded-xl text-sm shadow-md hover:brightness-110 active:scale-[0.98] transition-all"
                >
                  {t("customer_layout.register_trial")}
                </a>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-8 flex flex-col">
        {pageTitle && (
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-white mb-2">{pageTitle}</h1>
            <div className="h-1 w-12 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full" />
          </div>
        )}
        <div className="flex-1">{children}</div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950/40 py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-500">
          <div>© {new Date().getFullYear()} MANTO Platform. All rights reserved.</div>
          <div className="flex gap-6">
            <a href="#/pricing" className="hover:text-slate-300 transition">{t("customer_layout.pricing")}</a>
            <a href="#" className="hover:text-slate-300 transition">{t("customer_layout.terms_of_use")}</a>
            <a href="#" className="hover:text-slate-300 transition">{t("customer_layout.privacy_policy")}</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
