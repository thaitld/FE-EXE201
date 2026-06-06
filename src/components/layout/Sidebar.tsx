import { useState } from "react";
import { useAuth } from "@/features/auth/AuthContext";
import { usePermission } from "@/features/auth/usePermission";
import {
  LayoutDashboard,
  Users,
  UserRound,
  TrendingUp,
  Briefcase,
  Heart,
  TriangleAlert,
  Activity,
  Brain,
  Sparkles,
  CornerDownRight,
  Compass,
  BarChart3,
  Building2,
  Zap,
  ChevronDown,
  Settings,
  X,
  ClipboardList,
  FileText,
  ShieldAlert,
  CalendarDays,
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function Sidebar({
  isOpen,
  onClose,
  activeTab,
  onTabChange,
}: SidebarProps) {
  const { user } = useAuth();
  const {
    isAdmin,
    isCEO,
    isManager,
    isHR,
    isEmployee,
    canViewCompanyDashboard,
    canViewDepartmentDashboard,
  } = usePermission();
  const [expandedSections, setExpandedSections] = useState<{
    [key: string]: boolean;
  }>({
    dashboard: true,
    people: true,
    wellbeing: true,
    ai: true,
    analytics: true,
  });

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleTabClick = (tab: string) => {
    if (tab === "user-management") {
      window.location.hash = "#/admin/user-management";
    } else if (tab === "hr-report") {
      window.location.hash = "#/admin/hr-report";
    } else if (tab === "profile") {
      window.location.hash = "#/admin/profile";
    } else {
      if (window.location.hash !== "#/admin") {
        window.location.hash = "#/admin";
      }
      onTabChange(tab);
    }
  };

  const topLevelItemClass =
    "w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-all duration-200 text-left font-medium text-[13.5px]";
  const activeTopLevelClass = "bg-blue-50/50 text-blue-700 font-semibold";
  const subItemClass =
    "w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-all duration-200 text-left font-medium text-[13px] hover:translate-x-0.5";
  const activeSubItemClass =
    "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm shadow-blue-500/10 hover:translate-x-0";

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-white border-r border-slate-100 z-40 transition-all duration-350 ease-in-out md:translate-x-0 ${!isOpen ? "-translate-x-full" : ""
          }`}
      >
        <div className="h-full flex flex-col overflow-y-auto">
          {/* Logo Section */}
          <div className="p-6 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <img src="/manto.png" className="h-24 w-auto object-contain transition-transform duration-300 hover:scale-102" alt="MANTO" loading="lazy" />
              </div>
              <button
                onClick={onClose}
                className="md:hidden p-1.5 hover:bg-slate-50 rounded-lg text-slate-500"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            <button
              type="button"
              onClick={() => toggleSection("dashboard")}
              className={`${topLevelItemClass} ${expandedSections.dashboard ? activeTopLevelClass : ""
                }`}
            >
              <LayoutDashboard size={18} />
              <span className="text-sm font-semibold">Dashboard</span>
              <ChevronDown
                size={16}
                className={`ml-auto transition-transform ${expandedSections.dashboard ? "rotate-180" : ""
                  }`}
              />
            </button>

            {expandedSections.dashboard && (
              <div className="space-y-1 pl-4">
                {(isEmployee() || isHR()) && (
                  <button
                    type="button"
                    onClick={() => handleTabClick("dashboard-personal")}
                    className={`${subItemClass} ${activeTab === "dashboard-personal" ? activeSubItemClass : ""
                      }`}
                  >
                    <UserRound size={17} />
                    <span className="text-sm font-medium">Personal</span>
                  </button>
                )}
                {canViewDepartmentDashboard() && (
                  <button
                    type="button"
                    onClick={() => handleTabClick("dashboard-department")}
                    className={`${subItemClass} ${activeTab === "dashboard-department" ? activeSubItemClass : ""
                      }`}
                  >
                    <Building2 size={17} />
                    <span className="text-sm font-medium">Department</span>
                  </button>
                )}
                {canViewCompanyDashboard() && (
                  <button
                    type="button"
                    onClick={() => handleTabClick("dashboard-company")}
                    className={`${subItemClass} ${activeTab === "dashboard-company" ? activeSubItemClass : ""
                      }`}
                  >
                    <BarChart3 size={17} />
                    <span className="text-sm font-medium">Company</span>
                  </button>
                )}
              </div>
            )}

            {/* My Tasks - visible to Employee, HR, Manager */}
            {(isEmployee() || isHR() || isManager()) && (
              <button
                type="button"
                onClick={() => handleTabClick("my-tasks")}
                className={`${topLevelItemClass} ${activeTab === "my-tasks" ? activeTopLevelClass : ""
                  }`}
              >
                <Briefcase size={18} />
                <span className="text-sm font-semibold">My Tasks</span>
              </button>
            )}

            {/* Meetings - visible to all roles (Employee=me only, Manager/HR/CEO/Admin=all/dept/me) */}
            <button
              type="button"
              onClick={() => handleTabClick("meetings")}
              className={`${topLevelItemClass} ${
                activeTab === "meetings" ? activeTopLevelClass : ""
              }`}
            >
              <CalendarDays size={18} />
              <span className="text-sm font-semibold">Meetings</span>
            </button>

            {/* People Section */}
            {(isManager() || isHR() || isAdmin()) ? (
              <>
                <button
                  type="button"
                  onClick={() => toggleSection("people")}
                  className={`${topLevelItemClass} ${expandedSections.people ? activeTopLevelClass : ""}`}
                >
                  <Users size={18} />
                  <span className="text-sm font-semibold">People</span>
                  <ChevronDown
                    size={16}
                    className={`ml-auto transition-transform ${expandedSections.people ? "rotate-180" : ""}`}
                  />
                </button>

                {expandedSections.people && (
                  <div className="space-y-1 pl-4">
                    {/* Team - visible to Manager, Admin */}
                    {(isManager() || isAdmin()) && (
                      <button
                        type="button"
                        onClick={() => handleTabClick("team")}
                        className={`${subItemClass} ${activeTab === "team" ? activeSubItemClass : ""}`}
                      >
                        <UserRound size={17} />
                        <span className="text-sm font-medium">Team</span>
                      </button>
                    )}

                    {/* Departments - Manager, HR, Admin */}
                    {(isManager() || isHR() || isAdmin()) && (
                      <button
                        type="button"
                        onClick={() => handleTabClick("departments")}
                        className={`${subItemClass} ${activeTab === "departments" ? activeSubItemClass : ""}`}
                      >
                        <Building2 size={17} />
                        <span className="text-sm font-medium">Departments</span>
                      </button>
                    )}

                    {/* Task Types - Manager, Admin */}
                    {(isManager() || isAdmin()) && (
                      <button
                        type="button"
                        onClick={() => handleTabClick("task-types")}
                        className={`${subItemClass} ${activeTab === "task-types" ? activeSubItemClass : ""}`}
                      >
                        <ClipboardList size={17} />
                        <span className="text-sm font-medium">Task Types</span>
                      </button>
                    )}

                    {/* Users - Admin only */}
                    {isAdmin() && (
                      <button
                        type="button"
                        onClick={() => handleTabClick("user-management")}
                        className={`${subItemClass} ${activeTab === "user-management" ? activeSubItemClass : ""}`}
                      >
                        <Users size={17} />
                        <span className="text-sm font-medium">Users</span>
                      </button>
                    )}

                    {/* Performance - visible to HR, Admin */}
                    {(isHR() || isAdmin()) && (
                      <button
                        type="button"
                        onClick={() => handleTabClick("performance")}
                        className={`${subItemClass} ${activeTab === "performance" ? activeSubItemClass : ""}`}
                      >
                        <TrendingUp size={17} />
                        <span className="text-sm font-medium">Performance</span>
                      </button>
                    )}

                    {/* Workload - Manager, Admin */}
                    {(isManager() || isAdmin()) && (
                      <button
                        type="button"
                        onClick={() => handleTabClick("workload")}
                        className={`${subItemClass} ${activeTab === "workload" ? activeSubItemClass : ""}`}
                      >
                        <Briefcase size={17} />
                        <span className="text-sm font-medium">Workload</span>
                      </button>
                    )}

                    {/* Task Management - Manager only (Phase 4) */}
                    {isManager() && (
                      <button
                        type="button"
                        onClick={() => handleTabClick("task-management")}
                        className={`${subItemClass} ${activeTab === "task-management" ? activeSubItemClass : ""}`}
                      >
                        <ClipboardList size={17} />
                        <span className="text-sm font-medium">Quản lý Task</span>
                      </button>
                    )}

                    {/* Team Performance - Manager only (Phase 4) */}
                    {isManager() && (
                      <button
                        type="button"
                        onClick={() => handleTabClick("team-performance")}
                        className={`${subItemClass} ${activeTab === "team-performance" ? activeSubItemClass : ""}`}
                      >
                        <TrendingUp size={17} />
                        <span className="text-sm font-medium">Hiệu suất Nhóm</span>
                      </button>
                    )}
                  </div>
                )}
              </>
            ) : (
              /* Flat item for users who only see 'Team' (Employee) */
              isEmployee() && (
                <button
                  type="button"
                  onClick={() => handleTabClick("team")}
                  className={`${topLevelItemClass} ${activeTab === "team" ? activeTopLevelClass : ""}`}
                >
                  <UserRound size={18} />
                  <span className="text-sm font-semibold">Team</span>
                </button>
              )
            )}

            {/* Wellbeing Section */}
            {(isManager() || isHR() || isCEO() || isAdmin()) ? (
              <>
                <button
                  type="button"
                  onClick={() => toggleSection("wellbeing")}
                  className={`${topLevelItemClass} ${expandedSections.wellbeing ? activeTopLevelClass : ""}`}
                >
                  <Heart size={18} />
                  <span className="text-sm font-semibold">Wellbeing</span>
                  <ChevronDown
                    size={16}
                    className={`ml-auto transition-transform ${expandedSections.wellbeing ? "rotate-180" : ""}`}
                  />
                </button>

                {expandedSections.wellbeing && (
                  <div className="space-y-1 pl-4">
                    {/* Burnout Risk - HR, Admin */}
                    {(isHR() || isAdmin()) && (
                      <button
                        type="button"
                        onClick={() => handleTabClick("burnout-risk")}
                        className={`${subItemClass} ${activeTab === "burnout-risk" ? activeSubItemClass : ""}`}
                      >
                        <TriangleAlert size={17} />
                        <span className="text-sm font-medium">Burnout Risk</span>
                      </button>
                    )}

                    {/* Burnout Monitor (full) - Manager only (Phase 4) */}
                    {isManager() && (
                      <button
                        type="button"
                        onClick={() => handleTabClick("burnout-monitor")}
                        className={`${subItemClass} ${activeTab === "burnout-monitor" ? activeSubItemClass : ""}`}
                      >
                        <ShieldAlert size={17} />
                        <span className="text-sm font-medium">Burnout Monitor</span>
                      </button>
                    )}

                    {/* Wellbeing Analytics - visible to HR, CEO, Admin */}
                    {(isHR() || isCEO() || isAdmin()) && (
                      <button
                        type="button"
                        onClick={() => handleTabClick("wellbeing-analytics")}
                        className={`${subItemClass} ${activeTab === "wellbeing-analytics" ? activeSubItemClass : ""}`}
                      >
                        <Activity size={17} />
                        <span className="text-sm font-medium">
                          Wellbeing Analytics
                        </span>
                      </button>
                    )}

                    {/* Survey Analytics - visible to Manager, HR, CEO, Admin */}
                    {(isManager() || isHR() || isCEO() || isAdmin()) && (
                      <button
                        type="button"
                        onClick={() => handleTabClick("survey-analytics")}
                        className={`${subItemClass} ${activeTab === "survey-analytics" ? activeSubItemClass : ""}`}
                      >
                        <Sparkles size={17} />
                        <span className="text-sm font-medium">Survey Analytics</span>
                      </button>
                    )}

                    {/* Monthly Survey - visible to Employee only */}
                    {isEmployee() && (
                      <button
                        type="button"
                        onClick={() => handleTabClick("survey")}
                        className={`${subItemClass} ${activeTab === "survey" ? activeSubItemClass : ""}`}
                      >
                        <Sparkles size={17} />
                        <span className="text-sm font-medium">Monthly Survey</span>
                      </button>
                    )}
                  </div>
                )}
              </>
            ) : (
              /* Flat item for users who only see 'Monthly Survey' (Employee) */
              isEmployee() && (
                <button
                  type="button"
                  onClick={() => handleTabClick("survey")}
                  className={`${topLevelItemClass} ${activeTab === "survey" ? activeTopLevelClass : ""}`}
                >
                  <Sparkles size={18} />
                  <span className="text-sm font-semibold">Monthly Survey</span>
                </button>
              )
            )}

            {(isAdmin() || isCEO() || isManager() || isHR()) && (
              <>
                <button
                  type="button"
                  onClick={() => toggleSection("ai")}
                  className={`${topLevelItemClass} ${expandedSections.ai ? activeTopLevelClass : ""}`}
                >
                  <Brain size={18} />
                  <span className="text-sm font-semibold">AI Intelligence</span>
                  <ChevronDown
                    size={16}
                    className={`ml-auto transition-transform ${expandedSections.ai ? "rotate-180" : ""}`}
                  />
                </button>

            {expandedSections.ai && (
              <div className="space-y-1 pl-4">
                <button
                  type="button"
                  onClick={() => handleTabClick("ai-insights")}
                  className={`${subItemClass} ${activeTab === "ai-insights" ? activeSubItemClass : ""}`}
                >
                  <Sparkles size={17} />
                  <span className="text-sm font-medium">AI Insights</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleTabClick("ai-predictions")}
                  className={`${subItemClass} ${activeTab === "ai-predictions" ? activeSubItemClass : ""}`}
                >
                  <CornerDownRight size={17} />
                  <span className="text-sm font-medium">AI Predictions</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleTabClick("ai-recommendations")}
                  className={`${subItemClass} ${activeTab === "ai-recommendations" ? activeSubItemClass : ""}`}
                >
                  <Compass size={17} />
                  <span className="text-sm font-medium">
                    AI Recommendations
                  </span>
                </button>
                {(isCEO() || isHR() || isAdmin()) && (
                  <button
                    type="button"
                    onClick={() => handleTabClick("hr-report")}
                    className={`${subItemClass} ${activeTab === "hr-report" ? activeSubItemClass : ""}`}
                  >
                    <Sparkles size={17} className="text-violet-500" />
                    <span className="text-sm font-medium">HR Report</span>
                  </button>
                )}
              </div>
            )}
          </>
            )}

            {(isAdmin() || isCEO() || isManager() || isHR()) && (
              <>
                <button
                  type="button"
                  onClick={() => toggleSection("analytics")}
                  className={`${topLevelItemClass} ${expandedSections.analytics ? activeTopLevelClass : ""}`}
                >
                  <BarChart3 size={18} />
                  <span className="text-sm font-semibold">Analytics</span>
                  <ChevronDown
                    size={16}
                    className={`ml-auto transition-transform ${expandedSections.analytics ? "rotate-180" : ""}`}
                  />
                </button>

                {expandedSections.analytics && (
                  <div className="space-y-1 pl-4">

                    {/* Department Analytics - Manager, Admin */}
                    {(isManager() || isAdmin()) && (
                      <button
                        type="button"
                        onClick={() => handleTabClick("department-analytics")}
                        className={`${subItemClass} ${activeTab === "department-analytics" ? activeSubItemClass : ""}`}
                      >
                        <Building2 size={17} />
                        <span className="text-sm font-medium">
                          Department Analytics
                        </span>
                      </button>
                    )}

                    {/* Workforce Trends - HR, CEO, Admin */}
                    {(isHR() || isCEO() || isAdmin()) && (
                      <button
                        type="button"
                        onClick={() => handleTabClick("workforce-trends")}
                        className={`${subItemClass} ${activeTab === "workforce-trends" ? activeSubItemClass : ""}`}
                      >
                        <Zap size={17} />
                        <span className="text-sm font-medium">
                          Workforce Trends
                        </span>
                      </button>
                    )}
                  </div>
                )}
              </>
            )}

            {/* Settings - Admin only */}
            {isAdmin() && (
              <button
                type="button"
                onClick={() => handleTabClick("settings")}
                className={`${topLevelItemClass} ${activeTab === "settings" ? activeSubItemClass : ""}`}
              >
                <Settings size={18} />
                <span className="text-sm font-semibold">Settings</span>
              </button>
            )}
          </nav>

          {/* User Section */}
          <div className="p-4 border-t border-slate-100 bg-slate-50/50 mt-auto">
            <div className="flex items-center gap-3 px-2 py-1.5 rounded-xl border border-slate-100/80 bg-white shadow-sm">
              <div className="w-9 h-9 rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-blue-600 to-indigo-600 shadow-sm shadow-blue-500/10">
                {user?.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt="avatar"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold uppercase">
                    {(user?.email?.charAt(0) ?? "M")}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-700 truncate">
                  {user?.firstName || user?.lastName ? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() : (user?.email?.split('@')[0] ?? "User")}
                </p>
                <p className="text-[10px] text-slate-400 truncate mt-0.5">
                  {user?.email ?? "unknown@manto.local"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
