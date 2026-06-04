import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/features/auth/AuthContext";
import Sidebar from "@/components/layout/Sidebar";
import AlertBell from "@/features/notifications/AlertBell";
import UserMenu from "@/features/auth/UserMenu";
import NotificationsPanel from "@/features/notifications/NotificationsPanel";
import { Menu } from "lucide-react";

// Import all panel components
import { OverviewPanel } from "@/components/panels/admin/OverviewPanel";
import { TeamPanel } from "@/components/panels/admin/TeamPanel";
import { PerformancePanel } from "@/components/panels/admin/PerformancePanel";
import { WorkloadPanel } from "@/components/panels/admin/WorkloadPanel";
import { BurnoutRiskPanel } from "@/components/panels/admin/BurnoutRiskPanel";
import { WellbeingAnalyticsPanel } from "@/components/panels/admin/WellbeingAnalyticsPanel";
import { AIInsightsPanel } from "@/components/panels/admin/AIInsightsPanel";
import { AIPredictionsPanel } from "@/components/panels/admin/AIPredictionsPanel";
import { AIRecommendationsPanel } from "@/components/panels/admin/AIRecommendationsPanel";
import { DepartmentAnalyticsPanel } from "@/components/panels/admin/DepartmentAnalyticsPanel";
import { UserManagementPanel } from "@/components/panels/admin/UserManagementPanel";
import { WorkforceTrendsPanel } from "@/components/panels/admin/WorkforceTrendsPanel";
import { SettingsPanel } from "@/components/panels/admin/SettingsPanel";
import DepartmentsPanel from "@/components/panels/admin/DepartmentsPanel";
// Phase 4: Manager-specific panels
import { ManagerDashboardPanel } from "@/components/panels/admin/ManagerDashboardPanel";
import { TaskManagementPanel } from "@/components/panels/admin/TaskManagementPanel";
import { BurnoutMonitorPanel } from "@/components/panels/admin/BurnoutMonitorPanel";
import { TeamPerformancePanel } from "@/components/panels/admin/TeamPerformancePanel";
import { ManagerReportPanel } from "@/components/panels/admin/ManagerReportPanel";
import ProfilePage from "@/pages/shared/Profile";

import PersonalDashboard from "@/components/panels/employee/PersonalDashboard";
import MyTasks from "@/components/panels/employee/MyTasks";
import Survey from "@/components/panels/employee/Survey";
import TaskDetail from "@/components/panels/employee/TaskDetail";
import { usePermission } from "@/features/auth/usePermission";

const TAB_META: Record<string, { title: string; subtitle: string }> = {
  overview: {
    title: "Dashboard Overview",
    subtitle: "Executive snapshot of platform performance.",
  },
  "my-tasks": {
    title: "My Tasks",
    subtitle: "Manage your assigned work and track progress.",
  },
  survey: {
    title: "Monthly Survey",
    subtitle: "Submit your morale and stress levels.",
  },
  "task-detail": {
    title: "Task Details",
    subtitle: "View details, track time and comment on task.",
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
  // Phase 4: Manager tabs
  "task-management": {
    title: "Quản lý Task",
    subtitle: "Tạo, duyệt, từ chối và theo dõi task của phòng ban.",
  },
  "team-performance": {
    title: "Hiệu suất Nhóm",
    subtitle: "Hiệu suất theo ngày và báo cáo overtime.",
  },
  "burnout-monitor": {
    title: "Theo dõi Burnout",
    subtitle: "Phát hiện và xử lý tín hiệu burnout của nhân viên.",
  },
  "manager-report": {
    title: "Báo cáo AI",
    subtitle: "Báo cáo hàng tuần do Gemini AI tổng hợp.",
  },
};

// Panel component map - maps activeTab to the corresponding panel component
const getPanelComponent = (
  activeTab: string,
  isEmployee: boolean,
  isManager: boolean,
) => {
  switch (activeTab) {
    case "overview":
      if (isEmployee) return <PersonalDashboard />;
      if (isManager) return <ManagerDashboardPanel />;
      return <OverviewPanel />;
    case "my-tasks":
      return <MyTasks />;
    case "survey":
      return <Survey />;
    case "task-detail":
      return <TaskDetail />;
    case "profile":
      return <ProfilePage />;
    case "team":
      return <TeamPanel />;
    case "performance":
      return isManager ? <TeamPerformancePanel /> : <PerformancePanel />;
    case "workload":
      return <WorkloadPanel />;
    case "burnout-risk":
      return isManager ? <BurnoutMonitorPanel /> : <BurnoutRiskPanel />;
    case "wellbeing-analytics":
      return <WellbeingAnalyticsPanel />;
    case "ai-insights":
      return isManager ? <ManagerReportPanel /> : <AIInsightsPanel />;
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
    // Phase 4: Manager-only tabs
    case "task-management":
      return <TaskManagementPanel />;
    case "team-performance":
      return <TeamPerformancePanel />;
    case "burnout-monitor":
      return <BurnoutMonitorPanel />;
    case "manager-report":
      return <ManagerReportPanel />;
    default:
      if (isEmployee) return <PersonalDashboard />;
      if (isManager) return <ManagerDashboardPanel />;
      return <OverviewPanel />;
  }
};

export default function Admin({ initialTab }: { initialTab?: string } = {}) {
  const { user, userEmail } = useAuth();
  const { isEmployee, isManager } = usePermission();
  const [activeTab, setActiveTab] = useState(initialTab ?? "overview");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    } else {
      // Revert to a safe default if we navigate back to #/admin from a detail route
      if (
        activeTab === "task-detail" ||
        activeTab === "user-management" ||
        activeTab === "profile"
      ) {
        setActiveTab(isEmployee() ? "my-tasks" : "overview");
      }
    }
  }, [initialTab, isEmployee]);

  // Sync URL hash back to #/admin when clicking sidebar tabs
  // This ensures that clicking a task in MyTasks will reliably trigger a hashchange
  useEffect(() => {
    const hash = window.location.hash;
    if (
      activeTab !== "task-detail" &&
      activeTab !== "user-management" &&
      activeTab !== "profile"
    ) {
      if (hash.startsWith("#/admin/") && hash !== "#/admin") {
        window.location.hash = "#/admin";
      }
    }
  }, [activeTab]);

  const currentMeta = useMemo(() => {
    const meta = TAB_META[activeTab] ?? TAB_META.overview;
    if (activeTab === "overview" && isEmployee()) {
      return {
        title: "Personal Dashboard",
        subtitle: "Your personal wellbeing and efficiency overview.",
      };
    }
    return meta;
  }, [activeTab, isEmployee]);

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

          {getPanelComponent(activeTab, isEmployee(), isManager())}
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
