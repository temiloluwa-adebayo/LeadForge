'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { format, formatDistanceToNow } from 'date-fns'
import { CheckCircle2, XCircle, Clock, RefreshCw } from 'lucide-react'

type Run = {
  id: string
  status: string
  leads_found: number
  emails_sent: number
  pdfs_generated: number
  duplicates_skipped: number
  started_at: string
  completed_at: string
  duration_seconds: number
  errors: string[]
}

export default function HistoryPage() {
  const [runs, setRuns] = useState<Run[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase.from('run_history').select('*')
      .eq('user_id', user.id).order('started_at', { ascending: false }).limit(50)
    setRuns(data || [])
    setLoading(false)
  }

  return (
    <div className="p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>
            Run History
          </h1>
          <p className="text-sm text-gray-500">Log of all workflow executions</p>
        </div>
        <button onClick={load} className="btn-secondary text-sm px-4 py-2.5 flex items-center gap-2">
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      <div className="card bg-white overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">
            <RefreshCw size={24} className="animate-spin mx-auto mb-3 text-gray-300" />
            Loading history…
          </div>
        ) : runs.length === 0 ? (
          <div className="p-16 text-center text-gray-400">
            <div className="text-4xl mb-3">🕐</div>
            <div className="font-medium text-gray-600 mb-1">No runs yet</div>
            <div className="text-sm">Launch your first campaign to see execution history here</div>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr style={{ background: '#fafbfc', borderBottom: '1px solid #f0f2f5' }}>
                {['Status', 'Started', 'Duration', 'Leads Found', 'Emails Sent', 'PDFs', 'Skipped'].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {runs.map(run => (
                <tr key={run.id} className="hover:bg-gray-50 transition-colors"
                  style={{ borderBottom: '1px solid #f8fafc' }}>
                  <td className="px-5 py-4">
                    {run.status === 'success' ? (
                      <span className="inline-flex items-center gap-1.5 text-green-700 text-sm font-medium">
                        <CheckCircle2 size={14} style={{ color: '#00e676' }} />
                        Success
                      </span>
                    ) : run.status === 'failed' ? (
                      <span className="inline-flex items-center gap-1.5 text-red-600 text-sm font-medium">
                        <XCircle size={14} />
                        Failed
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-amber-600 text-sm font-medium">
                        <Clock size={14} />
                        Running
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <div className="text-sm text-gray-900">{format(new Date(run.started_at), 'MMM d, h:mm a')}</div>
                    <div className="text-xs text-gray-400">{formatDistanceToNow(new Date(run.started_at), { addSuffix: true })}</div>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-600">
                    {run.duration_seconds ? `${run.duration_seconds}s` : '—'}
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-lg font-bold" style={{ fontFamily: 'Bricolage Grotesque, sans-serif', color: '#2563eb' }}>
                      {run.leads_found ?? 0}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-lg font-bold" style={{ fontFamily: 'Bricolage Grotesque, sans-serif', color: '#00a854' }}>
                      {run.emails_sent ?? 0}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-600">{run.pdfs_generated ?? 0}</td>
                  <td className="px-5 py-4 text-sm text-gray-400">{run.duplicates_skipped ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
