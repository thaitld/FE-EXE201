import { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { Eye, EyeOff, Lock, Loader2 } from "lucide-react";
import { useAuth } from "@/features/auth/AuthContext";
import {
  apiClient,
  type ApiResponse,
  type GoogleAuthUrlResponse,
  type LoginRequestDto,
  type LoginResponseDto,
} from "@/lib/api";

const backgroundVideo =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260325_094440_a3592600-bd1e-49e5-9bce-a73662061d83.mp4";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const { login, role } = useAuth();

  const canSubmit = useMemo(() => {
    return (
      email.trim().length > 0 && password.length > 0 && !isLoading && !submitted
    );
  }, [email, password, isLoading, submitted]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setIsLoading(true);
    setErrorMessage(null);

    const requestBody: LoginRequestDto = {
      email: email.trim(),
      password,
    };

    try {
      const response = await apiClient.post<ApiResponse<LoginResponseDto>>(
        "/auth/login",
        requestBody,
      );
      const token = response.data.data?.token;

      if (!response.data.succeeded || !token) {
        throw new Error(response.data.message || "Đăng nhập thất bại.");
      }

      login(requestBody.email, token);
      setSubmitted(true);
    } catch (error) {
      let message =
        "Không thể đăng nhập lúc này. Vui lòng kiểm tra lại email hoặc mật khẩu.";

      if (axios.isAxiosError(error)) {
        const responseData = error.response?.data as
          | ApiResponse<LoginResponseDto>
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

  const handleGoogleLogin = async () => {
    if (isLoading || submitted) return;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response =
        await apiClient.get<GoogleAuthUrlResponse>("/auth/google");
      const authUrl = response.data.authUrl;

      if (!authUrl) {
        throw new Error("Không thể khởi tạo đăng nhập Google.");
      }

      window.location.href = authUrl;
    } catch (error) {
      let message = "Không thể đăng nhập bằng Google lúc này.";

      if (axios.isAxiosError(error)) {
        message = error.response?.data?.message || message;
      } else if (error instanceof Error && error.message) {
        message = error.message;
      }

      setErrorMessage(message);
      setIsLoading(false);
    }
  };

  // Redirect to dashboard based on role after successful login
  useEffect(() => {
    if (submitted && role) {
      const redirectTimer = setTimeout(() => {
        // Redirect based on role
        if (role.toLowerCase() === "admin" || role.toLowerCase() === "ceo") {
          window.location.hash = "#/admin";
        } else if (
          role.toLowerCase() === "manager" ||
          role.toLowerCase() === "hr"
        ) {
          // TODO: Implement department dashboard
          window.location.hash = "#/admin";
        } else {
          // Employee and other roles
          // TODO: Implement personal dashboard
          window.location.hash = "#/admin";
        }
      }, 1500);
      return () => clearTimeout(redirectTimer);
    }
  }, [submitted, role]);

  return (
    <main
      className="relative min-h-screen flex items-center justify-center overflow-hidden text-white"
      style={{ fontFamily: "'Barlow', sans-serif" }}
    >
      {/* Background Video */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        src={backgroundVideo}
      />

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-slate-950/40" />
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/20 via-slate-950/35 to-slate-950/50" />

      <div className="relative w-full max-w-md px-6">
        <div className="liquid-glass relative overflow-hidden rounded-2xl p-8 shadow-[0_0_0_1px_rgba(148,163,184,0.12),0_20px_60px_rgba(0,0,0,0.4)]">
          <div className="absolute inset-x-0 top-0 h-24 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.18),transparent_60%)]" />

          <div className="relative mb-7 flex items-center gap-3">
            <div className="inline-flex items-center justify-center rounded-xl bg-emerald-200/90 p-2 text-slate-950 shadow-[0_0_22px_rgba(167,243,208,0.28)]">
              <Lock size={16} />
            </div>
            <div>
              <h3 className="text-lg font-semibold tracking-tight">
                Access Your Dashboard
              </h3>
              <p className="text-sm text-slate-200/75">
                Sign in to manage your team's wellbeing
              </p>
            </div>
          </div>

          {!submitted ? (
            <form onSubmit={handleSubmit} className="relative space-y-4">
              <div className="space-y-2">
                <label className="block text-sm text-slate-200">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  placeholder="you@yourcompany.com"
                  className="w-full rounded-xl border border-slate-700/70 bg-slate-900/70 px-4 py-2.5 text-slate-100 outline-none transition focus:ring-2 focus:ring-emerald-300/70"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm text-slate-200">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-slate-700/70 bg-slate-900/70 px-4 py-2.5 pr-11 text-slate-100 outline-none transition focus:ring-2 focus:ring-emerald-300/70"
                  />

                  <button
                    type="button"
                    className="absolute inset-y-0 right-2 inline-flex items-center justify-center rounded-lg px-2 text-slate-300/90 transition hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-emerald-300/60"
                    onClick={() => setShowPassword((s) => !s)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-slate-200">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-600"
                    disabled={isLoading}
                  />
                  Keep me signed in
                </label>
                <a
                  href="#/forgot-password"
                  className="text-sm font-medium text-emerald-200/90 hover:text-emerald-100"
                >
                  Forgot password?
                </a>
              </div>

              {errorMessage ? (
                <div className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
                  {errorMessage}
                </div>
              ) : null}

              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isLoading || submitted}
                className="flex w-full items-center justify-center gap-2 rounded-full border border-slate-700/70 bg-slate-900/60 px-4 py-2.5 font-semibold text-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.18)] transition hover:border-slate-500 hover:bg-slate-900/80 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <svg className="h-4 w-4" viewBox="0 0 48 48" aria-hidden="true">
                  <path
                    fill="#FFC107"
                    d="M43.6 20.1H42V20H24v8h11.3C33.7 32.9 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.1 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.1-.4-3.9z"
                  />
                  <path
                    fill="#FF3D00"
                    d="M6.3 14.7l6.6 4.8C14.7 15.9 18.9 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.1 6.1 29.3 4 24 4 16.3 4 9.5 8.3 6.3 14.7z"
                  />
                  <path
                    fill="#4CAF50"
                    d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5c-2 1.3-4.5 2.2-7.2 2.2-5.2 0-9.7-3.1-11.7-7.6l-6.5 5C8.8 39.5 15.7 44 24 44z"
                  />
                  <path
                    fill="#1976D2"
                    d="M43.6 20.1H42V20H24v8h11.3c-1 2.8-2.9 5-5.5 6.4l.1-.1 6.2 5C35.7 37.1 40 32 40 24c0-1.3-.1-2.1-.4-3.9z"
                  />
                </svg>
                Continue with Google
              </button>

              <button
                type="submit"
                disabled={!canSubmit}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-emerald-200 to-cyan-200 px-4 py-2.5 font-semibold text-slate-950 shadow-[0_12px_35px_rgba(16,185,129,0.18)] transition hover:brightness-105 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : null}
                {isLoading ? "Signing in…" : "Sign in"}
              </button>

              <p className="text-center text-xs text-slate-200/60">
                By signing in, you agree to our{" "}
                <a
                  className="text-emerald-200/90 hover:text-emerald-100"
                  href="#"
                >
                  Terms of Service
                </a>{" "}
                and{" "}
                <a
                  className="text-emerald-200/90 hover:text-emerald-100"
                  href="#"
                >
                  Privacy Policy
                </a>
              </p>
              <a
                href="#/"
                className="mt-4 block text-center text-sm font-medium text-emerald-200 hover:text-emerald-100"
              >
                ← Return to homepage
              </a>

              <p className="text-center text-xs text-slate-200/60">
                New to MANTO?{" "}
                <a
                  className="text-emerald-200/90 hover:text-emerald-100"
                  href="#/register"
                >
                  Create an account
                </a>
              </p>
            </form>
          ) : (
            <div className="text-center py-6">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-200/90 text-slate-950 shadow-[0_0_26px_rgba(167,243,208,0.22)]">
                <Lock size={18} />
              </div>
              <h4 className="mt-4 text-lg font-semibold tracking-tight">
                Welcome to MANTO
              </h4>
              <p className="mt-2 text-sm text-slate-200/80">
                Your login is successful. Redirecting to your dashboard...
              </p>
              <div className="mt-6 flex items-center justify-center gap-1.5">
                <div
                  className="h-1.5 w-1.5 rounded-full bg-emerald-300 animate-bounce"
                  style={{ animationDelay: "0s" }}
                />
                <div
                  className="h-1.5 w-1.5 rounded-full bg-emerald-300 animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                />
                <div
                  className="h-1.5 w-1.5 rounded-full bg-emerald-300 animate-bounce"
                  style={{ animationDelay: "0.4s" }}
                />
              </div>

              <p className="mt-6 text-center text-xs text-slate-200/60">
                If you are not redirected automatically,{" "}
                <a
                  className="text-emerald-200/90 hover:text-emerald-100"
                  href="#/admin"
                >
                  click here
                </a>{" "}
                to access your dashboard
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
