import { useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import { useAuth } from '@/features/auth/AuthContext';
import { apiClient, type ApiResponse, type LoginResponseDto, type GoogleAuthUrlResponse } from '@/lib/api';
import { Lock, Eye, EyeOff, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

const backgroundVideo =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260325_094440_a3592600-bd1e-49e5-9bce-a73662061d83.mp4";

export default function CustomerLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { login, role } = useAuth();
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const handleGoogleLogin = async () => {
    if (isLoading || success) return;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await apiClient.get<GoogleAuthUrlResponse>('/auth/google');
      const authUrl = response.data.authUrl;

      if (!authUrl) {
        throw new Error('Không thể khởi tạo đăng nhập Google.');
      }

      window.location.href = authUrl;
    } catch (error) {
      let message = 'Không thể đăng nhập bằng Google lúc này.';

      if (axios.isAxiosError(error)) {
        message = error.response?.data?.message || message;
      } else if (error instanceof Error && error.message) {
        message = error.message;
      }

      setErrorMessage(message);
      setIsLoading(false);
    }
  };

  // Parse query parameters from search or hash
  const queryParams = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    const hash = window.location.hash;
    const hashQuestionIndex = hash.indexOf('?');
    if (hashQuestionIndex !== -1) {
      const hashParams = new URLSearchParams(hash.substring(hashQuestionIndex + 1));
      for (const [key, value] of hashParams.entries()) {
        params.set(key, value);
      }
    }
    return params;
  }, []);

  const registered = useMemo(() => queryParams.get('registered') === 'true', [queryParams]);
  const redirectPath = useMemo(() => queryParams.get('redirect'), [queryParams]);

  const canSubmit = useMemo(() => {
    return email.trim().length > 0 && password.length > 0 && !isLoading;
  }, [email, password, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await apiClient.post<ApiResponse<LoginResponseDto>>(
        '/auth/login',
        { email: email.trim(), password }
      );
      const token = response.data.data?.token;

      if (!response.data.succeeded || !token) {
        throw new Error(response.data.message || 'Đăng nhập thất bại.');
      }

      await login(email.trim(), token);
      setSuccess(true);
    } catch (error: any) {
      let message = 'Không thể đăng nhập lúc này. Vui lòng kiểm tra lại email hoặc mật khẩu.';
      if (axios.isAxiosError(error)) {
        message = error.response?.data?.message || message;
      } else if (error instanceof Error) {
        message = error.message;
      }
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Redirect logic on success login
  useEffect(() => {
    if (success && role) {
      const targetRole = Array.isArray(role) ? role[0] : role;
      const isCustomer = typeof targetRole === 'string' && targetRole.toLowerCase() === 'customer';

      const timer = setTimeout(() => {
        if (isCustomer) {
          if (redirectPath) {
            window.location.hash = `#${decodeURIComponent(redirectPath)}`;
          } else {
            window.location.hash = '#/orders';
          }
        } else {
          // If not customer, redirect to normal admin dashboard
          const lowerRole = typeof targetRole === 'string' ? targetRole.toLowerCase() : '';
          if (lowerRole === 'superadmin') {
            window.location.hash = '#/super';
          } else if (lowerRole === 'manager') {
            window.location.hash = '#/roles/manager';
          } else {
            window.location.hash = '#/admin';
          }
        }
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [success, role, redirectPath]);

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
                Đăng Nhập Khách Hàng
              </h3>
              <p className="text-sm text-slate-200/75 font-normal">
                Cổng thanh toán và quản lý gói dịch vụ doanh nghiệp
              </p>
            </div>
          </div>

          {registered && !success && (
            <div className="relative z-10 mb-6 flex items-start gap-3 bg-emerald-950/60 border border-emerald-500/20 text-emerald-200 text-sm px-4 py-3 rounded-xl">
              <CheckCircle2 size={18} className="shrink-0 mt-0.5 text-emerald-400" />
              <span>Đăng ký tài khoản thành công! Vui lòng nhập thông tin để đăng nhập.</span>
            </div>
          )}

          {success ? (
            <div className="text-center py-6 relative z-10">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-200/90 text-slate-950 shadow-[0_0_26px_rgba(167,243,208,0.22)]">
                <Lock size={18} />
              </div>
              <h4 className="mt-4 text-lg font-semibold tracking-tight">
                Đăng nhập thành công!
              </h4>
              <p className="mt-2 text-sm text-slate-200/80">
                Đang chuẩn bị không gian làm việc của bạn...
              </p>
              <div className="mt-6 flex items-center justify-center gap-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-300 animate-bounce" style={{ animationDelay: '0s' }} />
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-300 animate-bounce" style={{ animationDelay: '0.2s' }} />
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-300 animate-bounce" style={{ animationDelay: '0.4s' }} />
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="relative space-y-4">
              {errorMessage && (
                <div className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
                  {errorMessage}
                </div>
              )}

              {/* Email */}
              <div className="space-y-2">
                <label className="block text-sm text-slate-200">
                  Địa chỉ Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full rounded-xl border border-slate-700/70 bg-slate-900/70 px-4 py-2.5 text-slate-100 outline-none transition focus:ring-2 focus:ring-emerald-300/70"
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label className="block text-sm text-slate-200">Mật khẩu</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-slate-700/70 bg-slate-900/70 px-4 py-2.5 pr-11 text-slate-100 outline-none transition focus:ring-2 focus:ring-emerald-300/70"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-2 inline-flex items-center justify-center rounded-lg px-2 text-slate-300/90 transition hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-emerald-300/60"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
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
                  Duy trì đăng nhập
                </label>
                <a
                  href="#/forgot-password"
                  className="text-sm font-medium text-emerald-200/90 hover:text-emerald-100"
                >
                  Quên mật khẩu?
                </a>
              </div>

              {/* Google Login button */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isLoading || success}
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
                {isLoading ? "Đang đăng nhập…" : "Đăng Nhập"}
              </button>

              <p className="text-center text-xs text-slate-200/60 leading-normal">
                Bằng việc đăng nhập, bạn đồng ý với các{' '}
                <a className="text-emerald-200/90 hover:text-emerald-100" href="#">
                  Điều khoản dịch vụ
                </a>{' '}
                và{' '}
                <a className="text-emerald-200/90 hover:text-emerald-100" href="#">
                  Chính sách bảo mật
                </a>{' '}
                của chúng tôi.
              </p>

              <a
                href="#/pricing"
                className="mt-4 block text-center text-sm font-medium text-emerald-200 hover:text-emerald-100"
              >
                ← Xem bảng giá công khai
              </a>

              <p className="text-center text-xs text-slate-200/60 mt-2">
                Chưa có tài khoản?{' '}
                <a
                  className="text-emerald-200/90 hover:text-emerald-100"
                  href="#/customer/register"
                >
                  Đăng ký ngay tại đây
                </a>
              </p>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
