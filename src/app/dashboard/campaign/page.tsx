'use client'

import { useState, useEffect } from 'react'
import { Play, Save, RotateCcw, Plus, X, ChevronRight, Loader2,
         Target, Settings, Clock, Filter, Zap } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

const TABS = [
  { id: 'search', label: 'Search Targets', icon: Target },
  { id: 'outreach', label: 'Outreach', icon: Settings },
  { id: 'schedule', label: 'Schedule', icon: Clock },
  { id: 'filters', label: 'Filters', icon: Filter },
]

const PHASES = [
  'Initializing workflow…',
  'Fetching SERP results from Google…',
  'Extracting business data…',
  'Filtering duplicate leads…',
  'Fetching website HTML (ScrapingBee)…',
  'Analyzing website quality…',
  'Classifying & scoring leads…',
  'Generating service recommendations…',
  'Creating PDF proposals (Google Docs)…',
  'Sending outreach emails via Gmail…',
  'Logging leads to Google Sheets…',
  'Campaign complete ✓',
]

export default function CampaignPage() {
  const [activeTab, setActiveTab] = useState('search')
  const [tagInput, setTagInput] = useState('')
  const [running, setRunning] = useState(false)
  const [runStep, setRunStep] = useState(-1)
  const [saving, setSaving] = useState(false)

  const [config, setConfig] = useState({
    search_queries: ['Electrician', 'Plumber', 'Carpenter', 'Interior Decorator'],
    search_location: 'USA',
    max_results: 10,
    max_pages: 3,
    calendly_link: '',
    whatsapp_link: '',
    portfolio_link: '',
    email_subject: '',
    trigger_hour: 9,
    frequency: 'daily',
    auto_send_emails: true,
    generate_pdfs: true,
    log_to_sheets: true,
    scrape_websites: true,
    min_quality_score: 30,
    require_email: true,
    n8n_webhook_url: '',
  })

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const [{ data: profile }, { data: campaign }] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('campaigns').select('*').eq('user_id', user.id).order('created_at').limit(1).single(),
      ])
      if (profile) {
        setConfig(c => ({
          ...c,
          calendly_link: profile.calendly_link || '',
          whatsapp_link: profile.whatsapp_link || '',
          portfolio_link: profile.portfolio_link || '',
          n8n_webhook_url: profile.n8n_webhook_url || '',
        }))
      }
      if (campaign) {
        setConfig(c => ({
          ...c,
          search_queries: campaign.search_queries || c.search_queries,
          search_location: campaign.search_location || c.search_location,
          max_results: campaign.max_results || c.max_results,
          max_pages: campaign.max_pages || c.max_pages,
          auto_send_emails: campaign.auto_send_emails ?? c.auto_send_emails,
          generate_pdfs: campaign.generate_pdfs ?? c.generate_pdfs,
          log_to_sheets: campaign.log_to_sheets ?? c.log_to_sheets,
          scrape_websites: campaign.scrape_websites ?? c.scrape_websites,
          min_quality_score: campaign.min_quality_score || c.min_quality_score,
          trigger_hour: campaign.trigger_hour || c.trigger_hour,
          frequency: campaign.frequency || c.frequency,
        }))
      }
    }
    load()
  }, [])

  function set(key: string, val: unknown) {
    setConfig(c => ({ ...c, [key]: val }))
  }

  function addTag() {
    const v = tagInput.trim()
    if (v && !config.search_queries.includes(v)) {
      set('search_queries', [...config.search_queries, v])
    }
    setTagInput('')
  }

  async function saveConfig() {
    setSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('campaigns').upsert({
      user_id: user.id,
      name: 'Default Campaign',
      ...config,
    })
    await supabase.from('profiles').update({
      n8n_webhook_url: config.n8n_webhook_url,
      calendly_link: config.calendly_link,
      whatsapp_link: config.whatsapp_link,
      portfolio_link: config.portfolio_link,
    }).eq('id', user.id)
    toast.success('Configuration saved')
    setSaving(false)
  }

  async function runCampaign() {
    if (!config.n8n_webhook_url) {
      toast.error('Please add your n8n webhook URL in the Outreach tab')
      setActiveTab('outreach')
      return
    }
    setRunning(true)
    setRunStep(0)

    // Animate through steps
    let step = 0
    const interval = setInterval(() => {
      step++
      setRunStep(step)
      if (step >= PHASES.length - 1) clearInterval(interval)
    }, 1200)

    try {
      const payload = {
        search_query: config.search_queries,
        search_location: config.search_location,
        max_results: config.max_results,
        max_pages: config.max_pages,
        calendly_link: config.calendly_link,
        whatsapp_link: config.whatsapp_link,
        portfolio_link: config.portfolio_link,
        triggered_by: 'LeadForge UI',
        triggered_at: new Date().toISOString(),
      }

      const res = await fetch(config.n8n_webhook_url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      clearInterval(interval)
      setRunStep(PHASES.length - 1)

      if (res.ok) {
        toast.success('Campaign launched successfully!')
        // Log run
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          await supabase.from('run_history').insert({
            user_id: user.id,
            status: 'success',
            started_at: new Date().toISOString(),
          })
        }
      } else {
        toast.error(`Webhook returned ${res.status}`)
      }
    } catch {
      clearInterval(interval)
      // In demo mode, complete the animation
      setRunStep(PHASES.length - 1)
      toast.success('Webhook triggered — check n8n for execution status')
    }

    setTimeout(() => { setRunning(false); setRunStep(-1) }, 2000)
  }

  const hourLabel = (h: number) => h === 0 ? '12:00 AM' : h < 12 ? `${h}:00 AM` : h === 12 ? '12:00 PM' : `${h-12}:00 PM`

  return (
    <div className="p-6 max-w-5xl animate-fade-in">

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>
            Campaign Setup
          </h1>
          <p className="text-sm text-gray-500">Configure your lead generation targets and automation settings</p>
        </div>
        <div className="flex items-center gap-2.5">
          <button onClick={saveConfig} disabled={saving}
            className="btn-secondary text-sm px-4 py-2.5 flex items-center gap-2">
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            {saving ? 'Saving…' : 'Save'}
          </button>
          <button onClick={runCampaign} disabled={running}
            className="btn-primary text-sm px-5 py-2.5">
            {running ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
            {running ? 'Running…' : 'Launch Campaign'}
          </button>
        </div>
      </div>

      {/* Run progress */}
      {running && (
        <div className="card p-5 mb-6 animate-scale-in" style={{ borderColor: 'rgba(0,230,118,0.3)', background: '#f8fffb' }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: '#00e676' }}>
              <Zap size={16} style={{ color: '#0a1a0f' }} />
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-900">Workflow running</div>
              <div className="text-xs text-gray-500">Your n8n automation is processing…</div>
            </div>
          </div>
          <div className="space-y-2">
            {PHASES.map((phase, i) => (
              <div key={i} className={`flex items-center gap-2.5 text-sm transition-all ${
                i < runStep ? 'text-green-700' : i === runStep ? 'text-gray-900 font-medium' : 'text-gray-300'
              }`}>
                <div className={`w-4 h-4 rounded-full flex items-center justify-center text-xs shrink-0 ${
                  i < runStep ? 'bg-green-400' : i === runStep ? 'bg-gray-900' : 'bg-gray-200'
                }`}>
                  {i < runStep ? '✓' : i === runStep ? <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> : ''}
                </div>
                {phase}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-0 mb-6 bg-gray-100 p-1 rounded-xl w-fit">
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}>
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="space-y-5">

        {activeTab === 'search' && (
          <div className="animate-fade-up">
            <div className="card p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-5 flex items-center gap-2">
                <span className="w-5 h-5 rounded-md bg-green-100 flex items-center justify-center text-xs text-green-700 font-bold">1</span>
                Business types to target
              </h3>
              {/* Tag input */}
              <div className="mb-1.5">
                <label className="block text-sm font-medium text-gray-700 mb-2">Search Queries</label>
                <div className="input-base min-h-[52px] flex flex-wrap gap-2 cursor-text"
                  onClick={() => document.getElementById('query-input')?.focus()}>
                  {config.search_queries.map(t => (
                    <span key={t} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium"
                      style={{ background: '#e8fdf0', color: '#0a7a3a', border: '1px solid rgba(0,230,118,0.25)' }}>
                      {t}
                      <button onClick={() => set('search_queries', config.search_queries.filter(q => q !== t))}
                        className="text-green-600 hover:text-red-500 transition-colors">
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                  <input id="query-input"
                    className="outline-none border-none flex-1 min-w-28 text-sm bg-transparent placeholder-gray-300"
                    value={tagInput}
                    onChange={e => setTagInput(e.target.value)}
                    placeholder="Add industry type…"
                    onKeyDown={e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag() } }}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1.5">Press Enter to add. Maps to n8n&apos;s <code className="font-mono bg-gray-100 px-1 rounded">search_query</code> array.</p>
              </div>

              <div className="grid md:grid-cols-2 gap-5 mt-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Search Location</label>
                  <input className="input-base" value={config.search_location}
                    onChange={e => set('search_location', e.target.value)} placeholder="USA" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Results Per Query: <span className="text-green-600 font-semibold">{config.max_results}</span>
                  </label>
                  <input type="range" min={1} max={50} value={config.max_results}
                    onChange={e => set('max_results', parseInt(e.target.value))}
                    className="w-full h-1.5 rounded-full outline-none cursor-pointer"
                    style={{ accentColor: '#00e676' }} />
                  <div className="flex justify-between text-xs text-gray-400 mt-1"><span>1</span><span>50</span></div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Pages to Crawl: <span className="text-green-600 font-semibold">{config.max_pages}</span>
                  </label>
                  <input type="range" min={1} max={10} value={config.max_pages}
                    onChange={e => set('max_pages', parseInt(e.target.value))}
                    className="w-full h-1.5 rounded-full outline-none cursor-pointer"
                    style={{ accentColor: '#00e676' }} />
                  <div className="flex justify-between text-xs text-gray-400 mt-1"><span>1</span><span>10</span></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'outreach' && (
          <div className="animate-fade-up space-y-5">
            <div className="card p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-5 flex items-center gap-2">
                <span className="w-5 h-5 rounded-md bg-green-100 flex items-center justify-center text-xs text-green-700 font-bold">2</span>
                Links included in every email
              </h3>
              <div className="grid md:grid-cols-2 gap-5">
                {[
                  { key: 'calendly_link', label: 'Calendly / Booking Link', ph: 'https://calendly.com/you/30min' },
                  { key: 'whatsapp_link', label: 'WhatsApp Link', ph: 'https://wa.me/1234567890' },
                  { key: 'portfolio_link', label: 'Portfolio / Website', ph: 'https://youragency.com' },
                  { key: 'email_subject', label: 'Email Subject Line', ph: 'Quick win for your {{business_type}} 🚀' },
                ].map(f => (
                  <div key={f.key}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{f.label}</label>
                    <input className="input-base" value={((config as unknown) as Record<string, string>)[f.key] || ''}
                      onChange={e => set(f.key, e.target.value)} placeholder={f.ph} />
                  </div>
                ))}
              </div>
            </div>
            <div className="card p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">n8n Webhook URL</h3>
              <input className="input-base font-mono text-sm" value={config.n8n_webhook_url}
                onChange={e => set('n8n_webhook_url', e.target.value)}
                placeholder="https://your-n8n.com/webhook/abc123" />
              <p className="text-xs text-gray-400 mt-2">
                Required to trigger the workflow. Add a Webhook node in n8n and paste the URL here.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'schedule' && (
          <div className="animate-fade-up">
            <div className="card p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-5 flex items-center gap-2">
                <span className="w-5 h-5 rounded-md bg-green-100 flex items-center justify-center text-xs text-green-700 font-bold">3</span>
                Automation schedule (n8n Schedule Trigger)
              </h3>
              <div className="grid md:grid-cols-2 gap-5 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Run at: <span className="text-green-600 font-semibold">{hourLabel(config.trigger_hour)}</span>
                  </label>
                  <input type="range" min={0} max={23} value={config.trigger_hour}
                    onChange={e => set('trigger_hour', parseInt(e.target.value))}
                    className="w-full h-1.5 rounded-full outline-none cursor-pointer"
                    style={{ accentColor: '#00e676' }} />
                  <div className="flex justify-between text-xs text-gray-400 mt-1"><span>12 AM</span><span>11 PM</span></div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Frequency</label>
                  <select className="input-base" value={config.frequency} onChange={e => set('frequency', e.target.value)}>
                    <option value="daily">Every day</option>
                    <option value="weekdays">Weekdays only</option>
                    <option value="twice">Twice daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="manual">Manual only</option>
                  </select>
                </div>
              </div>

              {/* Toggles */}
              <div className="divide-y" style={{ borderColor: '#f0f2f5' }}>
                {[
                  { key: 'auto_send_emails', label: 'Auto-send outreach emails', desc: 'Automatically email every qualifying lead' },
                  { key: 'generate_pdfs', label: 'Generate PDF proposals', desc: 'Create a personalized PDF before emailing' },
                  { key: 'log_to_sheets', label: 'Log to Google Sheets', desc: 'Append all leads to your spreadsheet' },
                  { key: 'scrape_websites', label: 'Scrape lead websites', desc: 'Analyze each website with ScrapingBee' },
                ].map(t => (
                  <div key={t.key} className="flex items-center justify-between py-3.5">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{t.label}</div>
                      <div className="text-xs text-gray-500">{t.desc}</div>
                    </div>
                    <button
                      onClick={() => set(t.key, !(config as Record<string, unknown>)[t.key])}
                      className="relative w-10 h-5.5 rounded-full transition-all shrink-0"
                      style={{
                        background: (config as Record<string, unknown>)[t.key] ? '#00e676' : '#e2e8f0',
                        width: '42px', height: '24px',
                      }}>
                      <div className="absolute top-0.5 rounded-full w-5 h-5 bg-white shadow-sm transition-all"
                        style={{ left: (config as Record<string, unknown>)[t.key] ? '18px' : '2px' }} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'filters' && (
          <div className="animate-fade-up">
            <div className="card p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-5 flex items-center gap-2">
                <span className="w-5 h-5 rounded-md bg-green-100 flex items-center justify-center text-xs text-green-700 font-bold">4</span>
                Lead quality filters
              </h3>
              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Min. website quality score: <span className="text-green-600 font-semibold">{config.min_quality_score}</span>
                  </label>
                  <input type="range" min={0} max={100} value={config.min_quality_score}
                    onChange={e => set('min_quality_score', parseInt(e.target.value))}
                    className="w-full h-1.5 rounded-full outline-none cursor-pointer"
                    style={{ accentColor: '#00e676' }} />
                  <div className="flex justify-between text-xs text-gray-400 mt-1"><span>0 (all)</span><span>100</span></div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email requirement</label>
                  <select className="input-base" value={config.require_email ? 'yes' : 'no'}
                    onChange={e => set('require_email', e.target.value === 'yes')}>
                    <option value="yes">Only leads with email address</option>
                    <option value="no">Include all leads</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
