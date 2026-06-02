import { useMemo, useRef, useState, type FormEvent } from "react";
import { Loader2, Lock, CheckCircle2 } from "lucide-react";
import axios from "axios";
import { useAuth } from "@/features/auth/AuthContext";
import { apiClient, type ApiResponse } from "@/lib/api";

const backgroundVideo =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260325_094440_a3592600-bd1e-49e5-9bce-a73662061d83.mp4";

interface ChangePasswordDto {
  oldPassword?: string;
  newPassword: string;
  confirmNewPassword: string;
}

export default function ChangePassword() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const { isAuthenticated } = useAuth();

  const canSubmit = useMemo(() => {
    return (
      oldPassword.length > 0 &&
      newPassword.length >= 8 &&
      confirmNewPassword.length > 0 &&
      newPassword === confirmNewPassword &&
      !isLoading &&
      !submitted
    );
  }, [oldPassword, newPassword, confirmNewPassword, isLoading, submitted]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit || !isAuthenticated) return;

    setIsLoading(true);
    setErrorMessage(null);

    const requestBody: ChangePasswordDto = {
      oldPassword,
      newPassword,
      confirmNewPassword,
    };

    try {
      const response = await apiClient.post<ApiResponse<null>>(
        "/auth/change-password",
        requestBody,
      );

      if (!response.data.succeeded) {
        throw new Error(response.data.message || "Không thể đổi mật khẩu.");
      }

      setSubmitted(true);
    } catch (error) {
      let message =
        "Không thể đổi mật khẩu lúc này. Vui lòng kiểm tra lại thông tin.";

      if (axios.isAxiosError(error)) {
        const responseData = error.response?.data as
          | ApiResponse<null>
          | undefined;
        message = responseData?.message || message;
      } else if (error instanceof Error && error.message) {
        message = error.message;
      }

      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Redirect to profile after successful change
  if (submitted) {
    return (
      <main
        className="relative flex min-h-screen items-center justify-center overflow-hidden text-white"
        style={{ fontFamily: "'Barlow', sans-serif" }}
      >
        <video
          ref={videoRef}
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          src={backgroundVideo}
        />

        <div className="absolute inset-0 bg-slate-950/45" />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/20 via-slate-950/35 to-slate-950/55" />

        <div className="relative w-full max-w-md px-6">
          <div className="liquid-glass relative overflow-hidden rounded-2xl p-8 shadow-[0_0_0_1px_rgba(148,163,184,0.12),0_20px_60px_rgba(0,0,0,0.4)]">
            <div className="absolute inset-x-0 top-0 h-24 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.18),transparent_60%)]" />

            <div className="relative mb-7 flex items-center justify-center">
              <div className="inline-flex items-center justify-center rounded-xl bg-emerald-200/90 p-3 text-slate-950 shadow-[0_0_22px_rgba(167,243,208,0.28)]">
                <CheckCircle2 size={24} />
              </div>
            </div>

            <h3 className="relative text-center text-lg font-semibold tracking-tight">
              Mật khẩu đã thay đổi
            </h3>
            <p className="relative mt-3 text-center text-sm text-slate-200/75">
              Mật khẩu của bạn đã được cập nhật thành công. Đang chuyển hướng...
            </p>

            {/* Auto redirect after 2 seconds */}
            {typeof window !== "undefined" &&
              setTimeout(() => {
                window.location.hash = "#/admin/profile";
              }, 2000)}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main
      className="relative flex min-h-screen items-center justify-center overflow-hidden text-white"
      style={{ fontFamily: "'Barlow', sans-serif" }}
    >
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        src={backgroundVideo}
      />

      <div className="absolute inset-0 bg-slate-950/45" />
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/20 via-slate-950/35 to-slate-950/55" />

      <div className="relative w-full max-w-md px-6">
        <div className="liquid-glass relative overflow-hidden rounded-2xl p-8 shadow-[0_0_0_1px_rgba(148,163,184,0.12),0_20px_60px_rgba(0,0,0,0.4)]">
          <div className="absolute inset-x-0 top-0 h-24 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.18),transparent_60%)]" />

          <form onSubmit={handleSubmit} className="relative space-y-4">
            <div className="relative mb-7 flex items-center gap-3">
              <div className="inline-flex items-center justify-center rounded-xl bg-emerald-200/90 p-2 text-slate-950 shadow-[0_0_22px_rgba(167,243,208,0.28)]">
                <Lock size={16} />
              </div>
              <div>
                <h3 className="text-lg font-semibold tracking-tight">
                  Change your password
                </h3>
                <p className="text-sm text-slate-200/75">
                  Update your password to keep your account secure
                </p>
              </div>
            </div>

            {errorMessage && (
              <div className="rounded-lg border border-red-500/50 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {errorMessage}
              </div>
            )}

            {/* Old Password */}
            <div className="space-y-2">
              <label className="block text-sm text-slate-200">
                Current Password
              </label>
              <div className="relative">
                <Lock
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  size={16}
                />
                <input
                  type={showOldPassword ? "text" : "password"}
                  required
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  disabled={isLoading}
                  placeholder="Enter your current password"
                  className="w-full rounded-xl border border-slate-700/70 bg-slate-900/70 px-4 py-2.5 pl-11 pr-11 text-slate-100 outline-none transition focus:ring-2 focus:ring-emerald-300/70"
                />
                <button
                  type="button"
                  onClick={() => setShowOldPassword(!showOldPassword)}
                  disabled={isLoading}
                  className="pointer-events-auto absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-200"
                >
                  {showOldPassword ? <Lock size={16} /> : <Lock size={16} />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div className="space-y-2">
              <label className="block text-sm text-slate-200">
                New Password
              </label>
              <div className="relative">
                <Lock
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  size={16}
                />
                <input
                  type={showNewPassword ? "text" : "password"}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={isLoading}
                  placeholder="At least 8 characters"
                  className="w-full rounded-xl border border-slate-700/70 bg-slate-900/70 px-4 py-2.5 pl-11 pr-11 text-slate-100 outline-none transition focus:ring-2 focus:ring-emerald-300/70"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  disabled={isLoading}
                  className="pointer-events-auto absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-200"
                >
                  {showNewPassword ? <Lock size={16} /> : <Lock size={16} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <label className="block text-sm text-slate-200">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  size={16}
                />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  disabled={isLoading}
                  placeholder="Confirm your new password"
                  className="w-full rounded-xl border border-slate-700/70 bg-slate-900/70 px-4 py-2.5 pl-11 pr-11 text-slate-100 outline-none transition focus:ring-2 focus:ring-emerald-300/70"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isLoading}
                  className="pointer-events-auto absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-200"
                >
                  {showConfirmPassword ? (
                    <Lock size={16} />
                  ) : (
                    <Lock size={16} />
                  )}
                </button>
              </div>
            </div>

            {newPassword !== confirmNewPassword &&
              confirmNewPassword.length > 0 && (
                <div className="text-sm text-red-400">
                  Passwords do not match
                </div>
              )}

            <button
              type="submit"
              disabled={!canSubmit}
              className="relative mt-6 w-full rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 py-2.5 font-medium text-white shadow-lg transition disabled:opacity-50"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 size={16} className="animate-spin" />
                  Updating...
                </span>
              ) : (
                "Update Password"
              )}
            </button>

            <div className="relative flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => (window.location.hash = "#/admin/profile")}
                className="text-sm text-slate-300 transition hover:text-slate-100"
              >
                ← Back to Profile
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
