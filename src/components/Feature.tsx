import { ArrowUpRight, Sparkle, Package, Frame, Palette, PenTool, Layers, Type, Aperture, Home, Camera, Brush, Box, Wand2 } from 'lucide-react'

const SoftwareIcon = ({ icon: Icon }: { icon: any }) => (
  <div className="h-14 w-14 md:h-16 md:w-16 rounded-xl liquid-glass flex items-center justify-center flex-shrink-0">
    <Icon className="h-6 w-6 md:h-7 md:w-7 text-white/80" strokeWidth={1.5} />
  </div>
)

export default function Feature() {
  const softwareRow1 = [Package, Frame, Palette, PenTool, Layers, Type, Aperture, Home]
  const softwareRow2 = [Camera, Brush, Box, Wand2, Package, Frame, Type, Layers]

  const timeline = [
    { year: '2023-Now', role: 'Freelance Creative', company: 'Solo Studio' },
    { year: '2020-2023', role: 'Head of Brand Design', company: 'Rove Studio' },
    { year: '2017-2020', role: 'Visual Stylist', company: 'Ember Works' },
  ]

  return (
    <section className="bg-[#0a0a0a] text-white min-h-screen lg:h-screen px-4 sm:px-6 md:px-10 lg:px-14 py-6 sm:py-8 md:py-10">
      {/* Header Section */}
      <div className="max-w-3xl mb-12 md:mb-16">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between lg:gap-8 mb-8">
          {/* Left - Title & Description */}
          <div className="flex-1">
            <h1 className="text-[28px] sm:text-3xl md:text-4xl lg:text-[44px] font-normal leading-[1.15] tracking-tight text-white mb-4">
              Hi, We are MANTO!
            </h1>
            <p className="text-sm md:text-[15px] leading-[1.6] text-white/60 max-w-3xl">
              A London-based independent creator shaping sharp visual systems, web-ready products, and story-first campaigns. With a decade of craft behind me, I help ideas move with focus and intention.
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
                <Sparkle className="h-3 w-3 text-white/70" strokeWidth={1.5} />
                <span className="uppercase tracking-[0.22em] text-[11px] text-white/70">Background</span>
                <Sparkle className="h-3 w-3 text-white/70" strokeWidth={1.5} />
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
              "Max reshaped our image with a degree of finesse and vision that surpassed what we'd hoped for. The process felt graceful, and the outcomes speak for themselves."
            </blockquote>

            {/* Attribution */}
            <div className="text-xs text-white/70">
              <p className="font-medium text-white/85">Elena Brooks</p>
              <p className="text-white/60">Creative Director — Halcyon</p>
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
                  hi@maxreed.com
                </a>
              </div>
              <div>
                <p className="text-xs text-white/60 mb-1">Phone</p>
                <a href="tel:+4420781163" className="text-sm text-white hover:text-white/80 transition-colors">
                  +44 207 81 63
                </a>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}
