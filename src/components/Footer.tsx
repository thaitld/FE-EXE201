import { motion } from 'motion/react'
import { Share2, Send, MessageSquare, Mail, Zap, Users, FileText } from 'lucide-react'

export default function Footer() {
  const socialLinks = [
    { icon: Share2, href: '#', label: 'LinkedIn', color: '#6b7aff' },
    { icon: Send, href: '#', label: 'GitHub', color: '#6b7aff' },
    { icon: MessageSquare, href: '#', label: 'Twitter', color: '#6b7aff' },
    { icon: Mail, href: '#', label: 'Email', color: '#6b7aff' },
  ]

  const companyLinks = [
    'About',
    'Blog',
    'Contact',
    'Careers',
  ]

  const resourceLinks = [
    'Documentation',
    'API Reference',
    'Integrations',
    'Help Center',
  ]

  const legalLinks = [
    'Privacy Policy',
    'Terms of Service',
    'Compliance',
    'Security',
  ]

  return (
    <motion.footer
      className="w-full p-6 md:p-12 relative z-20 mx-0 mb-0 border-t-4"
      style={{
        backgroundColor: '#0f1117',
        borderTopColor: '#6b7aff',
        fontFamily: "'Barlow', sans-serif",
        color: '#e8eaf0',
      }}
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
    >
      {/* Main Content Grid */}
      <div className="max-w-7xl mx-auto">
        {/* Top Section - Logo, Navigation, Widget */}
        <div
          className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 mb-12 pb-8"
          style={{ borderBottom: '1px solid #1e2030' }}
        >
          {/* Left: Logo & Brand */}
          <div className="md:col-span-3">
            <div className="mb-6">
              <h2
                style={{
                  fontFamily: "'Playfair Display', 'Georgia', serif",
                  fontSize: 'clamp(2.5rem, 5vw, 3.5rem)',
                  fontWeight: 700,
                  color: '#ffffff',
                  lineHeight: 1.1,
                  letterSpacing: '-0.01em',
                  marginBottom: '0.375rem',
                }}
              >
                MANTO
              </h2>
              <p
                className="text-sm font-medium tracking-widest uppercase"
                style={{ color: '#6b7aff', fontSize: '11px', letterSpacing: '0.12em' }}
              >
                Workforce Intelligence
              </p>
            </div>
            <p className="text-xs leading-relaxed max-w-xs" style={{ color: '#6b7280' }}>
              Empowering organizations with real-time people analytics, burnout prevention, and AI-driven insights for a healthier, more productive workforce.
            </p>
          </div>

          {/* Middle: Navigation Columns */}
          <div className="md:col-span-5">
            <div className="grid grid-cols-3 gap-6">
              {/* Company */}
              <div>
                <h4
                  className="text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-2"
                  style={{ color: '#6b7aff' }}
                >
                  <span
                    className="inline-flex items-center justify-center w-6 h-6 rounded-sm"
                    style={{ backgroundColor: '#1e2030' }}
                  >
                    <Users size={13} color="#6b7aff" />
                  </span>
                  Company
                </h4>
                <ul className="space-y-2">
                  {companyLinks.map((link) => (
                    <li key={link}>
                      <a
                        href="#"
                        className="text-xs font-medium transition-colors duration-200"
                        style={{ color: '#9ca3af' }}
                        onMouseEnter={e => (e.currentTarget.style.color = '#ffffff')}
                        onMouseLeave={e => (e.currentTarget.style.color = '#9ca3af')}
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Resources */}
              <div>
                <h4
                  className="text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-2"
                  style={{ color: '#6b7aff' }}
                >
                  <span
                    className="inline-flex items-center justify-center w-6 h-6 rounded-sm"
                    style={{ backgroundColor: '#1e2030' }}
                  >
                    <FileText size={13} color="#6b7aff" />
                  </span>
                  Resources
                </h4>
                <ul className="space-y-2">
                  {resourceLinks.map((link) => (
                    <li key={link}>
                      <a
                        href="#"
                        className="text-xs font-medium transition-colors duration-200"
                        style={{ color: '#9ca3af' }}
                        onMouseEnter={e => (e.currentTarget.style.color = '#ffffff')}
                        onMouseLeave={e => (e.currentTarget.style.color = '#9ca3af')}
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Legal */}
              <div>
                <h4
                  className="text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-2"
                  style={{ color: '#6b7aff' }}
                >
                  <span
                    className="inline-flex items-center justify-center w-6 h-6 rounded-sm"
                    style={{ backgroundColor: '#1e2030' }}
                  >
                    <Zap size={13} color="#6b7aff" />
                  </span>
                  Legal
                </h4>
                <ul className="space-y-2">
                  {legalLinks.map((link) => (
                    <li key={link}>
                      <a
                        href="#"
                        className="text-xs font-medium transition-colors duration-200"
                        style={{ color: '#9ca3af' }}
                        onMouseEnter={e => (e.currentTarget.style.color = '#ffffff')}
                        onMouseLeave={e => (e.currentTarget.style.color = '#9ca3af')}
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Right: Feature Widget */}
          <div className="md:col-span-4">
            <div
              className="rounded-2xl p-6 flex flex-col h-full"
              style={{
                backgroundColor: '#141624',
                border: '1px solid #1e2030',
              }}
            >
              <div className="mb-4">
                <div
                  className="inline-block px-3 py-1 rounded-full text-[10px] font-bold tracking-wider mb-3"
                  style={{ backgroundColor: '#6b7aff', color: '#ffffff' }}
                >
                  PLATFORM
                </div>
                <h3 className="text-lg font-bold mb-1" style={{ color: '#ffffff' }}>
                  Latest Release
                </h3>
                <p className="text-xs mb-3" style={{ color: '#6b7280' }}>
                  Version 2.1 - Advanced AI Analytics
                </p>
              </div>

              <div className="space-y-3 text-xs">
                {['Burnout prediction models', 'Real-time insights', 'Enhanced analytics'].map((item) => (
                  <div key={item} className="flex items-center gap-2" style={{ color: '#9ca3af' }}>
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#6b7aff' }} />
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <a
                href="#"
                className="mt-4 inline-block px-4 py-2 rounded-lg text-xs font-bold transition-colors duration-200"
                style={{ backgroundColor: '#6b7aff', color: '#ffffff' }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#5a68e8')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#6b7aff')}
              >
                Learn More
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Section - Contact, Social, Credits */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          {/* Left: Contact Info */}
          <div>
            <div className="mb-4">
              <h4
                className="text-xs font-bold uppercase tracking-widest mb-2"
                style={{ color: '#9ca3af' }}
              >
                Visit Us
              </h4>
              <p className="text-xs font-medium" style={{ color: '#6b7280' }}>EXE201</p>
              <p className="text-xs font-medium" style={{ color: '#6b7280' }}>FPT University</p>
            </div>
            <div>
              <p
                className="text-xs font-bold uppercase tracking-widest mb-2"
                style={{ color: '#9ca3af' }}
              >
                Contact
              </p>
              <a
                href="mailto:hello@manto.io"
                className="text-xs font-medium transition-colors duration-200"
                style={{ color: '#6b7aff' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#ffffff')}
                onMouseLeave={e => (e.currentTarget.style.color = '#6b7aff')}
              >
                hello@manto.io
              </a>
            </div>
          </div>

          {/* Center: Decorative Message */}
          <div className="text-center">
            <div
              className="inline-block rounded-full px-6 py-2 mb-2"
              style={{ backgroundColor: '#1e2030', border: '1px solid #2a2f4a' }}
            >
              <p
                className="text-xs font-bold uppercase tracking-wider"
                style={{ color: '#6b7aff' }}
              >
                Follow us for updates
              </p>
            </div>
            <p className="text-[10px] mt-2" style={{ color: '#4b5563' }}>
              Join our community & stay informed
            </p>
          </div>

          {/* Right: Social & Credits */}
          <div className="flex flex-col items-end">
            <div className="flex gap-3 mb-4">
              {socialLinks.map((social) => {
                const Icon = social.icon
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    className="flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200"
                    style={{
                      border: '1px solid #1e2030',
                      color: '#6b7280',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = '#6b7aff'
                      e.currentTarget.style.color = '#6b7aff'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = '#1e2030'
                      e.currentTarget.style.color = '#6b7280'
                    }}
                    aria-label={social.label}
                  >
                    <Icon size={15} />
                  </a>
                )
              })}
            </div>

            <p className="text-[10px] uppercase tracking-widest" style={{ color: '#4b5563' }}>
              © 2026 MANTO • Workforce Intelligence
            </p>
          </div>
        </div>
      </div>
    </motion.footer>
  )
}