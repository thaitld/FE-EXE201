import { useAuth } from "@/features/auth/AuthContext";

/**
 * Hook for checking user permissions based on role
 * Provides granular permission checking for feature-level access control
 */
export function usePermission() {
  const { user, role } = useAuth();

  const hasRole = (...roles: string[]) => {
    if (!role) return false;
    return roles.some((r) => {
      if (Array.isArray(role)) {
        return role.some((userRole) => typeof userRole === 'string' && userRole.toLowerCase() === r.toLowerCase());
      }
      return typeof role === 'string' && role.toLowerCase() === r.toLowerCase();
    });
  };

  const isAdmin = () => hasRole("Admin");

  const isCEO = () => hasRole("CEO");

  const isManager = () => hasRole("Manager");

  const isHR = () => hasRole("HR");

  const isEmployee = () => hasRole("Employee");

  const isLeadership = () => hasRole("Admin", "CEO", "Manager", "HR");

  const canManageUsers = () => isAdmin();

  const canViewAnalytics = () => isLeadership();

  const canManageTasks = () => hasRole("Manager", "Admin");

  const canAssignTasks = () => hasRole("Manager", "Admin");

  const canViewBurnoutData = () => hasRole("Manager", "HR", "CEO", "Admin");

  const canViewCompanyDashboard = () => hasRole("CEO", "Admin");

  const canViewDepartmentDashboard = () => hasRole("Manager", "HR", "Admin");

  const canViewPersonalDashboard = () => true; // All authenticated users

  return {
    // Basic role checks
    hasRole,
    isAdmin,
    isCEO,
    isManager,
    isHR,
    isEmployee,
    isLeadership,
    // Feature-specific checks
    canManageUsers,
    canViewAnalytics,
    canManageTasks,
    canAssignTasks,
    canViewBurnoutData,
    canViewCompanyDashboard,
    canViewDepartmentDashboard,
    canViewPersonalDashboard,
    // User data
    user,
    currentRole: role,
  };
}
