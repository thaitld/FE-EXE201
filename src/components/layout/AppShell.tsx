import { type ReactNode, useMemo, useState } from "react";
import { useAuth } from "@/features/auth/AuthContext";
import Sidebar from "@/components/layout/Sidebar";
import AlertBell from "@/features/notifications/AlertBell";
import UserMenu from "@/features/auth/UserMenu";
import NotificationsPanel from "@/features/notifications/NotificationsPanel";
import { Menu } from "lucide-react";

interface AppShellProps {
  children: ReactNode;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  pageTitle?: string;
  pageSubtitle?: string;
}

export default function AppShell({
  children,
  activeTab = "overview",
  onTabChange = () => {},
  pageTitle = "Dashboard",
  pageSubtitle = "",
}: AppShellProps) {
  const { user, userEmail } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const profileName = useMemo(() => {
    if (user?.firstName || user?.lastName)
      return `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim();
    if (userEmail) {
      const localPart = userEmail.split("@")[0] ?? "";
      return localPart
        .split(/[._-]/)
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");
    }
    return "MANTO User";
  }, [user, userEmail]);

  return (
    <div
      className="min-h-screen bg-slate-50 text-slate-950 flex"
      style={{ fontFamily: "'Barlow', sans-serif" }}
    >
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeTab={activeTab}
        onTabChange={onTabChange}
      />

      {/* Main Content */}
      <main className="flex-1 transition-all duration-300 md:ml-64">
        {/* Header */}
        <header className="border-b border-slate-200 bg-white sticky top-0 z-30">
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 hover:bg-slate-100 rounded-lg transition md:hidden"
              >
                <Menu size={20} />
              </button>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  {pageTitle}
                </h2>
                {pageSubtitle && (
                  <p className="text-sm text-slate-500">{pageSubtitle}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <AlertBell
                onOpenNotifications={() => setNotificationsOpen(true)}
              />
              <button
                onClick={() => (window.location.hash = "#/survey")}
                className="text-sm text-slate-700 px-3 py-2 rounded hover:bg-slate-100"
              >
                Survey
              </button>
              <UserMenu
                user={user}
                userEmail={userEmail}
                profileName={profileName}
                activeTab={activeTab}
                onTabChange={onTabChange}
              />
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-6">{children}</div>
      </main>

      {/* Notifications Panel */}
      <NotificationsPanel
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
      />
    </div>
  );
}
