'use client'

import { useEffect, useState } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import api from '@/lib/api'

const RANGE_OPTIONS = [
  { label: 'Last 7 Days', value: '7d' },
  { label: 'Last 30 Days', value: '30d' },
  { label: 'This Month', value: 'month' },
]

export default function Dashboard() {
  const [merchant, setMerchant] = useState(null)
  const [stats, setStats] = useState(null)
  const [chartData, setChartData] = useState([])
  const [topQuestions, setTopQuestions] = useState([])
  const [range, setRange] = useState('7d')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)
      try {
        const [merchantRes, summaryRes] = await Promise.all([
          api.get('/merchant/me/'),
          api.get('/dashboard/summary/', { params: { range } }),
        ])
        if (cancelled) return

        setMerchant(merchantRes.data)
        setStats(summaryRes.data.stats)
        setChartData(summaryRes.data.chart ?? [])
        setTopQuestions(summaryRes.data.top_questions ?? [])
      } catch (err) {
        if (!cancelled) setError(err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [range])

  if (loading) {
    return (
      <div className="p-8 animate-pulse space-y-6">
        <div className="h-8 w-64 bg-gray-200 rounded" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-gray-100 rounded-xl" />
          ))}
        </div>
        <div className="h-64 bg-gray-100 rounded-xl" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-6 text-sm">
          Couldn&apos;t load dashboard data. {error.response?.status === 401 ? 'Please log in again.' : 'Please try again shortly.'}
        </div>
      </div>
    )
  }

  const firstName = merchant?.first_name || merchant?.username || 'there'
  const websiteConnected = merchant?.website_status === 'connected'

  return (
    <div className="p-8">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Good morning, {firstName}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Here&apos;s how your AI copilot performed today.
          </p>
        </div>
        <div className={`flex items-center gap-2 text-sm px-3 py-1.5 rounded-full border w-fit ${
          websiteConnected
            ? 'bg-green-50 text-green-700 border-green-200'
            : 'bg-gray-50 text-gray-500 border-gray-200'
        }`}>
          <div className={`w-2 h-2 rounded-full ${websiteConnected ? 'bg-green-500' : 'bg-gray-400'}`} />
          {merchant?.shop_name || merchant?.username} · {websiteConnected ? 'Connected' : 'Not connected'}
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Questions" value={stats?.questions_answered ?? '—'} delta={stats?.questions_answered_delta} />
        <StatCard label="Fallback Rate" value={stats?.fallback_rate != null ? `${stats.fallback_rate}%` : '—'} delta={stats?.fallback_rate_delta} inverse />
        <StatCard label="Avg Confidence" value={stats?.avg_confidence != null ? `${stats.avg_confidence}%` : '—'} delta={stats?.avg_confidence_delta} />
        <StatCard label="Avg Response Time" value={stats?.avg_response_time != null ? `${stats.avg_response_time}s` : '—'} delta={stats?.avg_response_time_delta} inverse />
      </div>

      {/* Chart */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-base font-semibold text-gray-900">
              AI Performance Over Time
            </h2>
            <p className="text-sm text-gray-400">Answered vs fallback conversations</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {RANGE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setRange(opt.value)}
                className={`text-xs px-3 py-1.5 rounded-full transition-colors ${
                  range === opt.value
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {chartData.length === 0 ? (
          <EmptyState message="No conversation data for this period yet." />
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="answered" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563EB" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <Tooltip />
              <Area type="monotone" dataKey="answered" stroke="#2563EB" fill="url(#answered)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Top Questions */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-semibold text-gray-900">
              Top Questions This Week
            </h2>
            <p className="text-sm text-gray-400">Sorted by volume</p>
          </div>
          <a href="/chat-logs" className="text-sm text-blue-600 hover:underline">
            View all
          </a>
        </div>

        {topQuestions.length === 0 ? (
          <EmptyState message="No questions logged yet." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-xs text-gray-400 uppercase border-b border-gray-100">
                  <th className="text-left pb-3">Question</th>
                  <th className="text-right pb-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {topQuestions.map((item, i) => (
                  <tr key={i} className="border-b border-gray-50 last:border-0">
                    <td className="py-3 text-sm text-gray-700">{item.question}</td>
                    <td className="py-3 text-right">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                        item.status === 'answered'
                          ? 'bg-green-50 text-green-700'
                          : 'bg-amber-50 text-amber-600'
                      }`}>
                        {item.status === 'answered' ? 'Answered' : 'Fallback'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  )
}

function StatCard({ label, value, delta, inverse }) {
  const isPositive = delta > 0
  const goodDirection = inverse ? !isPositive : isPositive
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-3xl font-semibold text-gray-900 mt-2">{value}</p>
      {delta != null && (
        <p className={`text-sm mt-1 ${goodDirection ? 'text-green-600' : 'text-red-500'}`}>
          {isPositive ? '↑' : '↓'} {Math.abs(delta)}%
        </p>
      )}
    </div>
  )
}

function EmptyState({ message }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <p className="text-sm text-gray-400">{message}</p>
    </div>
  )
}