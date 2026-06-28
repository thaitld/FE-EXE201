import { type ReactNode, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/features/auth/AuthContext';
import UserMenu from '@/features/auth/UserMenu';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { CreditCard, ShoppingBag, LayoutDashboard, UserCircle, Undo2 } from 'lucide-react';

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
      className="min-h-screen bg-slate-100 text-slate-800 flex flex-col"
      style={{ fontFamily: "'Barlow', sans-serif" }}
    >
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            {/* Logo */}
            <a href="#/" className="flex items-center gap-2.5 group">
              <span className="text-xl font-bold tracking-tight text-slate-900">
                MANTO
              </span>
            </a>

            {/* Navigation links */}
            <nav className="hidden md:flex items-center gap-1">
              <a
                href="#/pricing"
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
              >
                <CreditCard size={15} />
                {t("customer_layout.pricing")}
              </a>
              {isAuthenticated && (
                <>
                  <a
                    href="#/orders"
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
                  >
                    <ShoppingBag size={15} />
                    {t("customer_layout.my_orders")}
                  </a>
                  <a
                    href="#/customer/refunds"
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
                  >
                    <Undo2 size={15} />
                    {t("customer_layout.refunds")}
                  </a>
                  <a
                    href="#/customer/profile"
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
                  >
                    <UserCircle size={15} />
                    {t("customer_layout.profile")}
                  </a>
                </>
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
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
                >
                  {t("customer_layout.login")}
                </a>
                <a
                  href="#/customer/register"
                  className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-xl text-sm shadow-sm hover:bg-blue-700 active:scale-[0.98] transition-all"
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
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-950 mb-2">{pageTitle}</h1>
            <div className="h-1 w-12 bg-blue-600 rounded-full" />
          </div>
        )}
        <div className="flex-1">{children}</div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-slate-50 py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-500">
          <div>© {new Date().getFullYear()} MANTO Platform. All rights reserved.</div>
          <div className="flex gap-6">
            <a href="#/pricing" className="hover:text-slate-800 transition">{t("customer_layout.pricing")}</a>
            <a href="#" className="hover:text-slate-800 transition">{t("customer_layout.terms_of_use")}</a>
            <a href="#" className="hover:text-slate-800 transition">{t("customer_layout.privacy_policy")}</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
