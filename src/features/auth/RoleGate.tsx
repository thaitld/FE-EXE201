import { type ReactNode } from "react";
import { useAuth } from "./AuthContext";

interface RoleGateProps {
  allowedRoles: string[];
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * RoleGate - Controls access to components based on user role.
 * Only renders children if user's role is in allowedRoles array.
 *
 * @example
 * <RoleGate allowedRoles={['Admin', 'CEO']}>
 *   <AdminDashboard />
 * </RoleGate>
 */
export default function RoleGate({
  allowedRoles,
  children,
  fallback = null,
}: RoleGateProps) {
  const { role } = useAuth();

  // If not authenticated or no role info, deny access
  if (!role) {
    return <>{fallback}</>;
  }

  // Check if user's role is in allowed roles (case-insensitive)
  const hasAccess = allowedRoles.some(
    (allowedRole) => allowedRole.toLowerCase() === role.toLowerCase(),
  );

  return <>{hasAccess ? children : fallback}</>;
}
