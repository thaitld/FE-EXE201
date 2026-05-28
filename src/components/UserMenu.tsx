import { useMemo, useRef, useEffect, useState } from "react";
import {
  ChevronDown,
  LogOut,
  TrendingUp,
  Settings,
  Shield,
  User,
  Bell,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import type { UserDto } from "@/lib/api";

interface UserMenuProps {
  user: UserDto | null;
  userEmail: string | null;
  profileName: string;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  unreadCount?: number;
}

export default function UserMenu({
  user,
  userEmail,
  profileName,
  activeTab = "overview",
  onTabChange = () => {},
  unreadCount = 0,
}: UserMenuProps) {
  const { logout, role } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement | null>(null);

  const userInitials = useMemo(() => {
    if (!profileName) return "MU";
    const parts = profileName.split(" ").filter(Boolean);
    const initials = (parts[0]?.charAt(0) ?? "") + (parts[1]?.charAt(0) ?? "");
    return initials.toUpperCase() || "MU";
  }, [profileName]);

  const profileRole = useMemo(() => {
    return role ?? user?.roleName ?? "User";
  }, [role, user]);

  useEffect(() => {
    const onDocumentClick = (event: MouseEvent) => {
      if (!profileRef.current) return;
      if (!profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", onDocumentClick);
    return () => document.removeEventListener("mousedown", onDocumentClick);
  }, []);

  const handleLogout = () => {
    logout();
    window.location.hash = "#/";
  };

  const handleProfileAction = (tab: string) => {
    onTabChange(tab);
    setProfileOpen(false);
  };

  return (
    <div className="relative" ref={profileRef}>
      <button
        type="button"
        className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 transition hover:bg-slate-100"
        onClick={() => setProfileOpen((value) => !value)}
      >
        <div className="hidden text-right sm:block">
          <p className="text-base font-semibold text-blue-900 leading-tight">
            {profileName}
          </p>
          <p className="text-sm text-slate-500 leading-tight">{profileRole}</p>
        </div>
        <div className="inline-flex h-10 w-10 items-center justify-center rounded-full overflow-hidden bg-blue-600 text-sm font-bold text-white">
          {user?.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt="avatar"
              className="h-full w-full object-cover"
            />
          ) : (
            <span>{userInitials}</span>
          )}
        </div>
        <ChevronDown
          size={16}
          className={`text-slate-400 transition-transform ${profileOpen ? "rotate-180" : ""}`}
        />
      </button>

      {profileOpen ? (
        <div className="absolute right-0 z-50 mt-3 w-80 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_20px_45px_rgba(15,23,42,0.16)]">
          {/* Profile Card */}
          <div className="border-b border-slate-200 bg-slate-50 px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full overflow-hidden bg-blue-600 text-base font-bold text-white">
                {user?.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt="avatar"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span>{userInitials}</span>
                )}
              </div>
              <div>
                <p className="text-2xl font-semibold leading-tight text-blue-900">
                  {profileName}
                </p>
                <p className="text-sm text-slate-600">
                  {user?.email ?? userEmail ?? "unknown@manto.local"}
                </p>
              </div>
            </div>
            <div className="mt-3 inline-flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700">
              <Shield size={14} />
              Current Role: {profileRole}
            </div>
          </div>

          {/* Menu Items */}
          <div className="px-3 py-2">
            <button
              type="button"
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-slate-700 transition hover:bg-slate-100"
              onClick={() => {
                window.location.hash = "#/admin/profile";
                handleProfileAction("profile");
              }}
            >
              <User size={16} />
              <span className="font-medium">Profile</span>
            </button>
            <button
              type="button"
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-slate-700 transition hover:bg-slate-100"
              onClick={() => handleProfileAction("performance")}
            >
              <TrendingUp size={16} />
              <span className="font-medium">My Performance</span>
            </button>
            <button
              type="button"
              className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-slate-700 transition hover:bg-slate-100"
              onClick={() => setProfileOpen(false)}
            >
              <span className="inline-flex items-center gap-3">
                <Bell size={16} />
                <span className="font-medium">Notifications</span>
              </span>
              {unreadCount > 0 ? (
                <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-rose-500 px-1 text-xs font-bold text-white">
                  {unreadCount}
                </span>
              ) : null}
            </button>
            <button
              type="button"
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-slate-700 transition hover:bg-slate-100"
              onClick={() => handleProfileAction("settings")}
            >
              <Settings size={16} />
              <span className="font-medium">Settings</span>
            </button>
          </div>

          {/* Logout */}
          <div className="border-t border-slate-200 px-3 py-2">
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left font-semibold text-rose-600 transition hover:bg-rose-50"
            >
              <LogOut size={16} />
              Log Out
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
