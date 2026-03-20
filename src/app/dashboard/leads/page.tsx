'use client'

import { useState, useEffect } from 'react'
import { Search, Download, RefreshCw, ChevronUp, ChevronDown, Eye } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { format } from 'date-fns'

type Lead = {
  id: string
  business_name: string
  email: string
  industry: string
  website_url: string
  quality_score: number
  email_status: string
  location: string
  recommended_service: string
  created_at: string
}

const STATUS_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  sent: { bg: '#eff6ff', text: '#2563eb', border: 'rgba(37,99,235,0.2)' },
  pending: { bg: '#fffbeb', text: '#d97706', border: 'rgba(217,119,6,0.2)' },
  replied: { bg: '#f0fdf4', text: '#16a34a', border: 'rgba(22,163,74,0.2)' },
  failed: { bg: '#fef2f2', text: '#dc2626', border: 'rgba(220,38,38,0.2)' },
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortBy, setSortBy] = useState<'created_at' | 'quality_score'>('created_at')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)

  const stats = {
    total: leads.length,
    sent: leads.filter(l => l.email_status === 'sent').length,
    pending: leads.filter(l => l.email_status === 'pending').length,
    replied: leads.filter(l => l.email_status === 'replied').length,
  }

  useEffect(() => {
    loadLeads()
  }, [sortBy, sortDir, statusFilter])

  async function loadLeads() {
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    let q = supabase.from('leads').select('*').eq('user_id', user.id)
    if (statusFilter !== 'all') q = q.eq('email_status', statusFilter)
    q = q.order(sortBy, { ascending: sortDir === 'asc' })

    const { data } = await q.limit(200)
    setLeads(data || [])
    setLoading(false)
  }

  const filtered = leads.filter(l =>
    !search ||
    l.business_name?.toLowerCase().includes(search.toLowerCase()) ||
    l.email?.toLowerCase().includes(search.toLowerCase()) ||
    l.industry?.toLowerCase().includes(search.toLowerCase())
  )

  function toggleSort(col: 'created_at' | 'quality_score') {
    if (sortBy === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortBy(col); setSortDir('desc') }
  }

  function exportCSV() {
    const rows = [
      ['Business', 'Email', 'Industry', 'Website', 'Score', 'Status', 'Location', 'Date'],
      ...filtered.map(l => [
        l.business_name, l.email, l.industry, l.website_url,
        l.quality_score, l.email_status, l.location,
        format(new Date(l.created_at), 'yyyy-MM-dd')
      ])
    ]
    const csv = rows.map(r => r.map(v => `"${v ?? ''}"`).join(',')).join('\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    a.download = `leadforge-leads-${format(new Date(), 'yyyy-MM-dd')}.csv`
    a.click()
  }

  const scoreColor = (s: number) => s >= 70 ? '#16a34a' : s >= 40 ? '#d97706' : '#dc2626'
  const scoreBg = (s: number) => s >= 70 ? '#f0fdf4' : s >= 40 ? '#fffbeb' : '#fef2f2'

  return (
    <div className="p-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>
            Leads
          </h1>
          <p className="text-sm text-gray-500">All discovered and processed leads across campaigns</p>
        </div>
        <div className="flex gap-2">
          <button onClick={loadLeads} className="btn-secondary text-sm px-4 py-2.5 flex items-center gap-2">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
          <button onClick={exportCSV} className="btn-secondary text-sm px-4 py-2.5 flex items-center gap-2">
            <Download size={14} />
            Export CSV
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 stagger">
        {[
          { label: 'Total Leads', value: stats.total, color: '#0d1117' },
          { label: 'Emails Sent', value: stats.sent, color: '#2563eb' },
          { label: 'Pending', value: stats.pending, color: '#d97706' },
          { label: 'Replied', value: stats.replied, color: '#16a34a' },
        ].map(s => (
          <div key={s.label} className="card p-5 bg-white">
            <div className="stat-num text-3xl font-bold mb-1" style={{ fontFamily: 'Bricolage Grotesque, sans-serif', color: s.color }}>
              {s.value}
            </div>
            <div className="text-sm text-gray-500">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="card bg-white overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid #f0f2f5' }}>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                className="input-base pl-9 py-2 text-sm"
                style={{ width: '220px', minHeight: 'auto', padding: '8px 12px 8px 34px' }}
                placeholder="Search leads…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <select
              className="input-base text-sm py-2"
              style={{ width: 'auto', minHeight: 'auto', padding: '8px 12px' }}
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}>
              <option value="all">All statuses</option>
              <option value="pending">Pending</option>
              <option value="sent">Sent</option>
              <option value="replied">Replied</option>
              <option value="failed">Failed</option>
            </select>
          </div>
          <span className="text-sm text-gray-400">{filtered.length} leads</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: '#fafbfc', borderBottom: '1px solid #f0f2f5' }}>
                {[
                  { label: 'Business', key: null },
                  { label: 'Email', key: null },
                  { label: 'Industry', key: null },
                  { label: 'Score', key: 'quality_score' as const },
                  { label: 'Status', key: null },
                  { label: 'Date', key: 'created_at' as const },
                  { label: '', key: null },
                ].map(col => (
                  <th key={col.label}
                    className={`text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider ${col.key ? 'cursor-pointer hover:text-gray-700' : ''}`}
                    onClick={() => col.key && toggleSort(col.key)}>
                    <span className="flex items-center gap-1">
                      {col.label}
                      {col.key && (sortBy === col.key
                        ? (sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />)
                        : <ChevronDown size={12} className="opacity-30" />)}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #f8fafc' }}>
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="px-4 py-3.5">
                        <div className="h-4 rounded shimmer" style={{ width: `${60 + Math.random() * 40}%` }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center text-gray-400">
                    <div className="text-4xl mb-3">📭</div>
                    <div className="font-medium text-gray-600 mb-1">No leads yet</div>
                    <div className="text-sm">Run a campaign to start generating leads</div>
                  </td>
                </tr>
              ) : (
                filtered.map(lead => {
                  const st = STATUS_STYLES[lead.email_status] || STATUS_STYLES.pending
                  return (
                    <tr key={lead.id}
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                      style={{ borderBottom: '1px solid #f8fafc' }}
                      onClick={() => setSelectedLead(lead)}>
                      <td className="px-4 py-3.5">
                        <div className="text-sm font-semibold text-gray-900">{lead.business_name || '—'}</div>
                        <div className="text-xs text-gray-400">{lead.location}</div>
                      </td>
                      <td className="px-4 py-3.5 text-sm text-gray-500">{lead.email || '—'}</td>
                      <td className="px-4 py-3.5 text-sm text-gray-600">{lead.industry || '—'}</td>
                      <td className="px-4 py-3.5">
                        {lead.quality_score ? (
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 rounded-full bg-gray-100 max-w-16">
                              <div className="h-1.5 rounded-full transition-all"
                                style={{ width: `${lead.quality_score}%`, background: scoreColor(lead.quality_score) }} />
                            </div>
                            <span className="text-sm font-medium" style={{ color: scoreColor(lead.quality_score) }}>
                              {lead.quality_score}
                            </span>
                          </div>
                        ) : '—'}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="inline-flex px-2.5 py-1 rounded-lg text-xs font-medium capitalize"
                          style={{ background: st.bg, color: st.text, border: `1px solid ${st.border}` }}>
                          {lead.email_status}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-sm text-gray-400">
                        {lead.created_at ? format(new Date(lead.created_at), 'MMM d, yyyy') : '—'}
                      </td>
                      <td className="px-4 py-3.5">
                        <button className="p-1.5 text-gray-400 hover:text-gray-700 transition-colors">
                          <Eye size={14} />
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Lead detail drawer */}
      {selectedLead && (
        <div className="fixed inset-0 z-40 flex justify-end">
          <div className="absolute inset-0 bg-black/20" onClick={() => setSelectedLead(null)} />
          <div className="relative w-96 bg-white h-full overflow-y-auto shadow-2xl animate-slide-in p-6"
            style={{ borderLeft: '1px solid #f0f2f5' }}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-gray-900" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>Lead Details</h3>
              <button onClick={() => setSelectedLead(null)} className="p-1.5 text-gray-400 hover:text-gray-700">✕</button>
            </div>
            <div className="space-y-4">
              {[
                { label: 'Business Name', value: selectedLead.business_name },
                { label: 'Email', value: selectedLead.email },
                { label: 'Industry', value: selectedLead.industry },
                { label: 'Website', value: selectedLead.website_url },
                { label: 'Location', value: selectedLead.location },
                { label: 'Quality Score', value: selectedLead.quality_score ? `${selectedLead.quality_score}/100` : '—' },
                { label: 'Recommended Service', value: selectedLead.recommended_service },
                { label: 'Email Status', value: selectedLead.email_status },
                { label: 'Added', value: selectedLead.created_at ? format(new Date(selectedLead.created_at), 'PPP') : '—' },
              ].map(f => (
                <div key={f.label} className="flex flex-col gap-1 pb-3" style={{ borderBottom: '1px solid #f8fafc' }}>
                  <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">{f.label}</span>
                  <span className="text-sm text-gray-900">{f.value || '—'}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
