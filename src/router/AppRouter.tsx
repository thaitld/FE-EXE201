import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import Homepage from "../pages/Homepage";
import Footer from "../components/Footer";
import Login from "../pages/Login";
import ForgotPassword from "../pages/ForgotPassword";
import ResetPassword from "../pages/ResetPassword";
import ChangePassword from "../pages/ChangePassword";
import GoogleAuthCallback from "../pages/GoogleAuthCallback";
import NotAuthorized from "../pages/NotAuthorized";
import Admin from "../pages/Admin";
import AdminDashboard from "@/pages/roles/admin/Dashboard";
import AdminUsers from "@/pages/roles/admin/Users";
import AdminTeams from "@/pages/roles/admin/Teams";
import AdminDepartments from "@/pages/roles/admin/Departments";
import RoleGate from "@/components/RoleGate";

function isAdminRoute(route: string) {
  return route.startsWith("#/admin");
}

function isRoleAdminRoute(route: string) {
  return route.startsWith("#/roles/admin");
}

function AdminRoute({ route }: { route: string }) {
  const adminComponent = (() => {
    if (route.startsWith("#/admin/user-management")) {
      return <Admin initialTab="user-management" />;
    }

    if (route.startsWith("#/admin/profile")) {
      return <Admin initialTab="profile" />;
    }

    return <Admin />;
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

  if (isRoleAdminRoute(route)) {
    if (!isAuthenticated) {
      window.location.hash = "#/login";
      return null;
    }

    if (route.startsWith("#/roles/admin/users")) return <AdminUsers />;
    if (route.startsWith("#/roles/admin/departments"))
      return <AdminDepartments />;
    if (route.startsWith("#/roles/admin/teams")) return <AdminTeams />;
    return <AdminDashboard />;
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

  return (
    <>
      <Homepage />
      <Footer />
    </>
  );
}
