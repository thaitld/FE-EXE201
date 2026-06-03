import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { Lock, ArrowUpRight, Sparkle, Package, Frame, Palette, PenTool, Layers, Type, Aperture, Home, Camera, Brush, Box, Wand2, ChevronDown, ChevronUp } from 'lucide-react'

const videoSrc =
	'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4'

const SoftwareIcon = ({ icon: Icon }: { icon: any }) => (
  <div className="h-14 w-14 md:h-16 md:w-16 rounded-xl liquid-glass flex items-center justify-center flex-shrink-0">
    <Icon className="h-6 w-6 md:h-7 md:w-7 text-white/80" strokeWidth={1.5} />
  </div>
)

function Homepage() {
	const [mounted, setMounted] = useState(false)
	const [activeIndex, setActiveIndex] = useState<number | null>(0)
	const videoWrapRef = useRef<HTMLDivElement | null>(null)
	const videoRef = useRef<HTMLVideoElement | null>(null)

	const toggleFAQ = (index: number) => {
		setActiveIndex(activeIndex === index ? null : index)
	}

	const faqItems = [
		{
			question: "How do teams integrate MANTO with their workflows?",
			answer: "MANTO seamlessly integrates with popular tools like Slack, Microsoft Teams, and email. Setup takes just minutes through our intuitive dashboard, and our support team can help with custom integrations."
		},
		{
			question: "Can team leaders track wellbeing metrics?",
			answer: "Yes, leadership dashboards provide anonymized insights into team wellbeing trends. You get actionable data without compromising individual privacy, helping you identify and address burnout patterns early."
		},
		{
			question: "How is employee data protected?",
			answer: "We use enterprise-grade encryption (AES-256), SOC 2 Type II compliance, and GDPR-compliant data handling. Your team's data is never shared with third parties and you maintain full control."
		},
		{
			question: "What if team members work across time zones?",
			answer: "MANTO is built for global teams. Async workflows respect local time zones, and all communications are logged so no one misses critical insights regardless of when they work."
		},
		{
			question: "Do you offer dedicated onboarding?",
			answer: "Enterprise plans include white-glove onboarding with our product specialists. We'll help customize workflows for your team, train staff, and ensure successful adoption."
		}
	]

	useEffect(() => {
		setMounted(true)
	}, [])

	useEffect(() => {
		const videoWrap = videoWrapRef.current

		if (!videoWrap) {
			return undefined
		}

		let rafId = 0
		let currentX = 0
		let currentY = 0
		let targetX = 0
		let targetY = 0

		const handleMouseMove = (event: MouseEvent) => {
			const cx = window.innerWidth / 2
			const cy = window.innerHeight / 2

			targetX = ((event.clientX - cx) / cx) * 20
			targetY = ((event.clientY - cy) / cy) * 20
		}

		const updateParallax = () => {
			currentX += (targetX - currentX) * 0.06
			currentY += (targetY - currentY) * 0.06

			gsap.set(videoWrap, {
				x: currentX,
				y: currentY,
			})

			rafId = window.requestAnimationFrame(updateParallax)
		}

		window.addEventListener('mousemove', handleMouseMove, { passive: true })
		rafId = window.requestAnimationFrame(updateParallax)

		return () => {
			window.removeEventListener('mousemove', handleMouseMove)
			window.cancelAnimationFrame(rafId)
		}
	}, [])

	const handleLoadedMetadata = () => {
		if (videoRef.current) {
			videoRef.current.playbackRate = 1.25
		}
	}

	const softwareRow1 = [Package, Frame, Palette, PenTool, Layers, Type, Aperture, Home]
	const softwareRow2 = [Camera, Brush, Box, Wand2, Package, Frame, Type, Layers]

	const timeline = [
		{ year: '', role: '', company: '' },
		{ year: '', role: '', company: '' },
		{ year: '', role: '', company: '' },
	]

	return (
		<>
			{/* HERO SECTION WITH PARALLAX - Full Viewport */}
			<section
				className="relative h-screen overflow-hidden bg-slate-950 text-white"
				style={{ fontFamily: "'Barlow', sans-serif" }}
			>
				{/* Fixed Background Video */}
				<div ref={videoWrapRef} className="absolute inset-0 z-0 scale-[1.08] origin-center">
					<video
						ref={videoRef}
						className="h-full w-full object-cover"
						autoPlay
						muted
						loop
						playsInline
						onLoadedMetadata={handleLoadedMetadata}
						aria-hidden="true"
						src={videoSrc}
					/>
				</div>

				<div className="pointer-events-none absolute inset-0 z-[1] bg-slate-950/48" />
				<div className="pointer-events-none absolute inset-0 z-[2] bg-[radial-gradient(circle_at_top,rgba(99,179,129,0.16),transparent_36%),linear-gradient(180deg,rgba(15,23,42,0.18),rgba(15,23,42,0.64))]" />

				{/* Header - Fixed to top */}
				<header className="fixed left-0 right-0 top-0 z-50 flex items-center justify-between px-10 py-8">
					<a
						href="#"
						className="flex items-start gap-1 text-[17px] font-semibold tracking-tight text-white"
						aria-label="Wellforge home"
					>
						<span>MANTO</span>
						<sup className="mt-[0.15em] text-[9px] font-semibold tracking-[0.08em] text-white/80">
							TM
						</sup>
					</a>

					<nav className="liquid-glass flex items-center gap-1 rounded-full px-2 py-2">
						{['PLATFORM', 'BENEFITS', 'RESOURCES', 'CONTACT'].map((item) => (
							<a
								key={item}
								href="#"
								className="rounded-full px-4 py-1.5 text-[11px] font-medium tracking-[0.14em] text-white/88 transition-colors duration-200 hover:text-white"
							>
								{item}
							</a>
						))}
					</nav>

					<a
						href="#/login"
						className="liquid-glass rounded-full px-5 py-2.5 text-[11px] font-medium tracking-[0.14em] text-white/88 transition-colors duration-200 hover:text-white"
					>
						GET START
					</a>
				</header>

				{/* Hero Content - Centered in viewport */}
				<div className="relative z-20 h-full flex flex-col items-center justify-center px-4 sm:px-6">
					<div
						className={`text-center max-w-4xl transition-all duration-1000 ${
							mounted ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
						}`}
					>
						<h1
							data-text="Deliver wellbeing at work."
							className="text-3d text-3d-gloss text-[clamp(32px,7vw,68px)] leading-[1.1] mb-4 sm:mb-6"
						>
							Deliver wellbeing at work.
						</h1>
						<h2
							data-text="Reduce burnout with a system teams actually use."
							className="text-3d text-[clamp(18px,4vw,36px)] text-white/75 leading-[1.2] mb-8 sm:mb-10"
						>
							Reduce burnout with a system teams actually use.
						</h2>
					</div>

					<div
						className={`flex flex-col items-center gap-6 sm:gap-8 max-w-2xl transition-all duration-1000 ${
							mounted ? 'translate-y-0 opacity-100 delay-300' : 'translate-y-6 opacity-0'
						}`}
					>
						<p className="text-center text-[14px] sm:text-[15px] leading-[1.7] text-slate-100 px-2">
							<span>
								Our platform adapts to your team's load, cadence, and pressure points.
							</span>{' '}
							<span className="text-white/60">
								Every workflow is designed to make focus sustainable across the organization.
							</span>
						</p>

						<button
							type="button"
							className="rounded-full bg-emerald-200 px-7 sm:px-8 py-3 sm:py-3.5 text-[14px] sm:text-[15px] font-semibold text-slate-950 transition duration-300 hover:scale-[1.03] hover:shadow-[0_0_28px_2px_rgba(167,243,208,0.22)] active:scale-[0.97] whitespace-nowrap"
						>
							Explore the wellbeing platform
						</button>

						<div className="flex items-center gap-2 text-[10px] sm:text-[11px] font-medium tracking-[0.14em] text-white/70 px-2">
							<Lock size={13} strokeWidth={1.5} />
							<span>SECURE BY DESIGN. BUILT FOR HR, OPS, AND LEADERSHIP TEAMS.</span>
						</div>
					</div>
				</div>
			</section>

			{/* FEATURE/PORTFOLIO SECTION - Scrollable below hero */}
			<section className="relative w-full bg-[#0a0a0a] text-white px-4 sm:px-6 md:px-10 lg:px-14 py-16 sm:py-20 md:py-24">
				{/* Header Section */}
				<div className="max-w-3xl mb-12 md:mb-16">
					<div className="flex flex-col lg:flex-row lg:items-start lg:justify-between lg:gap-8 mb-8">
						{/* Left - Title & Description */}
						<div className="flex-1">
							<h1 className="text-[28px] sm:text-3xl md:text-4xl lg:text-[44px] font-normal leading-[1.15] tracking-tight text-white mb-4">
								Hi, We are MANTO!
							</h1>
							<p className="text-sm md:text-[15px] leading-[1.6] text-white/60 max-w-3xl">
								MANTO is a group of independent creators shaping sharp visual systems, web-ready products, and story-first campaigns. With a decade of craft behind us, we help ideas move with focus and intention.
							</p>
						</div>

						{/* Right - CTA Button */}
						<div className="mt-6 lg:mt-0">
							<button className="liquid-glass px-5 sm:px-6 py-2.5 sm:py-3 rounded-full text-white text-sm font-medium hover:text-white transition-colors whitespace-nowrap">
								Let's Team Up Today
							</button>
						</div>
					</div>
				</div>

				{/* Grid Section */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
					
					{/* Column 1 - Background Card */}
					<div className="flex flex-col">
						<div className="rounded-2xl bg-black relative overflow-hidden h-64 md:h-80 lg:h-96 mb-4 md:mb-5">
							{/* Video Background */}
							<video
								className="absolute inset-0 w-full h-full object-cover"
								autoPlay
								loop
								muted
								playsInline
							>
								<source src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260507_150203_44a5bd32-516a-47ce-a077-8acbf9aa8991.mp4" type="video/mp4" />
							</video>

							{/* Content Overlay */}
							<div className="absolute inset-0 flex flex-col justify-between p-5 md:p-6 bg-gradient-to-t from-black/60 to-transparent">
								{/* Top Label */}
								<div className="flex items-center justify-center gap-2">
									
								</div>

								{/* Bottom Timeline Grid */}
								<div className="grid gap-2">
									{timeline.map((item, i) => (
										<div key={i} className="grid grid-cols-[auto_auto_1fr_auto] gap-2 items-center text-xs text-white/80">
											<span>{item.year}</span>
											<Sparkle className="h-3 w-3 text-white/60" strokeWidth={1.5} />
											<span>{item.role}</span>
											<span className="text-white/60">{item.company}</span>
										</div>
									))}
								</div>
							</div>
						</div>
					</div>

					{/* Column 2 - Stacked Cards */}
					<div className="flex flex-col md:grid md:grid-rows-[auto_1fr] gap-4 md:gap-5">
						
						{/* Client Voice Card */}
						<div className="rounded-2xl bg-[#324444] p-5 md:p-6 noise-overlay relative overflow-hidden flex flex-col justify-between h-64 md:h-auto">
							{/* Label */}
							<div className="flex items-center gap-2 mb-4">
								<Sparkle className="h-3 w-3 text-white/70" strokeWidth={1.5} />
								<span className="uppercase tracking-[0.22em] text-[11px] text-white/70">Client Voice</span>
								<Sparkle className="h-3 w-3 text-white/70" strokeWidth={1.5} />
							</div>

							{/* Quote */}
							<blockquote className="text-[13px] sm:text-[13.5px] leading-[1.6] text-white/85 mb-4">
								"MANTO's work is a masterclass in visual storytelling. They took our brand from bland to brilliant, crafting a visual identity that truly captures our essence. The team's creativity, professionalism, and dedication are unmatched. Working with MANTO was an absolute pleasure, and the results speak for themselves."
											</blockquote>

							{/* Attribution */}
							<div className="text-xs text-white/70">
								<p className="font-medium text-white/85">MANTO</p>
								<p className="text-white/60">EXE201</p>
							</div>
						</div>

						{/* 10M+ Card */}
						<div className="rounded-2xl bg-black relative overflow-hidden h-64 md:h-80 flex flex-col items-center justify-center">
							{/* Video Background */}
							<video
								className="absolute inset-0 w-full h-full object-cover"
								autoPlay
								loop
								muted
								playsInline
							>
								<source src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260507_154543_d5b83fc1-9cea-44f3-b5e8-8f325935211a.mp4" type="video/mp4" />
							</video>

							{/* Content Overlay */}
							<div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-transparent via-transparent to-black/40">
								<div className="text-5xl sm:text-6xl md:text-7xl lg:text-[88px] font-light tracking-tight drop-shadow-lg text-white">
									10M+
								</div>
								<p className="text-white/85 text-sm mt-4">Raised for startups</p>
							</div>
						</div>
					</div>

					{/* Column 3 - Stacked Cards */}
					<div className="flex flex-col gap-4 md:gap-5">
						
						{/* Daily Software Card */}
						<div className="rounded-2xl bg-black relative overflow-hidden h-80 md:h-96 flex flex-col items-center justify-center">
							{/* Video Background */}
							<video
								className="absolute inset-0 w-full h-full object-cover"
								autoPlay
								loop
								muted
								playsInline
							>
								<source src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260507_153148_d7a3e1dd-e5d0-4ce6-8306-00d7522ecc44.mp4" type="video/mp4" />
							</video>

							{/* Content Overlay */}
							<div className="absolute inset-0 flex flex-col justify-between p-5 md:p-6 bg-gradient-to-t from-black/60 to-transparent">
								{/* Top Label */}
								<div className="flex items-center justify-center gap-2">
									<Sparkle className="h-3 w-3 text-white/70" strokeWidth={1.5} />
									<span className="uppercase tracking-[0.22em] text-[11px] text-white/70">Daily Software</span>
									<Sparkle className="h-3 w-3 text-white/70" strokeWidth={1.5} />
								</div>

								{/* Marquee Rows */}
								<div className="space-y-3">
									{/* Row 1 - Left Scroll */}
									<div className="overflow-hidden">
										<div className="flex animate-marquee-left gap-3">
											{[...softwareRow1, ...softwareRow1].map((Icon, i) => (
												<SoftwareIcon key={i} icon={Icon} />
											))}
										</div>
									</div>

									{/* Row 2 - Right Scroll */}
									<div className="overflow-hidden">
										<div className="flex animate-marquee-right gap-3">
											{[...softwareRow2, ...softwareRow2].map((Icon, i) => (
												<SoftwareIcon key={i} icon={Icon} />
											))}
										</div>
									</div>
								</div>
							</div>
						</div>

						{/* Reach Me Card */}
						<div className="rounded-2xl bg-[#324444] p-5 md:p-6 noise-overlay relative overflow-hidden flex flex-col justify-between h-64 md:h-auto">
							{/* Label */}
							<div className="flex items-center justify-between mb-6">
								<div className="flex items-center gap-2">
									<Sparkle className="h-3 w-3 text-white/70" strokeWidth={1.5} />
									<span className="uppercase tracking-[0.22em] text-[11px] text-white/70">Reach Me</span>
									<Sparkle className="h-3 w-3 text-white/70" strokeWidth={1.5} />
								</div>
								<button className="h-9 w-9 rounded-full liquid-glass flex items-center justify-center hover:bg-white/10 transition-colors">
									<ArrowUpRight className="h-4 w-4 text-white" strokeWidth={1.5} />
								</button>
							</div>

							{/* Contact Info */}
							<div className="space-y-4">
								<div>
									<p className="text-xs text-white/60 mb-1">Email</p>
									<a href="mailto:hi@maxreed.com" className="text-sm text-white hover:text-white/80 transition-colors">
										MANTO@gmail.com
									</a>
								</div>
								<div>
									<p className="text-xs text-white/60 mb-1">Phone</p>
									<a href="tel:+4420781163" className="text-sm text-white hover:text-white/80 transition-colors">
										+84 207 81 63 
									</a>
								</div>
							</div>
						</div>
					</div>

				</div>
			</section>

			{/* PRICING SECTION */}
			<section className="relative w-full bg-[#0a0a0a] text-white px-4 sm:px-6 md:px-10 lg:px-14 py-16 sm:py-20 md:py-28 overflow-hidden">
				{/* Background decoration */}
				<div className="absolute inset-0 bg-gradient-to-b from-blue-950/20 via-transparent to-transparent pointer-events-none" />
				
				<div className="relative z-10 max-w-6xl mx-auto">
					{/* Header */}
					<div className="text-center mb-12 sm:mb-16 md:mb-20">
						<h2 className="text-[32px] sm:text-4xl md:text-5xl font-light tracking-tight mb-4">
							Simple, Transparent <span className="text-blue-300">Pricing</span>
						</h2>
						<p className="text-white/60 text-sm md:text-base max-w-2xl mx-auto">
							Choose the perfect plan for your needs. Always flexible to scale as you grow.
						</p>
					</div>

					{/* Toggle Switch */}
					<div className="flex items-center justify-center gap-4 mb-12 md:mb-16">
						<span className="text-white/70 text-sm">Monthly</span>
						<button className="relative inline-flex h-8 w-14 items-center rounded-full bg-white/10 transition-colors hover:bg-white/20 border border-white/20">
							<span className="inline-block h-6 w-6 transform rounded-full bg-white transition-transform" style={{ marginLeft: '4px' }} />
						</button>
						<span className="text-white/70 text-sm">Yearly <span className="text-emerald-300 text-xs ml-1">Save 20%</span></span>
					</div>

					{/* Pricing Cards */}
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-4 lg:gap-6">
						{/* Free Plan */}
						<div className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent p-6 sm:p-8 flex flex-col">
							<div className="mb-6">
								<h3 className="text-xl sm:text-2xl font-semibold mb-2">Free</h3>
								<p className="text-white/60 text-sm">For creators taking their first steps with focus.</p>
							</div>

							<div className="mb-6 text-white text-sm">
								<span className="text-3xl font-light">$0</span>
								<span className="text-white/60">/month</span>
							</div>

							<ul className="space-y-3 mb-8 flex-grow">
								{[
									'Up to 3 projects in the cloud',
									'Image export up to 1080p',
									'Basic editing tools',
									'Free templates and icons',
									'Access via web and mobile app'
								].map((feature, i) => (
									<li key={i} className="flex items-start gap-3 text-sm text-white/80">
										<svg className="h-5 w-5 text-emerald-300 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
											<path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
										</svg>
										<span>{feature}</span>
									</li>
								))}
							</ul>

							<button className="w-full py-2.5 px-4 rounded-lg bg-white/10 text-white font-medium text-sm hover:bg-white/20 transition-colors border border-white/20">
								Choose Plan
							</button>
						</div>

						{/* Standard Plan - Featured */}
						<div className="rounded-2xl border border-blue-400/50 bg-gradient-to-b from-blue-900/30 to-blue-950/20 p-6 sm:p-8 flex flex-col relative md:scale-105 md:-my-4">
							<div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-blue-500 text-white text-xs font-semibold">
								MOST POPULAR
							</div>
							
							<div className="mb-6">
								<h3 className="text-xl sm:text-2xl font-semibold mb-2">Standard</h3>
								<p className="text-white/60 text-sm">For freelancers and small teams who need more freedom and flexibility.</p>
							</div>

							<div className="mb-6 text-white text-sm">
								<span className="text-3xl sm:text-4xl font-light">$9.99</span>
								<span className="text-white/60">/m</span>
							</div>

							<ul className="space-y-3 mb-8 flex-grow">
								{[
									'Up to 50 projects in the cloud',
									'Export up to 4K',
									'Advanced editing toolkit',
									'Team collaboration (up to 5 members)',
									'Access to premium template library'
								].map((feature, i) => (
									<li key={i} className="flex items-start gap-3 text-sm text-white/90">
										<svg className="h-5 w-5 text-emerald-300 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
											<path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
										</svg>
										<span>{feature}</span>
									</li>
								))}
							</ul>

							<button className="w-full py-2.5 px-4 rounded-lg bg-emerald-300 text-slate-950 font-semibold text-sm hover:bg-emerald-200 transition-colors">
								Choose Plan
							</button>
						</div>

						{/* Pro Plan */}
						<div className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent p-6 sm:p-8 flex flex-col">
							<div className="mb-6">
								<h3 className="text-xl sm:text-2xl font-semibold mb-2">Pro</h3>
								<p className="text-white/60 text-sm">For studios, agencies, and professional creators working with brands.</p>
							</div>

							<div className="mb-6 text-white text-sm">
								<span className="text-3xl sm:text-4xl font-light">$19.99</span>
								<span className="text-white/60">/m</span>
							</div>

							<ul className="space-y-3 mb-8 flex-grow">
								{[
									'Unlimited projects',
									'Export up to 8K + animations',
									'AI-powered content generation tools',
									'Unlimited team members',
									'Brand customization',
									'White-label capabilities',
									'Priority support'
								].map((feature, i) => (
									<li key={i} className="flex items-start gap-3 text-sm text-white/80">
										<svg className="h-5 w-5 text-emerald-300 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
											<path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
										</svg>
										<span>{feature}</span>
									</li>
								))}
							</ul>

							<button className="w-full py-2.5 px-4 rounded-lg bg-white/10 text-white font-medium text-sm hover:bg-white/20 transition-colors border border-white/20">
								Choose Plan
							</button>
						</div>
					</div>

					{/* Bottom CTA */}
					<div className="mt-16 text-center">
						<p className="text-white/60 text-sm mb-4">All plans include a 14-day free trial. No credit card required.</p>
						<a href="#" className="inline-block text-emerald-300 hover:text-emerald-200 transition-colors text-sm font-medium">
							Compare all features →
						</a>
					</div>
				</div>
			</section>

			{/* CTA + FAQ SECTION */}
			<section className="relative w-full bg-[#0a0a0a] text-white px-4 sm:px-6 md:px-10 lg:px-14 py-16 sm:py-20 md:py-28" style={{ fontFamily: "'Barlow', sans-serif" }}>
				<div className="max-w-[1100px] w-full mx-auto">
					<div className="grid grid-cols-[1.6fr_1fr] gap-[30px] items-stretch md:grid-cols-1 md:gap-[60px]">
						
						{/* Left Column - CTA Card */}
						<div 
							className="c5-animated-gradient rounded-3xl py-20 px-8 sm:px-12 md:px-16 text-white flex flex-col justify-center items-center text-center"
							style={{ boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)' }}
						>
							<h2 
								className="font-normal leading-[1.1] mb-4 sm:mb-6 text-[28px] sm:text-[36px] md:text-[44px] lg:text-5xl"
								style={{ letterSpacing: '-0.02em' }}
							>
								Ready to Transform Your Team's Wellbeing?
							</h2>
							<p className="text-[14px] sm:text-[15px] md:text-base mb-8 sm:mb-10 font-normal text-white/90 max-w-2xl">
								Start your journey to sustainable focus and lasting productivity today
							</p>
							<button 
								className="rounded-full bg-[#E8F5FF] px-8 sm:px-10 py-3 sm:py-4 font-semibold text-[#06193d] text-[14px] sm:text-[15px] transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_0_30px_2px_rgba(232,245,255,0.35)] active:scale-[0.97]"
							>
								Get Started Today
							</button>
						</div>

						{/* Right Column - FAQ */}
						<div className="flex flex-col justify-center gap-3">
							{faqItems.map((item, index) => (
								<div
									key={index}
									onClick={() => toggleFAQ(index)}
									className="border rounded-2xl py-5 px-6 cursor-pointer transition-all duration-200 group"
									style={{
										backgroundColor: activeIndex === index ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.03)',
										borderColor: activeIndex === index ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)',
										boxShadow: activeIndex === index 
											? '0 8px 24px rgba(0,0,0,0.2)' 
											: '0 4px 12px rgba(0,0,0,0.1)'
									}}
								>
									<div className="flex justify-between items-start gap-4 font-medium text-[14px] sm:text-[15px]">
										<span 
											className="leading-[1.45] tracking-[-0.01em] antialiased"
											style={
												(index === 0 || index === 2) ? {
													color: '#f0f9ff',
													fontWeight: 600,
													textShadow: `
														0 1px 0 rgba(232, 245, 255, 0.1),
														0 2px 2px rgba(59, 0, 255, 0.15),
														0 4px 4px rgba(0, 245, 170, 0.1),
														0 6px 8px rgba(0, 0, 0, 0.3)
													`,
													letterSpacing: '-0.015em'
												} : {
													color: 'rgba(255, 255, 255, 0.95)'
												}
											}
										>
											{item.question}
										</span>
										{activeIndex === index ? (
											<ChevronUp size={20} className="flex-shrink-0 text-[#00f5aa] transition-transform duration-300" />
										) : (
											<ChevronDown size={20} className="flex-shrink-0 text-white/40 group-hover:text-white/60 transition-colors duration-300" />
										)}
									</div>
									{activeIndex === index && (
										<div 
											className="mt-4 text-[13px] sm:text-[14px] leading-[1.8] tracking-[-0.005em] antialiased"
											style={
												(index === 0 || index === 2) ? {
													color: 'rgba(255, 255, 255, 0.9)',
													textShadow: '0 2px 4px rgba(0, 245, 170, 0.08)',
													fontWeight: 500
												} : {
													color: 'rgba(255, 255, 255, 0.82)'
												}
											}
										>
											{item.answer}
										</div>
									)}
								</div>
							))}
						</div>
					</div>

				</div>
			</section>
		</>
	)
}

export default Homepage

