'use client'

import { useState, useEffect } from 'react'
import { CheckCircle2, AlertCircle, ExternalLink, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

type Integration = {
  id: string
  name: string
  description: string
  icon: string
  status: 'connected' | 'not_configured' | 'error'
  configKey?: string
  docsUrl: string
  setupNote: string
}

const INTEGRATIONS: Integration[] = [
  {
    id: 'n8n',
    name: 'n8n Workflow',
    description: 'The automation engine that orchestrates all lead generation tasks',
    icon: '⚡',
    status: 'not_configured',
    configKey: 'n8n_webhook_url',
    docsUrl: 'https://docs.n8n.io',
    setupNote: 'Add a Webhook node to your n8n workflow and paste the URL in Campaign Setup.',
  },
  {
    id: 'gmail',
    name: 'Gmail',
    description: 'Sends outreach emails to each lead (Phase 6 of workflow)',
    icon: '📧',
    status: 'not_configured',
    docsUrl: 'https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.gmail/',
    setupNote: 'Connect Gmail inside n8n using OAuth2 credentials in your Gmail node.',
  },
  {
    id: 'sheets',
    name: 'Google Sheets',
    description: 'Stores and deduplicates leads in a spreadsheet (Phase 7)',
    icon: '📊',
    status: 'not_configured',
    docsUrl: 'https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.googlesheets/',
    setupNote: 'Configure Google Sheets credentials in n8n and set your Sheet ID.',
  },
  {
    id: 'drive',
    name: 'Google Drive',
    description: 'Stores generated PDF proposals',
    icon: '📁',
    status: 'not_configured',
    docsUrl: 'https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.googledrive/',
    setupNote: 'Use the same Google OAuth2 credentials as Sheets.',
  },
  {
    id: 'docs',
    name: 'Google Docs',
    description: 'Source template for personalized proposals (Phase 5)',
    icon: '📄',
    status: 'not_configured',
    docsUrl: 'https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.googledocs/',
    setupNote: 'Set your Google Doc template ID in the Proposals page.',
  },
  {
    id: 'scrapingbee',
    name: 'ScrapingBee',
    description: 'Fetches Google SERP results and business website HTML',
    icon: '🕷️',
    status: 'not_configured',
    docsUrl: 'https://www.scrapingbee.com/documentation/',
    setupNote: 'Add your ScrapingBee API key to your n8n ScrapingBee node credentials.',
  },
]

export default function IntegrationsPage() {
  const [webhookUrl, setWebhookUrl] = useState('')
  const [saving, setSaving] = useState(false)
  const [integrations, setIntegrations] = useState(INTEGRATIONS)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('profiles').select('n8n_webhook_url').eq('id', user.id).single()
      if (data?.n8n_webhook_url) {
        setWebhookUrl(data.n8n_webhook_url)
        setIntegrations(prev => prev.map(i => i.id === 'n8n' ? { ...i, status: 'connected' } : i))
      }
    }
    load()
  }, [])

  async function saveWebhook() {
    setSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('profiles').update({ n8n_webhook_url: webhookUrl }).eq('id', user.id)
    setIntegrations(prev => prev.map(i => i.id === 'n8n' ? { ...i, status: webhookUrl ? 'connected' : 'not_configured' } : i))
    toast.success('Webhook saved')
    setSaving(false)
  }

  async function testWebhook() {
    if (!webhookUrl) { toast.error('Enter a webhook URL first'); return }
    try {
      await fetch(webhookUrl, { method: 'POST', body: JSON.stringify({ test: true, source: 'LeadForge' }), headers: { 'Content-Type': 'application/json' } })
      toast.success('Test ping sent — check your n8n executions')
    } catch {
      toast('Request sent — check n8n (CORS may block browser response)', { icon: 'ℹ️' })
    }
  }

  return (
    <div className="p-6 animate-fade-in max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>
          Integrations
        </h1>
        <p className="text-sm text-gray-500">Services connected to your n8n workflow</p>
      </div>

      {/* n8n webhook config */}
      <div className="card p-6 bg-white mb-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
            style={{ background: '#e8fdf0', border: '1px solid rgba(0,230,118,0.2)' }}>⚡</div>
          <div>
            <div className="text-sm font-semibold text-gray-900">n8n Webhook URL</div>
            <div className="text-xs text-gray-500">Required to trigger your automation</div>
          </div>
        </div>
        <div className="flex gap-3">
          <input className="input-base font-mono text-sm flex-1" value={webhookUrl}
            onChange={e => setWebhookUrl(e.target.value)}
            placeholder="https://your-n8n.com/webhook/abc123" />
          <button onClick={testWebhook} className="btn-secondary text-sm px-4 shrink-0">Test</button>
          <button onClick={saveWebhook} disabled={saving} className="btn-primary text-sm px-5 shrink-0">
            {saving ? <Loader2 size={14} className="animate-spin" /> : 'Save'}
          </button>
        </div>
      </div>

      {/* Integration cards */}
      <div className="grid md:grid-cols-2 gap-4 stagger">
        {integrations.map(integration => (
          <div key={integration.id} className="card p-5 bg-white">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                  style={{ background: '#f8fafc', border: '1px solid #f0f2f5' }}>
                  {integration.icon}
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-900">{integration.name}</div>
                  <div className="text-xs text-gray-500">{integration.description}</div>
                </div>
              </div>
              {integration.status === 'connected' ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-green-700 bg-green-50 px-2.5 py-1 rounded-lg border border-green-100">
                  <CheckCircle2 size={11} style={{ color: '#00e676' }} />
                  Connected
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-100">
                  <AlertCircle size={11} />
                  Not set
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mb-3 leading-relaxed">{integration.setupNote}</p>
            <a href={integration.docsUrl} target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline font-medium">
              View setup docs <ExternalLink size={10} />
            </a>
          </div>
        ))}
      </div>
    </div>
  )
}
