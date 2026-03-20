'use client'

import { useState, useEffect } from 'react'
import { Save, Loader2, Info } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

const VARIABLES = [
  '{{business_name}}', '{{owner_name}}', '{{business_type}}',
  '{{website}}', '{{calendly_link}}', '{{portfolio_link}}', '{{whatsapp_link}}',
  '{{quality_score}}', '{{recommended_service}}', '{{location}}',
]

const DEFAULT_SUBJECT = 'A quick win for your {{business_type}} business 🚀'
const DEFAULT_BODY = `Hi there,

I came across {{business_name}} and noticed an opportunity to help you get more clients online.

After reviewing your online presence, I believe we can help you with {{recommended_service}} — which would make a real difference for your {{business_type}} business.

Here's a quick overview of what we offer: {{portfolio_link}}

I'd love to chat for 15 minutes — no pitch, just value. You can book a free slot here: {{calendly_link}}

Or reach me directly on WhatsApp: {{whatsapp_link}}

Best,
{{from_name}}`

export default function EmailPage() {
  const [subject, setSubject] = useState(DEFAULT_SUBJECT)
  const [body, setBody] = useState(DEFAULT_BODY)
  const [saving, setSaving] = useState(false)
  const [preview, setPreview] = useState(false)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('email_templates')
        .select('*').eq('user_id', user.id).eq('is_default', true).single()
      if (data) { setSubject(data.subject || DEFAULT_SUBJECT); setBody(data.body || DEFAULT_BODY) }
    }
    load()
  }, [])

  async function save() {
    setSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data: existing } = await supabase.from('email_templates')
      .select('id').eq('user_id', user.id).eq('is_default', true).single()
    if (existing) {
      await supabase.from('email_templates').update({ subject, body }).eq('id', existing.id)
    } else {
      await supabase.from('email_templates').insert({ user_id: user.id, subject, body, is_default: true, name: 'Default Template' })
    }
    toast.success('Template saved')
    setSaving(false)
  }

  const previewText = (txt: string) => txt
    .replace('{{business_name}}', 'Bright Spark Electrical')
    .replace('{{owner_name}}', 'James')
    .replace('{{business_type}}', 'Electrician')
    .replace('{{website}}', 'brightspark.com')
    .replace('{{calendly_link}}', 'https://calendly.com/you')
    .replace('{{portfolio_link}}', 'https://youragency.com')
    .replace('{{whatsapp_link}}', 'https://wa.me/123')
    .replace('{{quality_score}}', '42')
    .replace('{{recommended_service}}', 'website redesign')
    .replace('{{location}}', 'New York, USA')
    .replace('{{from_name}}', 'Alex from Agency')

  return (
    <div className="p-6 animate-fade-in max-w-4xl">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>
            Email Templates
          </h1>
          <p className="text-sm text-gray-500">Customize the outreach email sent to every lead</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setPreview(v => !v)}
            className="btn-secondary text-sm px-4 py-2.5">
            {preview ? 'Edit' : 'Preview'}
          </button>
          <button onClick={save} disabled={saving} className="btn-primary text-sm px-5 py-2.5">
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            {saving ? 'Saving…' : 'Save Template'}
          </button>
        </div>
      </div>

      {/* Variables reference */}
      <div className="card p-4 mb-5 bg-blue-50" style={{ border: '1px solid rgba(37,99,235,0.15)' }}>
        <div className="flex items-start gap-2">
          <Info size={15} className="text-blue-500 mt-0.5 shrink-0" />
          <div>
            <div className="text-sm font-medium text-blue-900 mb-2">Available template variables</div>
            <div className="flex flex-wrap gap-2">
              {VARIABLES.map(v => (
                <code key={v} className="text-xs px-2 py-1 rounded-md bg-white text-blue-700 border border-blue-100 font-mono cursor-pointer"
                  onClick={() => {
                    const el = document.getElementById('email-body') as HTMLTextAreaElement
                    if (el) {
                      const start = el.selectionStart, end = el.selectionEnd
                      setBody(b => b.slice(0, start) + v + b.slice(end))
                    }
                  }}>
                  {v}
                </code>
              ))}
            </div>
            <p className="text-xs text-blue-600 mt-2">Click a variable to insert it at your cursor position in the email body</p>
          </div>
        </div>
      </div>

      <div className="card p-6 bg-white">
        {!preview ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Subject Line</label>
              <input className="input-base" value={subject} onChange={e => setSubject(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Body</label>
              <textarea
                id="email-body"
                className="input-base font-mono text-sm"
                style={{ minHeight: '360px', lineHeight: '1.7' }}
                value={body}
                onChange={e => setBody(e.target.value)}
              />
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-3 mb-5 pb-5" style={{ borderBottom: '1px solid #f0f2f5' }}>
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              <div className="flex-1 text-center text-xs text-gray-400">Email Preview — sample data applied</div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <span className="text-gray-400 w-16 shrink-0">Subject:</span>
                <span className="font-semibold text-gray-900">{previewText(subject)}</span>
              </div>
              <div className="h-px bg-gray-100" />
              <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed"
                style={{ fontFamily: 'Georgia, serif' }}>
                {previewText(body)}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
