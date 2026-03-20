'use client'

import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts'
import { createClient } from '@/lib/supabase/client'
import { format, subDays } from 'date-fns'
import { TrendingUp, Mail, Users, Target } from 'lucide-react'

export default function AnalyticsPage() {
  const [stats, setStats] = useState({ total: 0, sent: 0, replied: 0, runs: 0 })
  const [dailyData, setDailyData] = useState<{ date: string; leads: number; emails: number }[]>([])
  const [industryData, setIndustryData] = useState<{ name: string; count: number }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const [{ data: leads }, { data: runs }] = await Promise.all([
        supabase.from('leads').select('email_status, industry, created_at').eq('user_id', user.id),
        supabase.from('run_history').select('id').eq('user_id', user.id),
      ])

      const all = leads || []
      setStats({
        total: all.length,
        sent: all.filter(l => l.email_status === 'sent').length,
        replied: all.filter(l => l.email_status === 'replied').length,
        runs: (runs || []).length,
      })

      // Daily chart - last 14 days
      const daily = Array.from({ length: 14 }, (_, i) => {
        const date = format(subDays(new Date(), 13 - i), 'MMM d')
        const dayStr = format(subDays(new Date(), 13 - i), 'yyyy-MM-dd')
        const dayLeads = all.filter(l => l.created_at?.startsWith(dayStr))
        return {
          date,
          leads: dayLeads.length,
          emails: dayLeads.filter(l => l.email_status === 'sent' || l.email_status === 'replied').length,
        }
      })
      setDailyData(daily)

      // Industry distribution
      const industryMap: Record<string, number> = {}
      all.forEach(l => {
        if (l.industry) industryMap[l.industry] = (industryMap[l.industry] || 0) + 1
      })
      setIndustryData(
        Object.entries(industryMap).sort((a, b) => b[1] - a[1]).slice(0, 6)
          .map(([name, count]) => ({ name, count }))
      )

      setLoading(false)
    }
    load()
  }, [])

  const kpis = [
    { label: 'Total Leads', value: stats.total, icon: Users, color: '#2563eb', bg: '#eff6ff' },
    { label: 'Emails Sent', value: stats.sent, icon: Mail, color: '#7c3aed', bg: '#f5f3ff' },
    { label: 'Replied', value: stats.replied, icon: TrendingUp, color: '#16a34a', bg: '#f0fdf4' },
    { label: 'Campaigns Run', value: stats.runs, icon: Target, color: '#00a854', bg: '#e8fdf0' },
  ]

  const deliveryRate = stats.sent > 0 ? Math.round((stats.sent / stats.total) * 100) : 0
  const replyRate = stats.sent > 0 ? Math.round((stats.replied / stats.sent) * 100) : 0

  return (
    <div className="p-6 animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>
          Analytics
        </h1>
        <p className="text-sm text-gray-500">Performance metrics across all campaigns</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 stagger">
        {kpis.map(k => (
          <div key={k.label} className="card p-5 bg-white">
            <div className="flex items-start justify-between mb-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: k.bg }}>
                <k.icon size={17} style={{ color: k.color }} />
              </div>
            </div>
            <div className="text-3xl font-bold mb-1" style={{ fontFamily: 'Bricolage Grotesque, sans-serif', color: k.color }}>
              {loading ? '—' : k.value}
            </div>
            <div className="text-sm text-gray-500">{k.label}</div>
          </div>
        ))}
      </div>

      {/* Rate cards */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        {[
          { label: 'Email Delivery Rate', value: deliveryRate, desc: `${stats.sent} of ${stats.total} leads emailed` },
          { label: 'Reply Rate', value: replyRate, desc: `${stats.replied} replies from ${stats.sent} emails` },
        ].map(r => (
          <div key={r.label} className="card p-5 bg-white">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-semibold text-gray-900">{r.label}</div>
              <span className="text-2xl font-bold" style={{ fontFamily: 'Bricolage Grotesque, sans-serif', color: '#00a854' }}>
                {loading ? '—' : `${r.value}%`}
              </span>
            </div>
            <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
              <div className="h-2 rounded-full transition-all"
                style={{ width: `${r.value}%`, background: 'linear-gradient(90deg, #00e676, #00a854)' }} />
            </div>
            <p className="text-xs text-gray-400 mt-2">{r.desc}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-5">
        <div className="card p-6 bg-white">
          <h3 className="text-sm font-semibold text-gray-900 mb-5">Leads & Emails — Last 14 Days</h3>
          {loading || dailyData.every(d => d.leads === 0) ? (
            <div className="flex flex-col items-center justify-center h-48 text-gray-400">
              <div className="text-3xl mb-2">📈</div>
              <div className="text-sm">Data will appear after your first run</div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={dailyData}>
                <CartesianGrid stroke="#f0f2f5" strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }} />
                <Line type="monotone" dataKey="leads" stroke="#2563eb" strokeWidth={2} dot={false} name="Leads" />
                <Line type="monotone" dataKey="emails" stroke="#00e676" strokeWidth={2} dot={false} name="Emails" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card p-6 bg-white">
          <h3 className="text-sm font-semibold text-gray-900 mb-5">Leads by Industry</h3>
          {loading || industryData.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-gray-400">
              <div className="text-3xl mb-2">📊</div>
              <div className="text-sm">No industry data yet</div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={industryData} barSize={28}>
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }} />
                <Bar dataKey="count" fill="#00e676" radius={[4,4,0,0]} name="Leads" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  )
}
