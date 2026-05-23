import { useMemo, useRef, useState, type FormEvent } from 'react'
import { Loader2, Mail, ArrowLeft, ShieldCheck } from 'lucide-react'
import axios from 'axios'
import { apiClient, type ApiResponse, type ForgotPasswordRequestDto } from '@/lib/api'

const backgroundVideo = 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260325_094440_a3592600-bd1e-49e5-9bce-a73662061d83.mp4'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)

  const canSubmit = useMemo(() => email.trim().length > 0 && !isLoading && !submitted, [email, isLoading, submitted])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!canSubmit) return

    setIsLoading(true)
    setErrorMessage(null)

    const requestBody: ForgotPasswordRequestDto = {
      email: email.trim(),
    }

    try {
      const response = await apiClient.post<ApiResponse<null>>('/auth/forgot-password', requestBody)

      if (!response.data.succeeded) {
        throw new Error(response.data.message || 'Không thể gửi email đặt lại mật khẩu.')
      }

      setSubmitted(true)
    } catch (error) {
      let message = 'Không thể gửi yêu cầu lúc này. Vui lòng thử lại sau.'

      if (axios.isAxiosError(error)) {
        const responseData = error.response?.data as ApiResponse<null> | undefined
        message = responseData?.message || message
      } else if (error instanceof Error && error.message) {
        message = error.message
      }

      setErrorMessage(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden text-white" style={{ fontFamily: "'Barlow', sans-serif" }}>
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

          {!submitted ? (
            <form onSubmit={handleSubmit} className="relative space-y-4">
              <div className="relative mb-7 flex items-center gap-3">
                <div className="inline-flex items-center justify-center rounded-xl bg-emerald-200/90 p-2 text-slate-950 shadow-[0_0_22px_rgba(167,243,208,0.28)]">
                  <Mail size={16} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold tracking-tight">Reset your password</h3>
                  <p className="text-sm text-slate-200/75">We will send an OTP to your email address</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm text-slate-200">Email Address</label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    disabled={isLoading}
                    placeholder="you@yourcompany.com"
                    className="w-full rounded-xl border border-slate-700/70 bg-slate-900/70 px-4 py-2.5 pl-11 text-slate-100 outline-none transition focus:ring-2 focus:ring-emerald-300/70"
                  />
                </div>
              </div>

              <div className="rounded-xl border border-slate-700/60 bg-slate-900/40 px-4 py-3 text-sm text-slate-200/80">
                Enter the email associated with your MANTO account. If the address exists, the system will send a reset code.
              </div>

              {errorMessage ? (
                <div className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
                  {errorMessage}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={!canSubmit}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-emerald-200 to-cyan-200 px-4 py-2.5 font-semibold text-slate-950 shadow-[0_12px_35px_rgba(16,185,129,0.18)] transition hover:brightness-105 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {isLoading ? 'Sending code…' : 'Send reset code'}
              </button>

              <div className="flex items-center justify-between text-sm">
                <a href="#/login" className="inline-flex items-center gap-1 font-medium text-emerald-200 hover:text-emerald-100">
                  <ArrowLeft size={14} />
                  Back to sign in
                </a>
                <a href="#/reset-password" className="font-medium text-emerald-200/90 hover:text-emerald-100">
                  I already have a code
                </a>
              </div>
            </form>
          ) : (
            <div className="py-6 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-200/90 text-slate-950 shadow-[0_0_26px_rgba(167,243,208,0.22)]">
                <ShieldCheck size={18} />
              </div>
              <h4 className="mt-4 text-lg font-semibold tracking-tight">Check your inbox</h4>
              <p className="mt-2 text-sm text-slate-200/80">
                If the email exists, we sent a reset code. Use it on the reset password page.
              </p>
              <a href="#/reset-password" className="mt-4 inline-block text-sm font-medium text-emerald-200 hover:text-emerald-100">
                Go to reset password
              </a>
              <div className="mt-4">
                <a href="#/login" className="text-sm font-medium text-emerald-200/90 hover:text-emerald-100">
                  Back to sign in
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}