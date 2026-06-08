import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import Homepage from "@/pages/shared/Homepage";
import Login from "@/pages/auth/Login";
import ForgotPassword from "@/pages/auth/ForgotPassword";
import Register from "@/pages/auth/Register";
import ResetPassword from "@/pages/auth/ResetPassword";
import ChangePassword from "@/pages/shared/ChangePassword";
import GoogleAuthCallback from "@/pages/auth/GoogleAuthCallback";
import NotAuthorized from "@/pages/shared/NotAuthorized";
import Dashboard from "@/pages/Dashboard";
import RoleGate from "@/features/auth/RoleGate";
import ProfilePage from "@/pages/shared/Profile";
import Survey from "@/components/panels/employee/Survey";
import Manager from "@/pages/roles/Manager";
function isAdminRoute(route: string) {
  return route.startsWith("#/admin");
}

function isRoleManagerRoute(route: string) {
  return route.startsWith("#/roles/manager") || route.startsWith("#/manager");
}

function AdminRoute({ route }: { route: string }) {
  const adminComponent = (() => {
    if (route.startsWith("#/admin/user-management")) {
      return <Dashboard initialTab="user-management" />;
    }

    if (route.startsWith("#/admin/profile")) {
      return <Dashboard initialTab="profile" />;
    }

    if (route.startsWith("#/admin/task/")) {
      return <Dashboard initialTab="task-detail" />;
    }

    if (route.startsWith("#/admin/meetings")) {
      return <Dashboard initialTab="meetings" />;
    }

    if (route.startsWith("#/admin/hr-report")) {
      return <Dashboard initialTab="hr-report" />;
    }

    if (route.startsWith("#/roles/admin/task-types")) {
      return <Dashboard initialTab="task-types" />;
    }

    return <Dashboard />;
  })();

  // All authenticated users can access dashboard (role-based visibility handled in Dashboard)
  return (
    <RoleGate
      allowedRoles={["Admin", "CEO", "Manager", "HR", "Employee"]}
      fallback={<NotAuthorized />}
    >
      {adminComponent}
    </RoleGate>
  );
}

export default function AppRouter() {
  const [route, setRoute] = useState<string>(window.location.hash || "#/");
  const [pathname, setPathname] = useState<string>(window.location.pathname);
  const { isAuthenticated, role, user } = useAuth();

  useEffect(() => {
    console.log("[AppRouter Debug] Route:", route, "isAuthenticated:", isAuthenticated, "role:", role, "user:", user);
    const onHash = () => setRoute(window.location.hash || "#/");
    const onPathChange = () => setPathname(window.location.pathname);
    window.addEventListener("hashchange", onHash);
    window.addEventListener("popstate", onPathChange);
    return () => {
      window.removeEventListener("hashchange", onHash);
      window.removeEventListener("popstate", onPathChange);
    };
  }, []);

  if (pathname.startsWith("/auth/callback")) {
    return <GoogleAuthCallback />;
  }

  if (pathname.startsWith("/settings/integrations")) {
    window.location.href = `/#/admin/meetings${window.location.search}`;
    return null;
  }

  if (isAdminRoute(route)) {
    if (!isAuthenticated) {
      window.location.hash = "#/login";
      return null;
    }

    return <AdminRoute route={route} />;
  }
  if (isRoleManagerRoute(route)) {
    if (!isAuthenticated) {
      window.location.hash = "#/login";
      return null;
    }

    return <Manager />;
  }

  // Generic profile route accessible to any authenticated user
  if (route.startsWith("#/profile")) {
    if (!isAuthenticated) {
      window.location.hash = "#/login";
      return null;
    }

    return <ProfilePage />;
  }

  if (route.startsWith("#/login")) {
    return <Login />;
  }

  if (route.startsWith("#/forgot-password")) {
    return <ForgotPassword />;
  }

  if (route.startsWith("#/reset-password")) {
    return <ResetPassword />;
  }

  if (route.startsWith("#/register")) {
    return <Register />;
  }

  if (route.startsWith("#/change-password")) {
    if (!isAuthenticated) {
      window.location.hash = "#/login";
      return null;
    }
    return <ChangePassword />;
  }

  if (route.startsWith("#/survey")) {
    if (!isAuthenticated) {
      window.location.hash = "#/login";
      return null;
    }
    return <Survey />;
  }

  return (
    <>
      <Homepage />
    </>
  );
}
