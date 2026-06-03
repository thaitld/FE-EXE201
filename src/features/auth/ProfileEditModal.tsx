import React, { useState } from "react";
import { apiClient, type ApiResponse } from "@/lib/api";

export default function ProfileEditModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  React.useEffect(() => {
    if (open) {
      setFirstName("");
      setLastName("");
      setError(null);
      setSuccess(null);
    }
  }, [open]);

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
      const resp = await apiClient.put<ApiResponse<null>>("/users/me", payload);
      if (resp.data.succeeded) {
        setSuccess("Profile updated successfully");
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
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md rounded-2xl bg-white p-6">
        <h3 className="text-lg font-semibold">Edit profile</h3>
        <p className="text-sm text-slate-500 mt-1">
          Update your first and last name.
        </p>
        <div className="mt-4 space-y-3">
          <div>
            <label className="block text-sm text-slate-600">First name</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="John"
              className="mt-1 w-full rounded-md border px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-600">Last name</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Doe"
              className="mt-1 w-full rounded-md border px-3 py-2"
            />
          </div>
          {error ? <div className="text-sm text-rose-600">{error}</div> : null}
          {success ? (
            <div className="text-sm text-green-600">{success}</div>
          ) : null}
        </div>
        <div className="mt-6 flex gap-2 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-md"
            disabled={isSaving}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
