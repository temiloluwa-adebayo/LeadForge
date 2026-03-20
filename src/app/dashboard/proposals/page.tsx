'use client'

import { useState } from 'react'
import { Save, Loader2, ExternalLink, FileText } from 'lucide-react'
import toast from 'react-hot-toast'

const VARIABLES = [
  '{{business_name}}', '{{business_type}}', '{{website_url}}',
  '{{quality_score}}', '{{recommended_service}}', '{{date}}',
  '{{calendly_link}}', '{{portfolio_link}}', '{{location}}',
]

export default function ProposalsPage() {
  const [templateId, setTemplateId] = useState('')
  const [folderId, setFolderId] = useState('')
  const [saving, setSaving] = useState(false)

  async function save() {
    setSaving(true)
    await new Promise(r => setTimeout(r, 800))
    toast.success('Proposal settings saved')
    setSaving(false)
  }

  return (
    <div className="p-6 animate-fade-in max-w-4xl">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>
            PDF Proposals
          </h1>
          <p className="text-sm text-gray-500">Configure the Google Docs template used to generate personalized proposals</p>
        </div>
        <button onClick={save} disabled={saving} className="btn-primary text-sm px-5 py-2.5">
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          {saving ? 'Saving…' : 'Save Settings'}
        </button>
      </div>

      {/* How it works */}
      <div className="card p-5 mb-5 bg-white">
        <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <FileText size={16} className="text-green-600" />
          How PDF proposals work
        </h3>
        <ol className="space-y-3">
          {[
            'Create a Google Doc template with placeholder variables like {{business_name}}',
            'Paste the Google Doc ID below (from the URL: docs.google.com/document/d/YOUR_ID/edit)',
            'Create a Google Drive folder for generated PDFs and paste the folder ID',
            'For each lead, n8n copies your template, fills in the variables, and exports it as PDF',
            'The PDF is attached or linked in the outreach email',
          ].map((step, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-gray-600">
              <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 mt-0.5"
                style={{ background: '#e8fdf0', color: '#00a854', border: '1px solid rgba(0,230,118,0.25)' }}>
                {i + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
      </div>

      <div className="card p-6 bg-white space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Google Docs Template ID
            <a href="https://docs.google.com" target="_blank" rel="noreferrer"
              className="ml-2 inline-flex items-center gap-1 text-xs text-blue-600 hover:underline">
              Open Google Docs <ExternalLink size={10} />
            </a>
          </label>
          <input className="input-base font-mono text-sm" value={templateId}
            onChange={e => setTemplateId(e.target.value)}
            placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms" />
          <p className="text-xs text-gray-400 mt-1.5">Found in your Google Doc URL: docs.google.com/document/d/<strong>THIS_PART</strong>/edit</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Output Google Drive Folder ID
            <a href="https://drive.google.com" target="_blank" rel="noreferrer"
              className="ml-2 inline-flex items-center gap-1 text-xs text-blue-600 hover:underline">
              Open Drive <ExternalLink size={10} />
            </a>
          </label>
          <input className="input-base font-mono text-sm" value={folderId}
            onChange={e => setFolderId(e.target.value)}
            placeholder="1a2B3c4D5e6F7g8H9iJkLmNoPqRsTuV" />
          <p className="text-xs text-gray-400 mt-1.5">The folder where generated PDFs will be saved. Found in the folder URL.</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Template Variables</label>
          <div className="flex flex-wrap gap-2 p-4 rounded-xl" style={{ background: '#f8fafc', border: '1px dashed #e2e8f0' }}>
            {VARIABLES.map(v => (
              <code key={v} className="text-xs px-3 py-1.5 rounded-lg bg-white text-green-700 border font-mono"
                style={{ borderColor: 'rgba(0,230,118,0.3)' }}>
                {v}
              </code>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-2">Use these exact placeholders in your Google Doc template. n8n will replace them for each lead.</p>
        </div>
      </div>
    </div>
  )
}
