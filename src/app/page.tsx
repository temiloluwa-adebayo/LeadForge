'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import {
  ArrowRight, Zap, Target, Mail, BarChart2, CheckCircle2,
  Globe, FileText, Database, Clock, ChevronRight, Menu, X
} from 'lucide-react'

const TYPED_WORDS = ['Electricians', 'Plumbers', 'Carpenters', 'Decorators', 'Contractors', 'Freelancers']

function TypedWord() {
  const [index, setIndex] = useState(0)
  const [displayed, setDisplayed] = useState('')
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const word = TYPED_WORDS[index]
    let timeout: ReturnType<typeof setTimeout>

    if (!deleting && displayed.length < word.length) {
      timeout = setTimeout(() => setDisplayed(word.slice(0, displayed.length + 1)), 80)
    } else if (!deleting && displayed.length === word.length) {
      timeout = setTimeout(() => setDeleting(true), 1800)
    } else if (deleting && displayed.length > 0) {
      timeout = setTimeout(() => setDisplayed(displayed.slice(0, -1)), 40)
    } else if (deleting && displayed.length === 0) {
      setDeleting(false)
      setIndex((i) => (i + 1) % TYPED_WORDS.length)
    }
    return () => clearTimeout(timeout)
  }, [displayed, deleting, index])

  return (
    <span style={{ color: '#00e676' }}>
      {displayed}
      <span className="inline-block w-0.5 h-8 bg-green-400 ml-1 align-middle animate-pulse" />
    </span>
  )
}

const FEATURES = [
  {
    icon: <Target size={20} />,
    title: 'Smart Lead Discovery',
    desc: 'Pulls targeted business leads from Google Search using ScrapingBee. Filters duplicates automatically.'
  },
  {
    icon: <Globe size={20} />,
    title: 'Website Intelligence',
    desc: 'Analyzes every lead\'s website quality, scores it 0–100, and recommends the right service for each prospect.'
  },
  {
    icon: <FileText size={20} />,
    title: 'PDF Proposals',
    desc: 'Auto-generates personalized PDF proposals via Google Docs templates. Every lead gets a bespoke pitch.'
  },
  {
    icon: <Mail size={20} />,
    title: 'Gmail Outreach',
    desc: 'Sends personalized cold emails through your own Gmail. Real sender, real deliverability.'
  },
  {
    icon: <Database size={20} />,
    title: 'Google Sheets Sync',
    desc: 'All leads are logged to your Google Sheet in real time. Full visibility, zero manual data entry.'
  },
  {
    icon: <Clock size={20} />,
    title: 'Scheduled Automation',
    desc: 'Set it once and it runs every day. Configure the hour, frequency, and targets from your dashboard.'
  },
]

