'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      toast.error(error.message)
      setLoading(false)
    } else {
      toast.success('Welcome back!')
      router.push('/dashboard')
      router.refresh()
    }
  }

  async function handleGoogle() {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` }
    })
  }

  return (
    <div className="min-h-screen bg-white flex" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      {/* Left panel */}
      <div className="hidden lg:flex w-[480px] shrink-0 flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: '#0d1117' }}>

        {/* Dot grid overlay */}
        <div className="absolute inset-0 dot-grid opacity-30" />

        {/* Green glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, rgba(0,230,118,0.15) 0%, transparent 70%)', filter: 'blur(30px)' }} />

        <div className="relative">
          <div className="flex items-center gap-2 mb-12">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold"
              style={{ background: '#00e676', color: '#0a1a0f' }}>⚡</div>
            <span className="font-bold text-white text-xl" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>
              Lead<span style={{ color: '#00e676' }}>Forge</span>
            </span>
          </div>

          <h2 className="text-3xl font-bold text-white mb-4 leading-tight"
            style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>
            Your leads are<br />waiting for you
          </h2>
          <p className="text-gray-400 leading-relaxed">
            Sign in to access your automated lead generation dashboard and see how many prospects were discovered today.
          </p>
        </div>

        {/* Stats preview */}
        <div className="relative space-y-3">
          {[
            { label: 'Leads found today', value: '47', delta: '+12 from yesterday' },
            { label: 'Emails delivered', value: '39', delta: '83% delivery rate' },
            { label: 'Workflow runs', value: '1', delta: 'Last run: 9:01 AM' },
          ].map(s => (
            <div key={s.label} className="flex items-center justify-between px-4 py-3 rounded-xl"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div>
                <div className="text-xs text-gray-500">{s.label}</div>
                <div className="text-xs text-gray-400 mt-0.5">{s.delta}</div>
              </div>
              <div className="text-2xl font-bold text-white"
                style={{ fontFamily: 'Bricolage Grotesque, sans-serif', color: '#00e676' }}>
                {s.value}
              </div>
            </div>
          ))}
        </div>

        <div className="relative text-xs text-gray-600">
          © 2025 LeadForge
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-[400px]">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-10">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold"
              style={{ background: '#00e676', color: '#0a1a0f' }}>⚡</div>
            <span className="font-bold text-gray-900 text-lg" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>
              Lead<span style={{ color: '#00e676' }}>Forge</span>
            </span>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-1"
            style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>
            Welcome back
          </h1>
          <p className="text-gray-500 text-sm mb-8">
            Sign in to your account to continue
          </p>

          {/* Google OAuth */}
          <button onClick={handleGoogle}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-700 transition-all duration-150 mb-6"
            style={{
              background: '#fff',
              border: '1.5px solid #e2e8f0',
              boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = '#cbd5e1')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = '#e2e8f0')}
          >
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
              <path d="M3.964 10.707A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-xs text-gray-400">or sign in with email</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="input-base"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium text-gray-700">Password</label>
                <Link href="/auth/forgot-password" className="text-xs font-medium hover:underline"
                  style={{ color: '#00a854' }}>
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="input-base pr-11"
                  placeholder="••••••••"
                  required
                />
                <button type="button" onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="btn-primary w-full py-3 text-sm"
              style={{ marginTop: '8px', boxShadow: loading ? 'none' : '0 4px 16px rgba(0,230,118,0.25)' }}>
              {loading ? <Loader2 size={16} className="animate-spin" /> : null}
              {loading ? 'Signing in...' : 'Sign in'}
              {!loading && <ArrowRight size={15} />}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Don&apos;t have an account?{' '}
            <Link href="/auth/signup" className="font-medium hover:underline" style={{ color: '#00a854' }}>
              Create one free
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
