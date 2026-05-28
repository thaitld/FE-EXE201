import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Sidebar from "@/components/Sidebar";
import AlertBell from "@/components/AlertBell";
import UserMenu from "@/components/UserMenu";
import NotificationsPanel from "@/components/NotificationsPanel";
import { Menu } from "lucide-react";

// Import all panel components
import { OverviewPanel } from "./admin-panels/OverviewPanel";
import { TeamPanel } from "./admin-panels/TeamPanel";
import { PerformancePanel } from "./admin-panels/PerformancePanel";
import { WorkloadPanel } from "./admin-panels/WorkloadPanel";
import { BurnoutRiskPanel } from "./admin-panels/BurnoutRiskPanel";
import { WellbeingAnalyticsPanel } from "./admin-panels/WellbeingAnalyticsPanel";
import { AIInsightsPanel } from "./admin-panels/AIInsightsPanel";
import { AIPredictionsPanel } from "./admin-panels/AIPredictionsPanel";
import { AIRecommendationsPanel } from "./admin-panels/AIRecommendationsPanel";
import { DepartmentAnalyticsPanel } from "./admin-panels/DepartmentAnalyticsPanel";
import { UserManagementPanel } from "./admin-panels/UserManagementPanel";
import { WorkforceTrendsPanel } from "./admin-panels/WorkforceTrendsPanel";
import { SettingsPanel } from "./admin-panels/SettingsPanel";
import DepartmentsPanel from "./admin-panels/DepartmentsPanel";
import ProfilePage from "./Profile";

const TAB_META: Record<string, { title: string; subtitle: string }> = {
  overview: {
    title: "Dashboard Overview",
    subtitle: "Executive snapshot of platform performance.",
  },
  team: {
    title: "Team",
    subtitle: "Team size, distribution and engagement status.",
  },
  performance: {
    title: "Performance",
    subtitle: "Productivity and goal completion metrics.",
  },
  workload: {
    title: "Workload",
    subtitle: "Allocation balance across teams and roles.",
  },
  "burnout-risk": {
    title: "Burnout Risk",
    subtitle: "Risk classification based on recent signals.",
  },
  "wellbeing-analytics": {
    title: "Wellbeing Analytics",
    subtitle: "Mental wellbeing trends and score changes.",
  },
  "ai-insights": {
    title: "AI Insights",
    subtitle: "AI-generated highlights from operational data.",
  },
  "ai-predictions": {
    title: "AI Predictions",
    subtitle: "Forecasts generated from recent platform activity.",
  },
  "ai-recommendations": {
    title: "AI Recommendations",
    subtitle: "Actionable suggestions to improve outcomes.",
  },
  "department-analytics": {
    title: "Department Analytics",
    subtitle: "Department-level KPI breakdown and ranking.",
  },
  departments: {
    title: "Departments",
    subtitle: "Manage company departments.",
  },
  "user-management": {
    title: "User Management",
    subtitle: "Create, update, search, and review users.",
  },
  "workforce-trends": {
    title: "Workforce Trends",
    subtitle: "Headcount, churn, and productivity trends over time.",
  },
  settings: {
    title: "Settings",
    subtitle: "Manage dashboard preferences and system options.",
  },
};

// Panel component map - maps activeTab to the corresponding panel component
const getPanelComponent = (activeTab: string) => {
  switch (activeTab) {
    case "overview":
      return <OverviewPanel />;
    case "profile":
      return <ProfilePage />;
    case "team":
      return <TeamPanel />;
    case "performance":
      return <PerformancePanel />;
    case "workload":
      return <WorkloadPanel />;
    case "burnout-risk":
      return <BurnoutRiskPanel />;
    case "wellbeing-analytics":
      return <WellbeingAnalyticsPanel />;
    case "ai-insights":
      return <AIInsightsPanel />;
    case "ai-predictions":
      return <AIPredictionsPanel />;
    case "ai-recommendations":
      return <AIRecommendationsPanel />;
    case "department-analytics":
      return <DepartmentAnalyticsPanel />;
    case "departments":
      return <DepartmentsPanel />;
    case "user-management":
      return <UserManagementPanel />;
    case "workforce-trends":
      return <WorkforceTrendsPanel />;
    case "settings":
      return <SettingsPanel />;
    default:
      return <OverviewPanel />;
  }
};

export default function Admin({ initialTab }: { initialTab?: string } = {}) {
  const { user, userEmail } = useAuth();
  const [activeTab, setActiveTab] = useState(initialTab ?? "overview");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const currentMeta = TAB_META[activeTab] ?? TAB_META.overview;

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
        onTabChange={setActiveTab}
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
                  {currentMeta.title}
                </h2>
                <p className="text-sm text-slate-500">{currentMeta.subtitle}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <AlertBell
                onOpenNotifications={() => setNotificationsOpen(true)}
              />
              <UserMenu
                user={user}
                userEmail={userEmail}
                profileName={profileName}
                activeTab={activeTab}
                onTabChange={setActiveTab}
              />
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-slate-600">
                Rendering {currentMeta.title.toLowerCase()} panel with extracted
                components.
              </p>
            </div>
            {/* <Button className="bg-slate-900 hover:bg-slate-800 text-white">
              Export
            </Button> */}
          </div>

          {getPanelComponent(activeTab)}
        </div>
      </main>

      {/* Notifications Panel */}
      <NotificationsPanel
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
      />
    </div>
  );
}
