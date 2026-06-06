import React from "react";
import { Shield, Bell, Edit3, ArrowLeft, Building, Users, Calendar, Award, Mail } from "lucide-react";
import { useAuth } from "@/features/auth/AuthContext";
import ProfileEditModal from "@/features/auth/ProfileEditModal";
import ChangePasswordModal from "@/features/auth/ChangePasswordModal";
import { apiClient, type ApiResponse } from "@/lib/api";

export default function ProfilePage() {
  const { user, refreshUser, role } = useAuth();

  const profileName = React.useMemo(() => {
    if (user?.firstName || user?.lastName)
      return `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim();
    if (user?.email) {
      const localPart = user.email.split("@")[0] ?? "";
      return localPart
        .split(/[._-]/)
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");
    }
    return "MANTO User";
  }, [user]);

  const userInitials = React.useMemo(() => {
    if (user?.firstName || user?.lastName) {
      const parts = `${user?.firstName ?? ""} ${user?.lastName ?? ""}`
        .trim()
        .split(" ")
        .filter(Boolean);
      const initials =
        (parts[0]?.charAt(0) ?? "") + (parts[1]?.charAt(0) ?? "");
      return initials.toUpperCase() || "MU";
    }
    return (user?.email?.charAt(0) ?? "M").toUpperCase();
  }, [user]);

  const profileRole = role ?? user?.roleName ?? "User";
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  const triggerInput = () => inputRef.current?.click();

  const handleHeaderFile = async (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    if (file.size > 5 * 1024 * 1024) return;

    const form = new FormData();
    form.append("file", file);
    try {
      const resp = await apiClient.patch<ApiResponse<string>>(
        "/users/me/avatar",
        form,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );
      if (resp.data.succeeded && resp.data.data) {
        const url = resp.data.data;
        setPreviewUrl(url);
        await refreshUser();
      }
    } catch {
      // ignore
    }
  };

  React.useEffect(() => {
    if (user?.avatarUrl) {
      setPreviewUrl(user.avatarUrl);
    }
  }, [user?.avatarUrl]);

  React.useEffect(() => {
    if (!user) {
      window.location.hash = "#/login";
    }
  }, [user]);

  const handleBack = (e: React.MouseEvent) => {
    e.preventDefault();
    window.history.back();
  };

  const isStandalone = !window.location.hash.startsWith("#/admin") && !window.location.hash.startsWith("#/roles/manager");

  const cardContent = (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 md:p-8 shadow-[0_10px_30px_rgba(0,0,0,0.04)] space-y-8 text-slate-700">
      {/* Header row */}
      <div className="flex flex-col md:flex-row items-center gap-6 justify-between border-b border-slate-100 pb-8">
        <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
          <div className="relative group">
            <AvatarBadge
              src={previewUrl ?? user?.avatarUrl ?? null}
              initials={userInitials}
              onClick={triggerInput}
            />
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                handleHeaderFile(f);
                e.currentTarget.value = "";
              }}
            />
            <button
              type="button"
              onClick={async () => {
                if (!confirm("Delete avatar and revert to default?")) return;
                try {
                  await apiClient.delete("/users/me/avatar");
                  setPreviewUrl(null);
                  await refreshUser();
                } catch {
                  // ignore
                }
              }}
              className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-white hover:bg-rose-50 border border-slate-200 px-2 py-0.5 rounded-full text-[10px] text-rose-600 whitespace-nowrap hover:text-rose-700 transition-colors shadow-sm"
            >
              Delete Avatar
            </button>
          </div>
          <div className="space-y-2 mt-4 md:mt-0">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              {profileName}
            </h1>
            <div className="flex flex-wrap justify-center md:justify-start gap-3 items-center">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 border border-slate-200 px-3 py-1 text-sm font-semibold text-slate-600">
                <Mail size={14} className="text-slate-400" />
                {user?.email ?? "unknown@manto.local"}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-100 px-3 py-1 text-sm font-semibold text-blue-600">
                <Shield size={14} />
                Role: {profileRole}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-row gap-3 w-full md:w-auto justify-center">
          <ProfileEditModalHolder />
          <ChangePasswordHolder />
        </div>
      </div>

      {/* Details Section */}
      <div className="space-y-6">
        <h2 className="text-lg font-semibold text-slate-900">Workplace Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 bg-slate-50/50">
            <div className="p-3 rounded-xl bg-purple-50 border border-purple-100 text-purple-600">
              <Building size={20} />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Department</p>
              <p className="font-semibold text-slate-800 mt-0.5">{user?.departmentName || "No Department Assigned"}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 bg-slate-50/50">
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600">
              <Users size={20} />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Team</p>
              <p className="font-semibold text-slate-800 mt-0.5">{user?.teamName || "No Team Assigned"}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 bg-slate-50/50">
            <div className="p-3 rounded-xl bg-orange-50 border border-orange-100 text-orange-600">
              <Award size={20} />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Role In Team</p>
              <p className="font-semibold text-slate-800 mt-0.5">{user?.roleInTeam || "Member"}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 bg-slate-50/50">
            <div className="p-3 rounded-xl bg-blue-50 border border-blue-100 text-blue-600">
              <Calendar size={20} />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Member Since</p>
              <p className="font-semibold text-slate-800 mt-0.5">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "N/A"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick tips / info banner */}
      <div className="rounded-2xl border border-blue-100 bg-blue-50/30 p-4 flex gap-3 text-sm text-blue-800">
        <Bell size={18} className="text-blue-500 flex-shrink-0 mt-0.5" />
        <p>
          To change your display picture, click on the circular avatar badge above. You can upload files up to 5MB (PNG, JPG, JPEG).
        </p>
      </div>
    </div>
  );

  if (isStandalone) {
    return (
      <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Back Button */}
          <div className="flex items-center justify-between">
            <button
              onClick={handleBack}
              className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors duration-200 text-sm font-medium bg-transparent border-0 cursor-pointer p-0"
            >
              <ArrowLeft size={16} />
              Back
            </button>
          </div>
          {cardContent}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {cardContent}
    </div>
  );
}

function ProfileEditModalHolder() {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 transition duration-200"
      >
        <Edit3 size={16} />
        <span>Edit Profile</span>
      </button>
      <ProfileEditModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}

function ChangePasswordHolder() {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition duration-200"
      >
        Change Password
      </button>
      <ChangePasswordModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}

function AvatarBadge({
  src,
  initials,
  onClick,
}: {
  src: string | null;
  initials: string;
  onClick: () => void;
}) {
  const [imageFailed, setImageFailed] = React.useState(false);

  React.useEffect(() => {
    setImageFailed(false);
  }, [src]);

  return (
    <button
      type="button"
      onClick={onClick}
      className="relative flex h-24 w-24 items-center justify-center rounded-full overflow-hidden cursor-pointer bg-gradient-to-br from-blue-500 to-indigo-600 text-3xl font-extrabold text-white border-2 border-white shadow-md hover:brightness-95 transition duration-200"
      title="Click to change avatar"
    >
      {src && !imageFailed ? (
        <img
          src={src}
          alt="avatar"
          className="h-full w-full object-cover"
          onError={() => setImageFailed(true)}
        />
      ) : (
        <span>{initials}</span>
      )}
    </button>
  );
}

