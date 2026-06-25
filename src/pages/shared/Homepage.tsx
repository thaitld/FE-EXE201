import { useState, useEffect, useRef } from "react";
import { ChevronRight, Check } from "lucide-react";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "../../components/LanguageSwitcher";
import heroBg from "../../assets/hero.jpg";
import aboutImg from "../../assets/b.jpg";
import valueImg1 from "../../assets/c.jpg";
import valueImg2 from "../../assets/d.jpg";
import valueImg3 from "../../assets/e.jpg";
import whyImg from "../../assets/f.jpg";
import contactImg from "../../assets/G.jpg";
import testimonialImg from "../../assets/h.jpg";
import serviceImg1 from "../../assets/i.jpg";
import serviceImg2 from "../../assets/k.jpg";
import serviceImg3 from "../../assets/t.jpg";
import serviceImg4 from "../../assets/l.jpg";


// ─── Types ───────────────────────────────────────────────────────────────────
interface WhyTabData {
	title: string;
	desc: string;
	p1: string;
	d1: string;
	p2: string;
	d2: string;
}

interface Testimonial {
	text: string;
	name: string;
	role: string;
	initials: string;
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const WHY_TABS: WhyTabData[] = [
	{
		title: "Why Teams Choose Manto to Prevent Burnout",
		desc: "We make wellbeing part of the natural work day. No extra homework, no corporate box-checking. Just simple, caring moments that matter for your employees.",
		p1: "Seamless Chat Integrations",
		d1: "We embed short wellbeing check-ins directly into Slack and Microsoft Teams where your employees already work.",
		p2: "100% Anonymous & Secure",
		d2: "Employees reply with total confidence, providing authentic feedback without any fear of exposure.",
	},
	{
		title: "Understand Your Team's Pulse in Real-Time",
		desc: "No more waiting for annual survey results. Track exhaustion levels, sentiment trends, and alignment across departments instantly.",
		p1: "Burnout Risk Forecasts",
		d1: "Identify stress and burnout indicators weeks before high attrition or resignation letters occur.",
		p2: "Siloed Team Breakdowns",
		d2: "Filter data by department to address localized issues in engineering, sales, or support.",
	},
	{
		title: "Proven Retention and Productivity ROI",
		desc: "A healthy workplace culture is your best growth driver. We help you reduce unplanned leaves and build a sustainable organization.",
		p1: "Lower Attrition Costs",
		d1: "Keep key players in your team by addressing work satisfaction issues proactively.",
		p2: "Peer Recognition Drives Morale",
		d2: "Encourage a culture of appreciation and recognition that breaks team isolation.",
	},
];

const TESTIMONIALS: Testimonial[] = [
	{
		text: '"Manto completely transformed our engineering team\'s mental health. We reduced burnout indicators by 35% in under 3 months — and our employee retention skyrocketed."',
		name: "Maya Lindström",
		role: "VP Engineering, Paylume",
		initials: "ML",
	},
	{
		text: '"I was skeptical about adding another employee tool. But Manto feels natural. Our participation rate is over 82%, and it gives us clear signals before burnout occurs."',
		name: "Sophie Hartmann",
		role: "Chief People Officer — Corepath Partners",
		initials: "SH",
	},
	{
		text: '"The anonymous check-ins were an eye-opener. They helped us identify systemic work-overload issues in our product team. Addressing them saved us key staff members."',
		name: "Daniel Okafor",
		role: "HR Director — Lumis Capital Group",
		initials: "DO",
	},
	{
		text: '"Peer appreciation loops in Manto have boosted our remote culture immensely. It takes less than 5 minutes of admin time weekly to keep the team supported and happy."',
		name: "Priya Nair",
		role: "VP Operations — Arkon Ventures",
		initials: "PN",
	},
];

// ─── Shared micro-components ──────────────────────────────────────────────────
function Eyebrow({ children, light = false }: { children: React.ReactNode; light?: boolean }) {
	return (
		<div
			className={`inline-flex items-center gap-1.5 text-[0.7rem] font-bold tracking-widest uppercase mb-4 ${light ? "text-green-400" : "text-blue-600"
				}`}
		>
			<span
				className={`inline-block w-4 h-0.5 rounded-full ${light ? "bg-green-400" : "bg-blue-600"}`}
			/>
			{children}
		</div>
	);
}

function CheckIcon() {
	return (
		<svg
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth={3}
			strokeLinecap="round"
			strokeLinejoin="round"
			className="w-3 h-3"
		>
			<polyline points="20 6 9 17 4 12" />
		</svg>
	);
}

function ArrowRight({ size = 18 }: { size?: number }) {
	return (
		<svg
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth={2.5}
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<line x1="5" y1="12" x2="19" y2="12" />
			<polyline points="12 5 19 12 12 19" />
		</svg>
	);
}

function LinkBtn({
	href,
	children,
	className = "",
}: {
	href: string;
	children: React.ReactNode;
	className?: string;
}) {
	return (
		<a
			href={href}
			className={`inline-flex items-center gap-2 text-[0.9rem] font-bold text-blue-600 transition-all duration-200 hover:gap-3 ${className}`}
		>
			{children}
			<ArrowRight size={18} />
		</a>
	);
}

// ─── Navbar ──────────────────────────────────────────────────────────────────
function Navbar() {
	const { t } = useTranslation();
	const [scrolled, setScrolled] = useState(false);
	const [menuOpen, setMenuOpen] = useState(false);

	useEffect(() => {
		const onScroll = () => setScrolled(window.scrollY > 20);
		window.addEventListener("scroll", onScroll);
		return () => window.removeEventListener("scroll", onScroll);
	}, []);

	return (
		<>
			<nav
				className={`fixed top-0 left-0 right-0 z-50 h-[72px] flex items-center px-6 transition-all duration-300 ${scrolled ? "bg-white shadow-[0_1px_0_#e8e8e8,0_4px_16px_rgba(15,31,61,0.06)]" : ""
					}`}
			>
				<div className="max-w-[1200px] mx-auto w-full flex items-center justify-between">
					<a
						href="#"
						className="flex items-center gap-3 transition-transform duration-200 hover:scale-[1.02]"
					>

						<span
							className={`font-black tracking-[0.15em] text-[1.25rem] transition-colors duration-300 ${scrolled ? "text-[#0d1b2e]" : "text-white"
								}`}
						>
							MANTO
						</span>
					</a>

					<div className="hidden md:flex items-center gap-8">
						{["Home", "About", "Services", "Contact"].map((item) => (
							<a
								key={item}
								href={item === "Home" ? "#" : `#${item.toLowerCase()}`}
								className="text-[0.9rem] font-semibold text-[#5a6a82] hover:text-[#0066FF] transition-colors duration-200"
							>
								{t(`homepage.nav.${item.toLowerCase()}`)}
							</a>
						))}
						<a
							href="#/pricing"
							className="text-[0.9rem] font-semibold text-[#5a6a82] hover:text-[#0066FF] transition-colors duration-200"
						>
							{t("homepage.nav.pricing")}
						</a>
					</div>

					<div className="hidden md:flex items-center gap-4">
						<a
							href="#/login"
							className="inline-flex items-center gap-2 px-[22px] py-[10px] rounded-full bg-blue-600 text-white text-[0.85rem] font-bold hover:bg-blue-700 transition-all duration-200 hover:-translate-y-px"
						>
							{t("homepage.nav.get_dashboard")}
						</a>
						<LanguageSwitcher />
					</div>

					<button
						className="md:hidden flex flex-col gap-[5px] p-1 cursor-pointer"
						onClick={() => setMenuOpen(true)}
						aria-label="Open menu"
					>
						<span className="w-6 h-0.5 bg-[#0d1b2e] rounded-full" />
						<span className="w-6 h-0.5 bg-[#0d1b2e] rounded-full" />
						<span className="w-6 h-0.5 bg-[#0d1b2e] rounded-full" />
					</button>
				</div>
			</nav>

			{/* Mobile Menu */}
			{menuOpen && (
				<div className="fixed inset-0 z-[999] bg-white flex flex-col items-center justify-center gap-8">
					<button
						className="absolute top-6 right-6 text-2xl text-[#0d1b2e]"
						onClick={() => setMenuOpen(false)}
					>
						✕
					</button>
					{["Home", "About", "Services", "Contact"].map((item) => (
						<a
							key={item}
							href={item === "Home" ? "#" : `#${item.toLowerCase()}`}
							onClick={() => setMenuOpen(false)}
							className="text-2xl font-bold text-[#0d1b2e]"
						>
							{t(`homepage.nav.${item.toLowerCase()}`)}
						</a>
					))}
					<a
						href="#/pricing"
						onClick={() => setMenuOpen(false)}
						className="text-2xl font-bold text-[#0d1b2e]"
					>
						{t("homepage.nav.pricing")}
					</a>
					<a
						href="#/login"
						onClick={() => setMenuOpen(false)}
						className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-blue-600 text-white font-bold"
					>
						{t("homepage.nav.get_dashboard")}
					</a>
					<LanguageSwitcher />
				</div>
			)}
		</>
	);
}

// ─── Hero ─────────────────────────────────────────────────────────────────────
function Hero() {
	const { t } = useTranslation();
	return (
		<section
			id="home"
			className="min-h-screen relative flex flex-col justify-center overflow-hidden"
			style={{
				backgroundImage: `linear-gradient(135deg, rgba(24, 34, 48, 0.85) 0%, rgba(25, 31, 44, 0.9) 40%, rgba(29, 32, 31, 0.95) 100%),
				 url(${heroBg})`,
				backgroundSize: "cover",
				backgroundPosition: "center",
				backgroundRepeat: "no-repeat",
			}}
		>
			{/* Grid overlay */}

			{/* Glow orbs */}
			<div
				className="absolute w-[600px] h-[600px] rounded-full pointer-events-none"
				style={{
					background: "radial-gradient(circle, rgba(2, 12, 8, 0.25) 0%, transparent 70%)",
					top: -100,
					right: -100,
				}}
			/>
			<div
				className="absolute w-[400px] h-[400px] rounded-full pointer-events-none"
				style={{
					background: "radial-gradient(circle, rgba(26,60,107,0.3) 0%, transparent 70%)",
					bottom: 100,
					left: -50,
				}}
			/>

			<div className="relative z-10 max-w-[1200px] mx-auto w-full px-6 pt-[140px] pb-[60px]">
				<div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-12 items-center">
					{/* Left */}
					<div>
						<div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 backdrop-blur-xl rounded-full px-4 py-2 mb-6 text-white text-[0.8rem] font-semibold">
							<span className="text-amber-400 tracking-widest text-[0.75rem]">★★★★★</span>
							{t("homepage.hero.stars_badge")}
						</div>
						<h1 className="text-white font-extrabold leading-[1.05] tracking-[-0.04em] text-[clamp(2.6rem,5vw,4.2rem)] mb-5">
							{t("homepage.hero.title_main")}
							<br />
							<span className="text-green-400">{t("homepage.hero.title_sub")}</span>
						</h1>
						<p className="text-white/70 text-[1.05rem] max-w-[520px] leading-[1.7] mb-9">
							{t("homepage.hero.desc")}
						</p>
						<div className="flex flex-wrap gap-4 items-center">
							<a
								href="#/login"
								className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-blue-600 text-white font-bold text-[1rem] hover:bg-blue-700 transition-all duration-200 hover:-translate-y-px"
							>
								{t("homepage.hero.btn_start")}
							</a>
							<a
								href="#/pricing"
								className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white/10 border border-white/20 text-white font-bold text-[1rem] hover:bg-white/20 transition-all duration-200 hover:-translate-y-px"
							>
								{t("homepage.hero.view_pricing")}
							</a>
						</div>
					</div>

					{/* Stat Card */}
					<div className="hidden lg:block bg-white/[0.08] border border-white/15 backdrop-blur-xl rounded-2xl p-7 text-white">
						<div className="text-4xl font-extrabold text-green-400 leading-none">{t("homepage.hero.stat_value")}</div>
						<div className="text-[0.85rem] font-semibold mt-1.5 mb-4 opacity-90">
							{t("homepage.hero.stat_desc")}
						</div>
						<div className="h-px bg-white/15 my-4" />
						<div className="text-[0.7rem] font-bold uppercase tracking-widest text-white/50 mb-1.5">

						</div>
						<div className="text-[0.8rem] text-white/70 leading-[1.5]">
							{t("homepage.hero.stat_detail")}
						</div>
					</div>
				</div>
			</div>

			{/* Process Strip */}
			<div className="relative z-10 bg-white/[0.06] border-t border-white/10 backdrop-blur-xl px-6 py-8">
				<div className="max-w-[1200px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
					{[
						{
							icon: (
								<svg viewBox="0 0 24 24" className="w-[18px] h-[18px] stroke-green-400 fill-none stroke-2">
									<path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
									<path d="M12 6v6l4 2" />
								</svg>
							),
							title: t("homepage.hero.steps.survey_title"),
							desc: t("homepage.hero.steps.survey_desc"),
						},
						{
							icon: (
								<svg viewBox="0 0 24 24" className="w-[18px] h-[18px] stroke-green-400 fill-none stroke-2">
									<line x1="18" y1="20" x2="18" y2="10" />
									<line x1="12" y1="20" x2="12" y2="4" />
									<line x1="6" y1="20" x2="6" y2="14" />
								</svg>
							),
							title: t("homepage.hero.steps.analytics_title"),
							desc: t("homepage.hero.steps.analytics_desc"),
						},
						{
							icon: (
								<svg viewBox="0 0 24 24" className="w-[18px] h-[18px] stroke-green-400 fill-none stroke-2">
									<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
								</svg>
							),
							title: t("homepage.hero.steps.care_title"),
							desc: t("homepage.hero.steps.care_desc"),
						},
						{
							icon: (
								<svg viewBox="0 0 24 24" className="w-[18px] h-[18px] stroke-green-400 fill-none stroke-2">
									<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
									<polyline points="22 4 12 14.01 9 11.01" />
								</svg>
							),
							title: t("homepage.hero.steps.uplift_title"),
							desc: t("homepage.hero.steps.uplift_desc"),
						},
					].map((step) => (
						<div key={step.title} className="flex items-start gap-3.5">
							<div className="w-10 h-10 rounded-[10px] bg-green-900/30 flex items-center justify-center flex-shrink-0">
								{step.icon}
							</div>
							<div>
								<div className="text-[0.82rem] font-bold text-white mb-0.5">{step.title}</div>
								<div className="text-[0.73rem] text-white/55 leading-[1.5]">{step.desc}</div>
							</div>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}

// ─── About ────────────────────────────────────────────────────────────────────
function About() {
	const { t } = useTranslation();
	return (
		<section id="about" className="py-[100px] bg-white">
			<div className="max-w-[1200px] mx-auto px-6">
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
					{/* Image column */}
					<div className="relative">
						<img
							src={aboutImg}
							alt="About Manto"
							className="w-full aspect-[4/5] rounded-[20px] object-cover bg-[#f5f6f8]"
						/>

						{/* Avatars badge */}
						<div className="absolute top-6 -left-6 bg-white rounded-full px-4 py-2.5 shadow-[0_4px_16px_rgba(15,31,61,0.08),0_20px_48px_rgba(15,31,61,0.12)] border border-[#e8e8e8] flex items-center gap-2">
							<div className="flex">
								{[
									{ initials: "JK", bg: "bg-blue-600" },
									{ initials: "ML", bg: "bg-indigo-500" },
									{ initials: "AS", bg: "bg-orange-500" },
								].map((a, i) => (
									<div
										key={a.initials}
										className={`w-[30px] h-[30px] rounded-full border-2 border-white ${a.bg} flex items-center justify-center text-[0.65rem] font-bold text-white ${i > 0 ? "-ml-2" : ""}`}
									>
										{a.initials}
									</div>
								))}
							</div>
							<div className="text-[0.75rem] font-bold text-[#0d1b2e] whitespace-nowrap">
								200+{" "}
								<span className="block text-[#5a6a82] font-normal text-[0.68rem]">
									{t("homepage.about.projects")}
								</span>
							</div>
							<div className="w-px h-7 bg-[#e8e8e8]" />
							<div className="text-[0.75rem] font-bold text-[#0d1b2e] whitespace-nowrap">
								50K+{" "}
								<span className="block text-[#5a6a82] font-normal text-[0.68rem]">
									{t("homepage.about.components")}
								</span>
							</div>
						</div>

						{/* Quality card */}
						<div className="absolute bottom-[-24px] right-[-24px] bg-white rounded-2xl p-5 shadow-[0_4px_16px_rgba(15,31,61,0.08),0_20px_48px_rgba(15,31,61,0.12)] border border-[#e8e8e8] max-w-[240px]">
							<div className="text-[0.75rem] font-bold uppercase tracking-[0.08em] text-blue-600 mb-1">
								{t("homepage.about.quality_title")}
							</div>
							<div className="text-[0.8rem] text-[#5a6a82] leading-[1.5]">
								{t("homepage.about.quality_desc")}
							</div>
						</div>
					</div>

					{/* Text column */}
					<div>
						<Eyebrow>{t("homepage.about.eyebrow")}</Eyebrow>
						<h2 className="text-[clamp(1.8rem,3.5vw,2.8rem)] font-extrabold leading-[1.1] tracking-[-0.03em] text-[#0d1b2e]">
							{t("homepage.about.title")}
						</h2>
						<p className="text-[#5a6a82] leading-[1.75] mt-5 mb-7">
							{t("homepage.about.desc1")}
						</p>
						<p className="text-[#5a6a82] leading-[1.75] mb-7">
							{t("homepage.about.desc2")}
						</p>
						<LinkBtn href="#services">{t("homepage.about.btn")}</LinkBtn>
					</div>
				</div>
			</div>
		</section>
	);
}

// ─── Values ───────────────────────────────────────────────────────────────────
function Values() {
	const { t } = useTranslation();
	const cards = [
		{
			tag: t("homepage.values.card1.tag"),
			tagVariant: "primary",
			title: t("homepage.values.card1.title"),
			desc: t("homepage.values.card1.desc"),
			image: valueImg1,
		},
		{
			tag: t("homepage.values.card2.tag"),
			tagVariant: "navy",
			title: t("homepage.values.card2.title"),
			desc: t("homepage.values.card2.desc"),
			image: valueImg2,
		},
		{
			tag: t("homepage.values.card3.tag"),
			tagVariant: "primary",
			title: t("homepage.values.card3.title"),
			desc: t("homepage.values.card3.desc"),
			image: valueImg3,
		},
	];

	return (
		<section className="py-[100px] bg-[#f5f6f8]">
			<div className="max-w-[1200px] mx-auto px-6">
				<div className="text-center mb-14">
					<Eyebrow>{t("homepage.values.eyebrow")}</Eyebrow>
					<h2 className="text-[clamp(1.8rem,3.5vw,2.8rem)] font-extrabold leading-[1.1] tracking-[-0.03em] text-[#0d1b2e]">
						{t("homepage.values.title")}
					</h2>
					<p className="text-[#5a6a82] text-[1rem] max-w-[560px] mx-auto leading-[1.7] mt-3">
						{t("homepage.values.desc")}
					</p>
				</div>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					{cards.map((c) => (
						<div
							key={c.title}
							className="bg-white rounded-[18px] overflow-hidden border border-[#e8e8e8] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_4px_16px_rgba(15,31,61,0.08),0_20px_48px_rgba(15,31,61,0.12)]"
						>
							{c.image ? (
								<img
									src={c.image}
									alt={c.title}
									className="w-full h-[200px] object-cover bg-[#f0f1f4]"
								/>
							) : (
								<div className="w-full h-[200px] bg-[#f0f1f4]" />
							)}
							<div className="p-6">
								<span
									className={`inline-block px-3 py-1 rounded-full text-[0.7rem] font-bold uppercase tracking-[0.06em] mb-2.5 ${c.tagVariant === "primary"
										? "bg-blue-50 text-blue-600"
										: "bg-black/[0.08] text-[#0d1b2e]"
										}`}
								>
									{c.tag}
								</span>
								<div className="text-[1rem] font-extrabold text-[#0d1b2e] mb-2">{c.title}</div>
								<div className="text-[0.85rem] text-[#5a6a82] leading-[1.6]">{c.desc}</div>
							</div>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}

// ─── Why Choose Us ─────────────────────────────────────────────────────────────
function WhyChooseUs() {
	const { t } = useTranslation();
	const [activeTab, setActiveTab] = useState(0);
	const data = WHY_TABS[activeTab];

	const tabLabels = [
		{
			label: t("homepage.why.tabs.science"),
			icon: (
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
					<path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
					<path d="M12 6v6l4 2" />
				</svg>
			),
		},
		{
			label: t("homepage.why.tabs.integration"),
			icon: (
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
					<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
					<circle cx="9" cy="7" r="4" />
				</svg>
			),
		},
		{
			label: t("homepage.why.tabs.privacy"),
			icon: (
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
					<rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
					<path d="M7 11V7a5 5 0 0 1 10 0v4" />
				</svg>
			),
		},
	];

	return (
		<section id="why" className="py-[100px] bg-white">
			<div className="max-w-[1200px] mx-auto px-6">
				<div className="text-center mb-12">
					<Eyebrow>{t("homepage.why.eyebrow")}</Eyebrow>
					<h2 className="text-[clamp(1.8rem,3.5vw,2.8rem)] font-extrabold leading-[1.1] tracking-[-0.03em] text-[#0d1b2e]">
						{t("homepage.why.title")}
					</h2>
				</div>

				<div className="flex gap-3 mb-10 flex-wrap">
					{tabLabels.map((t, i) => (
						<button
							key={t.label}
							onClick={() => setActiveTab(i)}
							className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-[0.85rem] font-bold cursor-pointer transition-all duration-200 border-2 ${activeTab === i
								? "bg-[#0d1b2e] text-white border-[#0d1b2e]"
								: "bg-transparent text-[#5a6a82] border-[#e8e8e8] hover:border-blue-600 hover:text-blue-600"
								}`}
						>
							{t.icon} {t.label}
						</button>
					))}
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
					<img
						src={whyImg}
						alt="Why Choose Us"
						className="w-full aspect-square rounded-[20px] object-cover bg-[#f5f6f8]"
					/>
					<div>
						<h3 className="text-2xl font-extrabold text-[#0d1b2e] mb-4 tracking-[-0.02em]">
							{t(`homepage.why.tab${activeTab}.title`)}
						</h3>
						<p className="text-[0.95rem] text-[#5a6a82] leading-[1.75] mb-7">
							{t(`homepage.why.tab${activeTab}.desc`)}
						</p>
						<div className="flex flex-col gap-4 mb-8">
							{[
								{ num: "1", title: data.p1, desc: data.d1 },
								{ num: "2", title: data.p2, desc: data.d2 },
							].map((pt) => (
								<div key={pt.num} className="flex items-start gap-3">
									<div className="w-[22px] h-[22px] rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0 mt-0.5 text-blue-600">
										<CheckIcon />
									</div>
									<div>
										<div className="text-[0.9rem] font-bold text-[#0d1b2e]">
											{t(`homepage.why.tab${activeTab}.p${pt.num}`)}
										</div>
										<div className="text-[0.82rem] text-[#5a6a82] mt-0.5">
											{t(`homepage.why.tab${activeTab}.d${pt.num}`)}
										</div>
									</div>
								</div>
							))}
						</div>
						<a
							href="#/login"
							className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-blue-600 text-white font-bold text-[0.9rem] hover:bg-blue-700 transition-all duration-200 hover:-translate-y-px"
						>
							{t("homepage.why.btn")} <ArrowRight />
						</a>
					</div>
				</div>
			</div>
		</section>
	);
}

// ─── Stats ────────────────────────────────────────────────────────────────────
function Stats() {
	const { t } = useTranslation();
	const stats = [
		{ value: "35%+", label: t("homepage.stats.stat1") },
		{ value: "85%", label: t("homepage.stats.stat2") },
		{ value: "15K+", label: t("homepage.stats.stat3") },
		{ value: "12%", label: t("homepage.stats.stat4") },
	];
	return (
		<section className="py-20 bg-[#f5f6f8]">
			<div className="max-w-[1200px] mx-auto px-6">
				<div className="grid grid-cols-2 lg:grid-cols-4">
					{stats.map((s, i) => (
						<div
							key={s.label}
							className={`text-center py-10 px-6 relative ${i < stats.length - 1
								? "after:content-[''] after:absolute after:right-0 after:top-[25%] after:bottom-[25%] after:w-px after:bg-[#e8e8e8] max-lg:even:after:hidden"
								: ""
								}`}
						>
							<div className="text-[clamp(2.4rem,4vw,3.5rem)] font-extrabold text-blue-600 tracking-[-0.04em] leading-none">
								{s.value}
							</div>
							<div className="text-[0.85rem] text-[#5a6a82] font-medium mt-2">{s.label}</div>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}


// ─── Expertise / Contact ───────────────────────────────────────────────────────
function Expertise() {
	const { t } = useTranslation();
	return (
		<section id="contact" className="py-[100px] bg-white">
			<div className="max-w-[1200px] mx-auto px-6">
				<div className="text-center mb-14">
					<Eyebrow>{t("homepage.expertise.eyebrow")}</Eyebrow>
					<h2 className="text-[clamp(1.8rem,3.5vw,2.8rem)] font-extrabold leading-[1.1] tracking-[-0.03em] text-[#0d1b2e]">
						{t("homepage.expertise.title")}
					</h2>
				</div>
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
					<img
						src={contactImg}
						alt="See Manto in Action"
						className="w-full aspect-[4/3] rounded-[20px] object-cover bg-[#f5f6f8]"
					/>
					<div className="bg-[#f5f6f8] rounded-[20px] p-9 border border-[#e8e8e8]">
						<div className="text-[1.3rem] font-extrabold text-[#0d1b2e] mb-2 tracking-[-0.02em]">
							{t("homepage.expertise.demo_title")}
						</div>
						<div className="text-[0.87rem] text-[#5a6a82] mb-7 leading-[1.6]">
							{t("homepage.expertise.demo_desc")}
						</div>
						<table className="w-full border-collapse mb-7">
							<tbody>
								{[
									{ key: "mon_thu", hours: "08:00 – 18:00", highlight: false },
									{ key: "fri", hours: "09:00 – 17:00", highlight: true },
									{ key: "sat", hours: "08:30 – 19:30", highlight: false },
									{ key: "sun", hours: "08:30 – 19:30", highlight: false },
								].map((row) => (
									<tr key={row.key} className="border-b border-[#e8e8e8] last:border-0">
										<td className="py-[11px] text-[0.85rem] text-[#5a6a82] font-medium">
											{t(`homepage.expertise.days.${row.key}`)}
										</td>
										<td
											className={`py-[11px] text-[0.85rem] font-bold text-right ${row.highlight ? "text-blue-600" : "text-[#0d1b2e]"
												}`}
										>
											{row.hours}
										</td>
									</tr>
								))}
							</tbody>
						</table>
						<button className="w-full flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors">
							{t("homepage.expertise.btn")}
							<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
								<rect x="3" y="4" width="18" height="18" rx="2" />
								<line x1="16" y1="2" x2="16" y2="6" />
								<line x1="8" y1="2" x2="8" y2="6" />
								<line x1="3" y1="10" x2="21" y2="10" />
							</svg>
						</button>
					</div>
				</div>
			</div>
		</section>
	);
}


// ─── Services ─────────────────────────────────────────────────────────────────
function Services() {
	const { t } = useTranslation();
	const services = [
		{
			id: "srv1",
			tags: [
				{ labelKey: "tag1", variant: "primary" },
				{ labelKey: "tag2", variant: "navy" },
			],
			image: serviceImg1,
		},
		{
			id: "srv2",
			tags: [
				{ labelKey: "tag1", variant: "primary" },
				{ labelKey: "tag2", variant: "navy" },
			],
			image: serviceImg2,
		},
		{
			id: "srv3",
			tags: [
				{ labelKey: "tag1", variant: "primary" },
				{ labelKey: "tag2", variant: "navy" },
			],
			image: serviceImg3,
		},
		{
			id: "srv4",
			tags: [
				{ labelKey: "tag1", variant: "primary" },
				{ labelKey: "tag2", variant: "navy" },
			],
			image: serviceImg4,
		},
	];

	return (
		<section id="services" className="py-[100px] bg-white">
			<div className="max-w-[1200px] mx-auto px-6">
				<div className="flex items-end justify-between mb-12 flex-wrap gap-3">
					<div>
						<Eyebrow>{t("homepage.services.eyebrow")}</Eyebrow>
						<h2 className="text-[clamp(1.8rem,3.5vw,2.8rem)] font-extrabold leading-[1.1] tracking-[-0.03em] text-[#0d1b2e]">
							{t("homepage.services.title")}
						</h2>
					</div>
					<LinkBtn href="#">{t("homepage.services.btn_all")}</LinkBtn>
				</div>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					{services.map((s) => (
						<div
							key={s.id}
							className="bg-white rounded-[18px] border border-[#e8e8e8] overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_4px_16px_rgba(15,31,61,0.08),0_20px_48px_rgba(15,31,61,0.12)]"
						>
							{s.image ? (
								<img
									src={s.image}
									alt={t(`homepage.services.${s.id}.title`)}
									className="w-full h-[200px] object-cover bg-[#f0f1f4]"
								/>
							) : (
								<div className="w-full h-[200px] bg-[#f0f1f4]" />
							)}
							<div className="p-6">
								<div className="flex gap-2 mb-3 flex-wrap">
									{s.tags.map((tItem) => (
										<span
											key={tItem.labelKey}
											className={`inline-block px-3 py-1 rounded-full text-[0.7rem] font-bold uppercase tracking-[0.06em] ${tItem.variant === "primary" ? "bg-blue-50 text-blue-600" : "bg-black/[0.08] text-[#0d1b2e]"
												}`}
										>
											{t(`homepage.services.${s.id}.${tItem.labelKey}`)}
										</span>
									))}
								</div>
								<div className="text-[1rem] font-extrabold text-[#0d1b2e] mb-2">
									{t(`homepage.services.${s.id}.title`)}
								</div>
								<div className="text-[0.83rem] text-[#5a6a82] leading-[1.6] mb-4">
									{t(`homepage.services.${s.id}.desc`)}
								</div>
								<LinkBtn href="#">{t("homepage.services.btn_more")}</LinkBtn>
							</div>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}

// ─── Testimonials ─────────────────────────────────────────────────────────────
function Testimonials() {
	const { t } = useTranslation();
	const [current, setCurrent] = useState(0);
	const [visible, setVisible] = useState(true);

	const navigate = (dir: number) => {
		setVisible(false);
		setTimeout(() => {
			setCurrent((c) => (c + dir + TESTIMONIALS.length) % TESTIMONIALS.length);
			setVisible(true);
		}, 200);
	};

	const q = TESTIMONIALS[current];

	return (
		<section className="py-[100px] bg-[#f5f6f8]">
			<div className="max-w-[1200px] mx-auto px-6">
				<div className="text-center mb-14">
					<Eyebrow>{t("homepage.testimonials.eyebrow")}</Eyebrow>
					<h2 className="text-[clamp(1.8rem,3.5vw,2.8rem)] font-extrabold leading-[1.1] tracking-[-0.03em] text-[#0d1b2e]">
						{t("homepage.testimonials.title")}
					</h2>
				</div>
				<div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-12 items-center">
					{/* Left image */}
					<div className="relative">
						<img
							src={testimonialImg}
							alt="What Leaders Say"
							className="w-full aspect-[3/4] rounded-[20px] object-cover bg-[#e8e9ed]"
						/>
						<div className="lg:absolute lg:bottom-[-20px] lg:right-[-20px] mt-4 lg:mt-0 bg-white rounded-2xl p-4 pr-5 shadow-[0_4px_16px_rgba(15,31,61,0.08),0_20px_48px_rgba(15,31,61,0.12)] border border-[#e8e8e8]">
							<div className="text-[0.7rem] font-bold uppercase tracking-[0.08em] text-[#8896aa] mb-2">
								{t("homepage.testimonials.clients")}
							</div>
							<div className="flex items-center gap-3">
								<div className="text-[1.1rem] font-extrabold text-[#0d1b2e]">5K+</div>
								<div className="flex gap-2">
									{["Nexvera", "Corepath", "Lumis", "Arkon"].map((name) => (
										<span
											key={name}
											className="px-2.5 py-1 rounded bg-[#f5f6f8] text-[0.65rem] font-bold text-[#5a6a82] border border-[#e8e8e8]"
										>
											{name}
										</span>
									))}
								</div>
							</div>
						</div>
					</div>

					{/* Quote */}
					<div>
						<div
							className="bg-white rounded-[20px] p-9 border border-[#e8e8e8] shadow-[0_2px_8px_rgba(15,31,61,0.06),0_8px_24px_rgba(15,31,61,0.08)] transition-all duration-200"
							style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(8px)" }}
						>
							<svg viewBox="0 0 48 48" className="w-10 h-10 fill-blue-50">
								<path
									d="M14 8C8.477 8 4 12.477 4 18v6c0 5.523 4.477 10 10 10h2v6l8-6h2c5.523 0 10-4.477 10-10V18c0-5.523-4.477-10-10-10H14z"
									className="fill-blue-600"
								/>
							</svg>
							<p className="text-[1.05rem] text-[#0d1b2e] leading-[1.75] italic my-4">{q.text}</p>
							<div className="flex items-center gap-3.5">
								<div className="w-[46px] h-[46px] rounded-full bg-blue-600 flex items-center justify-center text-[0.9rem] font-bold text-white flex-shrink-0">
									{q.initials}
								</div>
								<div>
									<div className="text-[0.9rem] font-extrabold text-[#0d1b2e]">{q.name}</div>
									<div className="text-[0.78rem] text-[#5a6a82]">{q.role}</div>
								</div>
							</div>
						</div>
						<div className="flex gap-2.5 mt-6">
							{[
								{ dir: -1, points: "15 18 9 12 15 6" },
								{ dir: 1, points: "9 18 15 12 9 6" },
							].map(({ dir, points }) => (
								<button
									key={dir}
									onClick={() => navigate(dir)}
									className="w-10 h-10 rounded-full border-2 border-[#e8e8e8] bg-transparent flex items-center justify-center cursor-pointer transition-all duration-200 hover:border-blue-600 hover:bg-blue-50"
								>
									<svg viewBox="0 0 24 24" fill="none" stroke="#0d1b2e" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
										<polyline points={points} />
									</svg>
								</button>
							))}
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}


// ─── CTA Banner ───────────────────────────────────────────────────────────────
function CTABanner() {
	const { t } = useTranslation();
	return (
		<section
			className="py-[100px] relative overflow-hidden"
			style={{
				background: "linear-gradient(135deg, #0f1f3d 0%, #1a3050 60%, #0d2a1e 100%)",
			}}
		>
			<div className="max-w-[1200px] mx-auto px-6">
				<div className="flex flex-col lg:flex-row items-center justify-between gap-12">
					<div>
						<h2 className="text-[clamp(1.8rem,3.5vw,2.8rem)] font-extrabold leading-[1.1] tracking-[-0.03em] text-white">
							{t("homepage.cta.title_main")}
							<br />
							{t("homepage.cta.title_sub")}
						</h2>
						<p className="text-white/65 text-[1rem] mt-3 max-w-[560px] leading-[1.7]">
							{t("homepage.cta.desc")}
						</p>
						<div className="flex gap-3 mt-8 flex-wrap">
							<a
								href="#/login"
								className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-white text-[#0d1b2e] font-bold text-[0.9rem] hover:bg-[#f5f6f8] transition-colors"
							>
								{t("homepage.cta.btn_dashboard")} <ArrowRight size={16} />
							</a>
							<a
								href="#"
								className="inline-flex items-center gap-2 px-7 py-3 rounded-full text-white/70 border-2 border-white/20 font-bold text-[0.9rem] hover:border-white/40 transition-colors"
							>
								{t("homepage.cta.btn_cases")}
							</a>
						</div>
					</div>
					<div className="bg-white/[0.08] border border-white/15 backdrop-blur-xl rounded-2xl p-8 text-center min-w-[180px]">
						<div className="w-12 h-8 rounded-lg bg-white/10 flex items-center justify-center mx-auto mb-3">
							<svg viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth={2} strokeLinecap="round" className="w-5 h-5">
								<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
								<circle cx="9" cy="7" r="4" />
								<path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
							</svg>
						</div>
						<div className="text-3xl font-extrabold text-white">500+</div>
						<div className="text-[0.8rem] text-white/65 font-medium mt-1">
							{t("homepage.cta.stat")}
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer() {
	const { t } = useTranslation();
	return (
		<footer className="bg-[#0d1b2e] pt-20">
			<div className="max-w-[1200px] mx-auto px-6">
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.3fr] gap-12 mb-16">
					{/* Brand */}
					<div>
						<div className="flex items-center gap-3 font-extrabold text-[1.25rem] text-white mb-4">
							<span className="tracking-[0.15em]">MANTO</span>
						</div>
						<p className="text-[0.85rem] text-white/50 leading-[1.65] max-w-[240px] mb-5">
							{t("homepage.footer.desc")}
						</p>
						<p className="text-[0.8rem] text-white/40 leading-[1.6]">
							{t("homepage.footer.email")}
							<br />
							{t("homepage.footer.location")}
						</p>
					</div>

					{/* Main Pages */}
					<div>
						<div className="text-[0.75rem] font-bold uppercase tracking-[0.1em] text-white/40 mb-5">
							{t("homepage.footer.pages")}
						</div>
						<div className="flex flex-col gap-[11px]">
							{["Home", "About", "Pricing", "Contact", "Services", "Blog", "Case Studies"].map((link) => (
								<a key={link} href="#" className="text-[0.85rem] text-white/60 hover:text-white transition-colors">
									{link}
								</a>
							))}
						</div>
					</div>

					{/* Resources */}
					<div>
						<div className="text-[0.75rem] font-bold uppercase tracking-[0.1em] text-white/40 mb-5">
							{t("homepage.footer.resources")}
						</div>
						<div className="flex flex-col gap-[11px]">
							{["Service Details", "Blog Details", "Case Study Details", "Privacy Policy", "Terms of Service"].map((link) => (
								<a key={link} href="#" className="text-[0.85rem] text-white/60 hover:text-white transition-colors">
									{link}
								</a>
							))}
						</div>
					</div>

					{/* Newsletter */}
					<div>
						<div className="text-[1rem] font-bold text-white mb-2">{t("homepage.footer.community")}</div>
						<p className="text-[0.83rem] text-white/50 mb-5 leading-[1.55]">
							{t("homepage.footer.community_desc")}
						</p>
						<div className="flex">
							<input
								type="email"
								placeholder="your@email.com"
								className="flex-1 px-4 py-3 bg-white/[0.08] border border-white/15 border-r-0 rounded-l-full text-white text-[0.85rem] outline-none placeholder:text-white/35 focus:border-blue-500/50 transition-colors"
							/>
							<button className="px-5 py-3 bg-blue-600 border-0 rounded-r-full text-white text-[0.85rem] font-bold cursor-pointer hover:bg-blue-700 transition-colors">
								{t("homepage.footer.subscribe")}
							</button>
						</div>
					</div>
				</div>

				{/* Footer bottom */}
				<div className="border-t border-white/[0.08] py-6 flex flex-wrap items-center justify-between gap-4">
					<div className="text-[0.8rem] text-white/35">
						{t("homepage.footer.copyright")}
					</div>
					<div className="flex gap-3">
						{[
							{ label: "Facebook", d: "M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" },
							{ label: "TikTok", d: "M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" },
							{ label: "Twitter", d: "M4 4l16 16M20 4L4 20" },
							{ label: "Instagram", isRect: true },
						].map((s) => (
							<a
								key={s.label}
								href="#"
								aria-label={s.label}
								className="w-9 h-9 rounded-full bg-white/[0.08] border border-white/[0.12] flex items-center justify-center transition-all duration-200 hover:bg-blue-600 hover:border-blue-600 group"
							>
								<svg viewBox="0 0 24 24" className="w-4 h-4 fill-white/60 group-hover:fill-white">
									{s.isRect ? (
										<>
											<rect x="2" y="2" width="20" height="20" rx="5" />
											<circle cx="12" cy="12" r="5" />
											<circle cx="17.5" cy="6.5" r="1.5" />
										</>
									) : (
										<path d={s.d} />
									)}
								</svg>
							</a>
						))}
					</div>
				</div>
			</div>
		</footer>
	);
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function MantoLanding() {
	return (
		<div className="landing-page font-sans text-[#0d1b2e] bg-white overflow-x-hidden">
			<Navbar />
			<Hero />
			<About />
			<Values />
			<WhyChooseUs />
			<Stats />
			<Expertise />
			<Services />
			<Testimonials />
			<CTABanner />
			<Footer />
		</div>
	);
}