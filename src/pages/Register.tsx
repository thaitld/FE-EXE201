import { useMemo, useRef, useState, type FormEvent } from 'react'
import { CheckCircle2, Eye, EyeOff, Loader2, Lock, Mail, UserRound } from 'lucide-react'

const backgroundVideo = 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260325_094440_a3592600-bd1e-49e5-9bce-a73662061d83.mp4'

export default function Register() {
	const [name, setName] = useState('')
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [confirmPassword, setConfirmPassword] = useState('')
	const [showPassword, setShowPassword] = useState(false)
	const [showConfirmPassword, setShowConfirmPassword] = useState(false)
	const [isLoading, setIsLoading] = useState(false)
	const [submitted, setSubmitted] = useState(false)
	const videoRef = useRef<HTMLVideoElement | null>(null)

	const canSubmit = useMemo(() => {
		const hasName = name.trim().length > 0
		const hasEmail = email.trim().length > 0
		const hasPassword = password.length >= 8
		const passwordsMatch = password === confirmPassword && confirmPassword.length > 0

		return hasName && hasEmail && hasPassword && passwordsMatch && !isLoading && !submitted
	}, [name, email, password, confirmPassword, isLoading, submitted])

	const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		if (!canSubmit) return

		setIsLoading(true)

		setTimeout(() => {
			setSubmitted(true)
			setIsLoading(false)
			console.log('Register attempt', { name, email })
		}, 900)
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

					{!submitted ? (
						<>
							<div className="relative mb-7 flex items-center gap-3">
								<div className="inline-flex items-center justify-center rounded-xl bg-emerald-200/90 p-2 text-slate-950 shadow-[0_0_22px_rgba(167,243,208,0.28)]">
									<UserRound size={16} />
								</div>
								<div>
									<h3 className="text-lg font-semibold tracking-tight">Create your MANTO account</h3>
									<p className="text-sm text-slate-200/75">Set up your workspace in a few quick steps</p>
								</div>
							</div>

							<form onSubmit={handleSubmit} className="relative space-y-4">
								<div className="space-y-2">
									<label className="block text-sm text-slate-200">Full Name</label>
									<div className="relative">
										<UserRound className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
										<input
											type="text"
											required
											autoComplete="name"
											value={name}
											onChange={(event) => setName(event.target.value)}
											disabled={isLoading}
											placeholder="Ariana Lee"
											className="w-full rounded-xl border border-slate-700/70 bg-slate-900/70 px-4 py-2.5 pl-11 text-slate-100 outline-none transition focus:ring-2 focus:ring-emerald-300/70"
										/>
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

								<div className="space-y-2">
									<label className="block text-sm text-slate-200">Password</label>
									<div className="relative">
										<Lock className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
										<input
											type={showPassword ? 'text' : 'password'}
											required
											autoComplete="new-password"
											value={password}
											onChange={(event) => setPassword(event.target.value)}
											disabled={isLoading}
											placeholder="At least 8 characters"
											className="w-full rounded-xl border border-slate-700/70 bg-slate-900/70 px-4 py-2.5 pl-11 pr-11 text-slate-100 outline-none transition focus:ring-2 focus:ring-emerald-300/70"
										/>

										<button
											type="button"
											className="absolute inset-y-0 right-2 inline-flex items-center justify-center rounded-lg px-2 text-slate-300/90 transition hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-emerald-300/60"
											onClick={() => setShowPassword((value) => !value)}
											aria-label={showPassword ? 'Hide password' : 'Show password'}
											disabled={isLoading}
										>
											{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
										</button>
									</div>
								</div>

								<div className="space-y-2">
									<label className="block text-sm text-slate-200">Confirm Password</label>
									<div className="relative">
										<Lock className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
										<input
											type={showConfirmPassword ? 'text' : 'password'}
											required
											autoComplete="new-password"
											value={confirmPassword}
											onChange={(event) => setConfirmPassword(event.target.value)}
											disabled={isLoading}
											placeholder="Repeat your password"
											className="w-full rounded-xl border border-slate-700/70 bg-slate-900/70 px-4 py-2.5 pl-11 pr-11 text-slate-100 outline-none transition focus:ring-2 focus:ring-emerald-300/70"
										/>

										<button
											type="button"
											className="absolute inset-y-0 right-2 inline-flex items-center justify-center rounded-lg px-2 text-slate-300/90 transition hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-emerald-300/60"
											onClick={() => setShowConfirmPassword((value) => !value)}
											aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
											disabled={isLoading}
										>
											{showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
										</button>
									</div>
								</div>

								<div className="flex items-start gap-2 rounded-xl border border-slate-700/60 bg-slate-900/40 px-4 py-3 text-sm text-slate-200/80">
									<CheckCircle2 className="mt-0.5 shrink-0 text-emerald-200" size={16} />
									<span>Use a work email so your team can manage access and onboarding later.</span>
								</div>

								<button
									type="submit"
									disabled={!canSubmit}
									className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-emerald-200 to-cyan-200 px-4 py-2.5 font-semibold text-slate-950 shadow-[0_12px_35px_rgba(16,185,129,0.18)] transition hover:brightness-105 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
								>
									{isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
									{isLoading ? 'Creating account…' : 'Create account'}
								</button>

								<p className="text-center text-xs text-slate-200/60">
									Already have an account?{' '}
									<a className="text-emerald-200/90 hover:text-emerald-100" href="#/login">
										Sign in
									</a>
								</p>

								<p className="text-center text-xs text-slate-200/60">
									By creating an account, you agree to our{' '}
									<a className="text-emerald-200/90 hover:text-emerald-100" href="#">
										Terms of Service
									</a>{' '}
									and{' '}
									<a className="text-emerald-200/90 hover:text-emerald-100" href="#">
										Privacy Policy
									</a>
									.
								</p>

								<a href="#/" className="mt-4 block text-center text-sm font-medium text-emerald-200 hover:text-emerald-100">
									← Return to homepage
								</a>
							</form>
						</>
					) : (
						<div className="py-6 text-center">
							<div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-200/90 text-slate-950 shadow-[0_0_26px_rgba(167,243,208,0.22)]">
								<CheckCircle2 size={18} />
							</div>
							<h4 className="mt-4 text-lg font-semibold tracking-tight">Account created</h4>
							<p className="mt-2 text-sm text-slate-200/80">
								Your MANTO workspace is ready. You can sign in and start setting up your team.
							</p>
							<a href="#/login" className="mt-4 inline-block text-sm font-medium text-emerald-200 hover:text-emerald-100">
								Go to sign in
							</a>
						</div>
					)}
				</div>
			</div>
		</main>
	)
}
