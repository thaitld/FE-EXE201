import { useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import { useAuth } from '@/features/auth/AuthContext';
import { apiClient, type ApiResponse, type LoginResponseDto } from '@/lib/api';
import { Lock, Eye, EyeOff, Loader2, CheckCircle2, Sparkles, CreditCard, ShieldCheck, ChevronLeft } from 'lucide-react';

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

  // Parse query parameters from search or hash
  const queryParams = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    const hash = window.location.hash;
    const hashQuestionIndex = hash.indexOf('?');
    if (hashQuestionIndex !== -1) {
      const hashParams = new URLSearchParams(hash.substring(hashQuestionIndex + 1));
      hashParams.forEach((value, key) => {
        params.set(key, value);
      });
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
        throw new Error(response.data.message || 'Login failed.');
      }

      await login(email.trim(), token);
      setSuccess(true);
    } catch (error: any) {
      let message = 'Unable to sign in. Please verify your email and password.';
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
    <main className="min-h-screen w-full flex bg-slate-950 text-white font-sans overflow-hidden">
      {/* Left panel - Login form */}
      <div className="w-full lg:w-[45%] flex flex-col justify-between p-8 sm:p-12 relative z-10 bg-slate-950 border-r border-slate-900 shadow-2xl">
        {/* Brand / Logo */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">

            <span className="text-xl font-bold tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">MANTO</span>
          </div>

          <a
            href="#/pricing"
            className="flex items-center gap-1 text-sm text-slate-400 hover:text-white transition-colors"
          >
            <ChevronLeft size={16} />
            <span>View Pricing</span>
          </a>
        </div>

        {/* Center - Login Form Container */}
        <div className="my-auto max-w-md w-full mx-auto space-y-8 py-8">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-400">
              Customer Sign In
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              Access your payment portal and subscription management dashboard.
            </p>
          </div>

          {registered && !success && (
            <div className="flex items-start gap-3 bg-emerald-950/40 border border-emerald-500/20 text-emerald-200 text-sm px-4 py-3 rounded-xl">
              <CheckCircle2 size={18} className="shrink-0 mt-0.5 text-emerald-400" />
              <span>Account registered successfully! Please log in with your credentials.</span>
            </div>
          )}

          {success ? (
            <div className="text-center py-8 bg-slate-900/30 border border-slate-800 rounded-2xl p-6">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-violet-500 to-indigo-500 text-white shadow-[0_0_26px_rgba(139,92,246,0.22)]">
                <Lock size={18} />
              </div>
              <h4 className="mt-4 text-lg font-semibold tracking-tight">
                Login successful!
              </h4>
              <p className="mt-2 text-sm text-slate-400">
                Preparing your workspace...
              </p>
              <div className="mt-6 flex items-center justify-center gap-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '0s' }} />
                <div className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '0.2s' }} />
                <div className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '0.4s' }} />
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {errorMessage && (
                <div className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                  {errorMessage}
                </div>
              )}

              {/* Email */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full rounded-xl border border-slate-800 bg-slate-900/50 px-4 py-2.5 text-slate-100 outline-none transition focus:ring-2 focus:ring-violet-500/25 focus:border-violet-500/80"
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="block text-sm font-medium text-slate-300">
                    Password
                  </label>
                  <a
                    href="#/forgot-password"
                    className="text-xs font-semibold text-violet-400 hover:text-violet-300 transition-colors"
                  >
                    Forgot password?
                  </a>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-slate-800 bg-slate-900/50 px-4 py-2.5 pr-11 text-slate-100 outline-none transition focus:ring-2 focus:ring-violet-500/25 focus:border-violet-500/80"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-2 inline-flex items-center justify-center rounded-lg px-2 text-slate-400 hover:text-white transition hover:bg-white/5 focus:outline-none"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Keep signed in */}
              <div className="flex items-center">
                <label className="flex items-center gap-2.5 text-sm text-slate-400 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-800 bg-slate-900 text-violet-600 focus:ring-violet-500/30"
                    disabled={isLoading}
                  />
                  <span>Keep me signed in</span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!canSubmit}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2.5 font-semibold text-white shadow-[0_4px_20px_rgba(139,92,246,0.25)] hover:from-violet-500 hover:to-indigo-500 hover:shadow-[0_4px_30px_rgba(139,92,246,0.4)] transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : null}
                {isLoading ? "Signing in…" : "Sign In"}
              </button>

              {/* Terms of Service */}
              <p className="text-center text-xs text-slate-500 leading-relaxed">
                By signing in, you agree to our{' '}
                <a className="text-violet-400 hover:underline" href="#">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a className="text-violet-400 hover:underline" href="#">
                  Privacy Policy
                </a>.
              </p>

              {/* Signup Link */}
              <p className="text-center text-xs text-slate-400 pt-2 border-t border-slate-900">
                Don't have an enterprise account?{' '}
                <a
                  className="text-violet-400 font-semibold hover:underline"
                  href="#/customer/register"
                >
                  Register here
                </a>
              </p>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="text-xs text-slate-600 flex justify-between items-center">
          <span>© 2026 MANTO Inc. All rights reserved.</span>
          <span>v2.1.0</span>
        </div>
      </div>

      {/* Right panel - Video & Features (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-[55%] relative flex-col justify-between p-12 overflow-hidden bg-slate-950">
        {/* Background Video */}
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover opacity-75"
          autoPlay
          muted
          loop
          playsInline
          src={backgroundVideo}
        />

        {/* Overlays to blend video into deep space / dark palette */}
        <div className="absolute inset-0 bg-slate-950/70 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(224, 239, 245, 0.18),transparent_60%)]" />

        {/* Top visual decoration */}
        <div className="relative z-10 flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-4 py-2 rounded-full border border-white/5 w-fit">
          <span className="text-xs font-semibold text-slate-300">Payment Portal & Subscriptions</span>
        </div>

        {/* Feature List & Headings */}
        <div className="relative z-10 space-y-8 max-w-xl my-auto">
          <div className="space-y-4">
            <h1 className="text-4xl lg:text-5xl font-black leading-tight tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-violet-200 to-indigo-200">
              Elevate Your <br /> Enterprise Productivity
            </h1>
            <p className="text-slate-300 text-lg leading-relaxed">
              Leading solution for smart task allocation, automated KPI tracking, and employee physical & mental well-being analytics.
            </p>
          </div>

          {/* Grid of features */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-900/60 backdrop-blur-md border border-white/5 p-5 rounded-2xl space-y-2 hover:border-violet-500/20 transition-all duration-300 group">
              <div className="h-10 w-10 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-400 group-hover:bg-violet-500/20 transition-colors">
                <CreditCard className="h-5 w-5" />
              </div>
              <h4 className="font-semibold text-slate-200 text-sm">Secure Transactions</h4>
              <p className="text-xs text-slate-400 leading-relaxed">Integrated with VNPay Sandbox for safe, fast, and instant activation.</p>
            </div>

            <div className="bg-slate-900/60 backdrop-blur-md border border-white/5 p-5 rounded-2xl space-y-2 hover:border-violet-500/20 transition-all duration-300 group">
              <div className="h-10 w-10 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-400 group-hover:bg-violet-500/20 transition-colors">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h4 className="font-semibold text-slate-200 text-sm">Enterprise Privacy</h4>
              <p className="text-xs text-slate-400 leading-relaxed">Industry-standard encryption, strict GDPR compliance, and SSO integration.</p>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 text-xs text-slate-400 flex justify-between items-center border-t border-white/5 pt-4">
          <span>24/7 transaction processing supporting international & domestic cards.</span>
        </div>
      </div>
    </main>
  );
}
