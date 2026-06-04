import React, { useState } from "react";
import { apiClient, type ApiResponse } from "@/lib/api";
import { useAuth } from "@/features/auth/AuthContext";

export default function ProfileEditModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { user, refreshUser } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  React.useEffect(() => {
    if (open) {
      setFirstName(user?.firstName || "");
      setLastName(user?.lastName || "");
      setError(null);
      setSuccess(null);
    }
  }, [open, user]);

  const handleSubmit = async () => {
    setError(null);
    setSuccess(null);
    if (!firstName && !lastName) {
      setError("Please provide at least one field");
      return;
    }
    setIsSaving(true);
    try {
      const payload = {
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
      };
      const resp = await apiClient.patch<ApiResponse<null>>("/users/me", payload);
      if (resp.data.succeeded) {
        setSuccess("Profile updated successfully");
        await refreshUser();
        setTimeout(() => {
          onClose();
        }, 1000);
      } else {
        setError(resp.data.message || "Failed to update profile");
      }
    } catch (e) {
      setError("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity duration-300" 
        onClick={onClose} 
      />
      
      {/* Modal Container */}
      <div className="relative z-10 w-full max-w-md transform overflow-hidden rounded-3xl border border-slate-800 bg-slate-950 p-6 md:p-8 shadow-[0_25px_60px_rgba(0,0,0,0.5)] transition-all duration-300">
        
        {/* Header */}
        <div className="space-y-1.5 pb-4 border-b border-slate-850">
          <h3 className="text-xl font-bold text-white tracking-tight">Edit Profile</h3>
          <p className="text-sm text-slate-400">
            Update your first and last name.
          </p>
        </div>

        {/* Inputs */}
        <div className="mt-6 space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">First Name</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="First name"
              className="w-full rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3 text-sm text-white placeholder-slate-600 outline-none transition duration-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Last Name</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Last name"
              className="w-full rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3 text-sm text-white placeholder-slate-600 outline-none transition duration-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Messages */}
          {error ? (
            <div className="rounded-xl border border-rose-900/30 bg-rose-950/20 px-4 py-3 text-sm font-medium text-rose-400">
              {error}
            </div>
          ) : null}
          {success ? (
            <div className="rounded-xl border border-green-900/30 bg-green-950/20 px-4 py-3 text-sm font-medium text-green-400">
              {success}
            </div>
          ) : null}
        </div>

        {/* Actions */}
        <div className="mt-8 flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-850 bg-slate-950 px-5 text-sm font-semibold text-slate-400 hover:border-slate-700 hover:text-white transition duration-200"
            disabled={isSaving}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="inline-flex h-11 items-center justify-center rounded-xl bg-blue-600 px-6 text-sm font-semibold text-white hover:bg-blue-500 shadow-lg shadow-blue-500/10 transition duration-200 disabled:opacity-50 disabled:pointer-events-none"
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