const STEPS = [
  { num: '01', title: 'Create your account', desc: 'Sign up and complete a 3-minute onboarding to configure your targets and outreach details.' },
  { num: '02', title: 'Connect your tools', desc: 'Link your Gmail, Google Sheets, and n8n webhook. We guide you through every step.' },
  { num: '03', title: 'Set your targets', desc: 'Tell us which industries and locations to search. Add your booking link and portfolio.' },
  { num: '04', title: 'Launch and watch it work', desc: 'Hit Run and watch leads flow in, emails go out, and your pipeline grow — automatically.' },
]

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      {/* ── NAVBAR ──────────────────────────────────────────────── */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          background: scrolled ? 'rgba(255,255,255,0.95)' : 'transparent',
          backdropFilter: scrolled ? 'blur(16px)' : 'none',
          borderBottom: scrolled ? '1px solid #e8ecf0' : '1px solid transparent',
        }}
      >
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold"
              style={{ background: '#00e676', color: '#0a1a0f' }}
            >⚡</div>
            <span className="font-bold text-gray-900 text-lg tracking-tight" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>
              Lead<span style={{ color: '#00e676' }}>Forge</span>
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            {['Features', 'How it Works', 'Pricing'].map(item => (
              <a key={item} href={`#${item.toLowerCase().replace(/ /g, '-')}`}
                className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
                {item}
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link href="/auth/login"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors px-4 py-2">
              Sign in
            </Link>
            <Link href="/auth/signup"
              className="btn-primary text-sm px-5 py-2.5"
              style={{ borderRadius: '8px' }}>
              Get started free
              <ArrowRight size={15} />
            </Link>
          </div>

          <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(v => !v)}>
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 px-6 py-4 flex flex-col gap-4">
            {['Features', 'How it Works', 'Pricing'].map(item => (
              <a key={item} href="#" className="text-sm font-medium text-gray-600">{item}</a>
            ))}
            <Link href="/auth/login" className="text-sm font-medium text-gray-600">Sign in</Link>
            <Link href="/auth/signup" className="btn-primary text-sm justify-center">Get started free</Link>
          </div>
        )}
      </nav>

      {/* ── HERO ────────────────────────────────────────────────── */}
      <section className="relative pt-32 pb-24 overflow-hidden dot-grid">
        {/* Fade overlay on dot grid */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/40 to-white pointer-events-none" />

        {/* Green glow blob */}
        <div
          className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse, rgba(0,230,118,0.12) 0%, transparent 70%)',
            filter: 'blur(40px)',
          }}
        />

        <div className="relative max-w-4xl mx-auto px-6 text-center">
          {/* Pill badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium mb-8 animate-fade-up"
            style={{
              background: '#e8fdf0',
              color: '#0a7a3a',
              border: '1px solid rgba(0,230,118,0.3)',
            }}>
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            Powered by n8n automation
            <ChevronRight size={14} />
          </div>

          <h1
            className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-tight mb-6 animate-fade-up delay-100"
            style={{ fontFamily: 'Bricolage Grotesque, sans-serif', color: '#0d1117' }}
          >
            Find and reach<br />
            <TypedWord />{' '}
            <span className="text-gray-300">on autopilot</span>
          </h1>

          <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-up delay-200">
            LeadForge searches Google for local businesses, analyzes their online presence,
            generates personalized proposals, and sends cold emails — fully automated, every day.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up delay-300">
            <Link href="/auth/signup"
              className="btn-primary px-8 py-3.5 text-base w-full sm:w-auto"
              style={{ borderRadius: '10px', boxShadow: '0 4px 24px rgba(0,230,118,0.35)' }}>
              Start generating leads
              <ArrowRight size={18} />
            </Link>
            <Link href="#how-it-works"
              className="btn-secondary px-8 py-3.5 text-base w-full sm:w-auto"
              style={{ borderRadius: '10px' }}>
              See how it works
            </Link>
          </div>

          {/* Trust indicators */}
          <div className="flex items-center justify-center gap-6 mt-10 text-sm text-gray-400 animate-fade-up delay-400">
            {['No credit card required', 'Setup in 5 minutes', 'Cancel anytime'].map((t, i) => (
              <span key={i} className="flex items-center gap-1.5">
                <CheckCircle2 size={13} className="text-green-400" />
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* Dashboard preview mockup */}
        <div className="relative max-w-5xl mx-auto px-6 mt-20 animate-fade-up delay-500">
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              border: '1px solid #e2e8f0',
              boxShadow: '0 24px 80px rgba(0,0,0,0.12), 0 4px 16px rgba(0,0,0,0.05)',
            }}
          >
            {/* Window chrome */}
            <div className="flex items-center gap-2 px-5 py-3.5 bg-gray-50 border-b border-gray-200">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
              <div className="flex-1 mx-6">
                <div className="h-6 rounded-md bg-white border border-gray-200 flex items-center px-3">
                  <span className="text-xs text-gray-400 font-mono">app.leadforge.io/dashboard</span>
                </div>
              </div>
            </div>

            {/* Dashboard mockup */}
            <div className="bg-white p-6" style={{ minHeight: '360px' }}>
              <div className="flex gap-6">
                {/* Sidebar */}
                <div className="w-44 shrink-0">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-7 h-7 rounded-lg bg-green-400 flex items-center justify-center text-xs font-bold text-green-900">⚡</div>
                    <span className="text-sm font-bold text-gray-900">LeadForge</span>
                  </div>
                  {['Campaign', 'Leads', 'Analytics', 'History', 'Email', 'Proposals'].map((item, i) => (
                    <div key={item}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium mb-1 ${i === 0 ? 'bg-green-50 text-green-700' : 'text-gray-500'}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${i === 0 ? 'bg-green-400' : 'bg-gray-300'}`} />
                      {item}
                    </div>
                  ))}
                </div>

                {/* Main area */}
                <div className="flex-1">
                  <div className="grid grid-cols-4 gap-3 mb-4">
                    {[
                      { label: 'Total Leads', value: '2,847', color: '#0d1117' },
                      { label: 'Emails Sent', value: '2,391', color: '#00e676' },
                      { label: 'Open Rate', value: '34.2%', color: '#0d1117' },
                      { label: 'Replies', value: '127', color: '#0d1117' },
                    ].map(s => (
                      <div key={s.label} className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                        <div className="text-lg font-bold" style={{ fontFamily: 'Bricolage Grotesque, sans-serif', color: s.color }}>{s.value}</div>
                        <div className="text-xs text-gray-400">{s.label}</div>
                      </div>
                    ))}
                  </div>
                  {/* Table rows */}
                  <div className="rounded-xl border border-gray-100 overflow-hidden">
                    <div className="grid grid-cols-4 px-4 py-2 bg-gray-50 text-xs font-medium text-gray-400 border-b border-gray-100">
                      <span>Business</span><span>Industry</span><span>Score</span><span>Status</span>
                    </div>
                    {[
                      ['Bright Spark Electric', 'Electrician', 72, 'Sent'],
                      ['ProFix Plumbing Co.', 'Plumber', 58, 'Sent'],
                      ['Luxury Interiors Ltd', 'Decorator', 84, 'Replied'],
                      ['Oak & Pine Carpentry', 'Carpenter', 41, 'Pending'],
                    ].map(([name, ind, score, status]) => (
                      <div key={String(name)} className="grid grid-cols-4 px-4 py-2.5 text-xs border-b border-gray-50 last:border-0 items-center">
                        <span className="font-medium text-gray-800 truncate">{String(name)}</span>
                        <span className="text-gray-400">{String(ind)}</span>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1 rounded-full bg-gray-100 max-w-16">
                            <div className="h-1 rounded-full bg-green-400" style={{ width: `${score}%` }} />
                          </div>
                          <span className="text-gray-500">{String(score)}</span>
                        </div>
                        <span className={`inline-flex w-fit px-2 py-0.5 rounded-full text-xs font-medium ${
                          status === 'Sent' ? 'bg-blue-50 text-blue-600' :
                          status === 'Replied' ? 'bg-green-50 text-green-700' :
                          'bg-amber-50 text-amber-600'
                        }`}>{String(status)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ────────────────────────────────────────────── */}
      <section id="features" className="py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="badge-green inline-flex mb-4">
              <Zap size={13} />
              Everything you need
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4"
              style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>
              From search to signed client
            </h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">
              Every step of your outreach pipeline, automated end to end.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 stagger">
            {FEATURES.map(f => (
              <div key={f.title} className="card p-6 bg-white">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 text-green-600"
                  style={{ background: '#e8fdf0', border: '1px solid rgba(0,230,118,0.2)' }}
                >
                  {f.icon}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────────────── */}
      <section id="how-it-works" className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="badge-green inline-flex mb-4">
              <BarChart2 size={13} />
              Simple process
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4"
              style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>
              Up and running in minutes
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6 stagger">
            {STEPS.map(s => (
              <div key={s.num} className="flex gap-5 p-6 card bg-white">
                <div
                  className="text-2xl font-bold shrink-0 w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{
                    fontFamily: 'Bricolage Grotesque, sans-serif',
                    background: '#e8fdf0',
                    color: '#00a854',
                    border: '1px solid rgba(0,230,118,0.25)',
                  }}
                >
                  {s.num}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{s.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────── */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <div
            className="rounded-2xl p-12"
            style={{
              background: 'linear-gradient(135deg, #0d1117 0%, #1a2332 100%)',
              boxShadow: '0 24px 80px rgba(0,0,0,0.2)',
            }}
          >
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-6"
              style={{ background: '#00e676', color: '#0a1a0f' }}
            >⚡</div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4"
              style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>
              Ready to fill your pipeline?
            </h2>
            <p className="text-gray-400 mb-8 text-lg">
              Join hundreds of freelancers and agencies automating their outreach with LeadForge.
            </p>
            <Link href="/auth/signup"
              className="btn-primary px-10 py-4 text-base inline-flex"
              style={{ borderRadius: '10px', boxShadow: '0 4px 24px rgba(0,230,118,0.4)' }}>
              Create your free account
              <ArrowRight size={18} />
            </Link>
            <p className="text-gray-500 text-sm mt-4">No credit card required</p>
          </div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────── */}
      <footer className="bg-white border-t border-gray-100 py-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold"
              style={{ background: '#00e676', color: '#0a1a0f' }}>⚡</div>
            <span className="font-bold text-gray-900" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>
              Lead<span style={{ color: '#00e676' }}>Forge</span>
            </span>
          </div>
          <p className="text-sm text-gray-400">© 2025 LeadForge. All rights reserved.</p>
          <div className="flex gap-6 text-sm text-gray-400">
            <a href="#" className="hover:text-gray-700 transition-colors">Privacy</a>
            <a href="#" className="hover:text-gray-700 transition-colors">Terms</a>
            <a href="#" className="hover:text-gray-700 transition-colors">Support</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
