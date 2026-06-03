import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import Homepage from "@/pages/shared/Homepage";
import Footer from "@/components/layout/Footer";
import Login from "@/pages/auth/Login";
import ForgotPassword from "@/pages/auth/ForgotPassword";
import ResetPassword from "@/pages/auth/ResetPassword";
import ChangePassword from "@/pages/shared/ChangePassword";
import GoogleAuthCallback from "@/pages/auth/GoogleAuthCallback";
import NotAuthorized from "@/pages/shared/NotAuthorized";
import Dashboard from "@/pages/Dashboard";
import RoleGate from "@/features/auth/RoleGate";
import Survey from "@/components/panels/employee/Survey";

function isAdminRoute(route: string) {
  return route.startsWith("#/admin");
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

    return <Dashboard />;
  })();

  // All authenticated users can access dashboard (role-based visibility handled in Admin.tsx)
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
  const { isAuthenticated } = useAuth();

  useEffect(() => {
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

  if (isAdminRoute(route)) {
    if (!isAuthenticated) {
      window.location.hash = "#/login";
      return null;
    }

    return <AdminRoute route={route} />;
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
      <Footer />
    </>
  );
}
