'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

const STEPS = [
  { id: 1, title: 'About you', desc: 'Tell us about your business' },
  { id: 2, title: 'Your targets', desc: 'Who are you reaching out to?' },
  { id: 3, title: 'Outreach links', desc: 'Where should leads book a call?' },
  { id: 4, title: 'n8n webhook', desc: 'Connect your automation' },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    full_name: '',
    company_name: '',
    website: '',
    industry: '',
    // targets
    search_queries: ['Electrician', 'Plumber', 'Carpenter'],
    search_location: 'USA',
    // outreach
    calendly_link: '',
    whatsapp_link: '',
    portfolio_link: '',
    from_name: '',
    reply_to_email: '',
    // n8n
    n8n_webhook_url: '',
  })

  const [tagInput, setTagInput] = useState('')

  function set(key: string, val: string) {
    setForm(f => ({ ...f, [key]: val }))
  }

  function addTag() {
    const v = tagInput.trim()
    if (v && !form.search_queries.includes(v)) {
      setForm(f => ({ ...f, search_queries: [...f.search_queries, v] }))
    }
    setTagInput('')
  }

  function removeTag(t: string) {
    setForm(f => ({ ...f, search_queries: f.search_queries.filter(q => q !== t) }))
  }

  async function finish() {
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { toast.error('Not authenticated'); setLoading(false); return }

    const { error } = await supabase.from('profiles').update({
      full_name: form.full_name,
      company_name: form.company_name,
      website: form.website,
      industry: form.industry,
      calendly_link: form.calendly_link,
      whatsapp_link: form.whatsapp_link,
      portfolio_link: form.portfolio_link,
      from_name: form.from_name,
      reply_to_email: form.reply_to_email,
      n8n_webhook_url: form.n8n_webhook_url,
      onboarding_completed: true,
    }).eq('id', user.id)

    if (error) { toast.error(error.message); setLoading(false); return }

    // Create default campaign
    await supabase.from('campaigns').insert({
      user_id: user.id,
      name: 'Default Campaign',
      search_queries: form.search_queries,
      search_location: form.search_location,
      calendly_link: form.calendly_link,
      whatsapp_link: form.whatsapp_link,
      portfolio_link: form.portfolio_link,
    })

    toast.success('Setup complete! Welcome to LeadForge.')
    router.push('/dashboard')
  }

  const progress = ((step - 1) / (STEPS.length - 1)) * 100

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-12"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-10">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold"
            style={{ background: '#00e676', color: '#0a1a0f' }}>⚡</div>
          <span className="font-bold text-gray-900 text-xl" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>
            Lead<span style={{ color: '#00e676' }}>Forge</span>
          </span>
        </div>

        {/* Step indicators */}
        <div className="flex items-center gap-2 mb-2">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center gap-2 flex-1">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                step > s.id ? 'bg-green-400 text-green-900' :
                step === s.id ? 'bg-gray-900 text-white' :
                'bg-gray-200 text-gray-400'
              }`}>
                {step > s.id ? <CheckCircle2 size={14} /> : s.id}
              </div>
              {i < STEPS.length - 1 && (
                <div className="flex-1 h-0.5 rounded-full transition-all"
                  style={{ background: step > s.id ? '#00e676' : '#e2e8f0' }} />
              )}
            </div>
          ))}
        </div>

        {/* Progress text */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="text-sm font-semibold text-gray-900">{STEPS[step-1].title}</div>
            <div className="text-xs text-gray-500">{STEPS[step-1].desc}</div>
          </div>
          <span className="text-xs text-gray-400">Step {step} of {STEPS.length}</span>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl p-8" style={{ border: '1px solid #e8ecf0', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>

          {/* STEP 1: About you */}
          {step === 1 && (
            <div className="space-y-4 animate-fade-up">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Full name</label>
                <input className="input-base" value={form.full_name} onChange={e => set('full_name', e.target.value)} placeholder="Jane Smith" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Company or freelancer name</label>
                <input className="input-base" value={form.company_name} onChange={e => set('company_name', e.target.value)} placeholder="Acme Agency" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Your website</label>
                <input className="input-base" value={form.website} onChange={e => set('website', e.target.value)} placeholder="https://youragency.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Your industry / service</label>
                <select className="input-base" value={form.industry} onChange={e => set('industry', e.target.value)}>
                  <option value="">Select your service…</option>
                  <option>Web Design & Development</option>
                  <option>SEO & Digital Marketing</option>
                  <option>Social Media Management</option>
                  <option>Graphic Design</option>
                  <option>Copywriting</option>
                  <option>Video Production</option>
                  <option>Other</option>
                </select>
              </div>
            </div>
          )}

          {/* STEP 2: Targets */}
          {step === 2 && (
            <div className="space-y-5 animate-fade-up">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Business types to target</label>
                <div className="input-base min-h-[80px] flex flex-wrap gap-2 cursor-text"
                  onClick={() => document.getElementById('tag-in')?.focus()}>
                  {form.search_queries.map(t => (
                    <span key={t} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-sm font-medium"
                      style={{ background: '#e8fdf0', color: '#0a7a3a', border: '1px solid rgba(0,230,118,0.25)' }}>
                      {t}
                      <button onClick={() => removeTag(t)} className="text-green-600 hover:text-red-500 transition-colors leading-none">×</button>
                    </span>
                  ))}
                  <input id="tag-in" className="outline-none border-none flex-1 min-w-24 text-sm bg-transparent"
                    value={tagInput} onChange={e => setTagInput(e.target.value)} placeholder="Add industry…"
                    onKeyDown={e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag() } }} />
                </div>
                <p className="text-xs text-gray-400 mt-1.5">Press Enter to add. These drive your Google Search queries.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Target location</label>
                <input className="input-base" value={form.search_location} onChange={e => set('search_location', e.target.value)}
                  placeholder="USA, London UK, Lagos Nigeria…" />
              </div>
            </div>
          )}

          {/* STEP 3: Outreach links */}
          {step === 3 && (
            <div className="space-y-4 animate-fade-up">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Your name (for emails)</label>
                <input className="input-base" value={form.from_name} onChange={e => set('from_name', e.target.value)} placeholder="James from Acme Agency" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Reply-to email</label>
                <input className="input-base" type="email" value={form.reply_to_email} onChange={e => set('reply_to_email', e.target.value)} placeholder="james@youragency.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Calendly / Booking link</label>
                <input className="input-base" value={form.calendly_link} onChange={e => set('calendly_link', e.target.value)} placeholder="https://calendly.com/you/30min" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">WhatsApp link (optional)</label>
                <input className="input-base" value={form.whatsapp_link} onChange={e => set('whatsapp_link', e.target.value)} placeholder="https://wa.me/1234567890" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Portfolio / Website link</label>
                <input className="input-base" value={form.portfolio_link} onChange={e => set('portfolio_link', e.target.value)} placeholder="https://youragency.com/work" />
              </div>
            </div>
          )}

          {/* STEP 4: n8n webhook */}
          {step === 4 && (
            <div className="animate-fade-up">
              <div className="p-4 rounded-xl mb-5"
                style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <h4 className="text-sm font-semibold text-gray-900 mb-2">How to get your webhook URL</h4>
                <ol className="text-sm text-gray-500 space-y-1.5 list-decimal list-inside">
                  <li>Open your n8n workflow</li>
                  <li>Add a <strong className="text-gray-700">Webhook</strong> node at the start</li>
                  <li>Set method to <strong className="text-gray-700">POST</strong></li>
                  <li>Copy the webhook URL and paste it below</li>
                </ol>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">n8n Webhook URL</label>
                <input className="input-base font-mono text-sm" value={form.n8n_webhook_url}
                  onChange={e => set('n8n_webhook_url', e.target.value)}
                  placeholder="https://your-n8n.com/webhook/abc123" />
                <p className="text-xs text-gray-400 mt-1.5">You can skip this and add it later in Settings.</p>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          <button className="btn-secondary px-5 py-2.5 text-sm flex items-center gap-2"
            onClick={() => step > 1 ? setStep(s => s - 1) : router.push('/')}
            disabled={loading}>
            <ArrowLeft size={15} />
            {step === 1 ? 'Back' : 'Previous'}
          </button>

          {step < STEPS.length ? (
            <button className="btn-primary px-6 py-2.5 text-sm" onClick={() => setStep(s => s + 1)}>
              Continue
              <ArrowRight size={15} />
            </button>
          ) : (
            <button className="btn-primary px-8 py-2.5 text-sm" onClick={finish} disabled={loading}>
              {loading && <Loader2 size={15} className="animate-spin" />}
              {loading ? 'Finishing...' : 'Go to Dashboard'}
              {!loading && <ArrowRight size={15} />}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
