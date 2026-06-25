import { useMemo, useState, useRef } from 'react';
import { registerCustomer } from '../api';
import { Eye, EyeOff, Loader2, Mail, Lock, User, Phone, CheckCircle, Sparkles, CreditCard, ShieldCheck, ChevronLeft } from 'lucide-react';

const backgroundVideo =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260325_094440_a3592600-bd1e-49e5-9bce-a73662061d83.mp4";

export default function CustomerRegisterPage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Client-side validations
  const isEmailValid = useMemo(() => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  }, [email]);

  const canSubmit = useMemo(() => {
    return (
      firstName.trim().length > 0 &&
      lastName.trim().length > 0 &&
      isEmailValid &&
      password.length >= 6 &&
      password === confirmPassword &&
      !isLoading
    );
  }, [firstName, lastName, isEmailValid, password, confirmPassword, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setIsLoading(true);
    setError(null);

    try {
      await registerCustomer({
        email: email.trim(),
        password,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim() || undefined,
      });

      setSuccess(true);
      setTimeout(() => {
        window.location.hash = '#/customer/login?registered=true';
      }, 2500);
    } catch (err: any) {
      setError(err.message || 'Registration failed. This email may already be registered.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen w-full flex bg-slate-950 text-white font-sans overflow-hidden">
      {/* Left panel - Register form */}
      <div className="w-full lg:w-[45%] flex flex-col justify-between p-8 sm:p-12 relative z-10 bg-slate-950 border-r border-slate-900 shadow-2xl overflow-y-auto max-h-screen">
        {/* Brand / Logo */}
        <div className="flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">

            <span className="text-xl font-bold tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">MANTO</span>
          </div>

          <a
            href="#/customer/login"
            className="flex items-center gap-1 text-sm text-slate-400 hover:text-white transition-colors"
          >
            <ChevronLeft size={16} />
            <span>Sign In</span>
          </a>
        </div>

        {/* Center - Register Form Container */}
        <div className="my-auto max-w-md w-full mx-auto space-y-6 py-6 shrink-0">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-400">
              Register Customer Account
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              Create an account to explore and purchase enterprise productivity services.
            </p>
          </div>

          {success ? (
            <div className="text-center py-8 bg-slate-900/30 border border-slate-800 rounded-2xl p-6">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-violet-500 to-indigo-500 text-white shadow-[0_0_26px_rgba(139,92,246,0.22)]">
                <CheckCircle size={18} />
              </div>
              <h4 className="mt-4 text-lg font-semibold tracking-tight">
                Registration successful!
              </h4>
              <p className="mt-2 text-sm text-slate-400">
                Your account has been created. Redirecting to login...
              </p>
              <div className="mt-6 flex items-center justify-center gap-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '0s' }} />
                <div className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '0.2s' }} />
                <div className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '0.4s' }} />
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                  {error}
                </div>
              )}

              {/* Name Fields (First Name / Last Name) */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-300">
                    Last Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={15} />
                    <input
                      type="text"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Smith"
                      className="w-full rounded-xl border border-slate-800 bg-slate-900/50 py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-600 outline-none transition focus:ring-2 focus:ring-violet-500/25 focus:border-violet-500/80"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-300">
                    First Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={15} />
                    <input
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="John"
                      className="w-full rounded-xl border border-slate-800 bg-slate-900/50 py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-600 outline-none transition focus:ring-2 focus:ring-violet-500/25 focus:border-violet-500/80"
                    />
                  </div>
                </div>
              </div>

              {/* Email Address */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={15} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full rounded-xl border border-slate-800 bg-slate-900/50 py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-600 outline-none transition focus:ring-2 focus:ring-violet-500/25 focus:border-violet-500/80"
                  />
                </div>
                {email && !isEmailValid && (
                  <p className="text-xs text-rose-400">Invalid email format</p>
                )}
              </div>

              {/* Phone Number (Optional) */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300">
                  Phone Number <span className="text-slate-500 text-xs">(optional)</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={15} />
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +123456789"
                    className="w-full rounded-xl border border-slate-800 bg-slate-900/50 py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-600 outline-none transition focus:ring-2 focus:ring-violet-500/25 focus:border-violet-500/80"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={15} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full rounded-xl border border-slate-800 bg-slate-900/50 py-2.5 pl-10 pr-10 text-sm text-white placeholder-slate-600 outline-none transition focus:ring-2 focus:ring-violet-500/25 focus:border-violet-500/80"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {password && password.length < 6 && (
                  <p className="text-xs text-rose-400">Password must contain at least 6 characters</p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={15} />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat your password"
                    className="w-full rounded-xl border border-slate-800 bg-slate-900/50 py-2.5 pl-10 pr-10 text-sm text-white placeholder-slate-600 outline-none transition focus:ring-2 focus:ring-violet-500/25 focus:border-violet-500/80"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {confirmPassword && password !== confirmPassword && (
                  <p className="text-xs text-rose-400">Passwords do not match</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!canSubmit || isLoading}
                className="w-full mt-2 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2.5 font-semibold text-white shadow-[0_4px_20px_rgba(139,92,246,0.25)] hover:from-violet-500 hover:to-indigo-500 hover:shadow-[0_4px_30px_rgba(139,92,246,0.4)] transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : null}
                {isLoading ? "Creating account…" : "Register Now"}
              </button>

              {/* Login Link */}
              <p className="text-center text-xs text-slate-400 pt-2 border-t border-slate-900">
                Already have an account?{' '}
                <a
                  className="text-violet-400 font-semibold hover:underline"
                  href="#/customer/login"
                >
                  Sign in here
                </a>
              </p>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="text-xs text-slate-600 flex justify-between items-center shrink-0">
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
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(201, 220, 243, 0.18),transparent_60%)]" />

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
