'use client'

import { useEffect, useState } from 'react'
import { Lightbulb } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import api from '@/lib/api'

function severityFromConfidence(score) {
  if (score == null) return 'info'
  if (score < 0.4) return 'critical'
  if (score < 0.7) return 'warning'
  return 'info'
}

const SEVERITY_BORDER = {
  critical: 'border-l-4 border-l-red-500 border-gray-100',
  warning: 'border-l-4 border-l-yellow-500 border-gray-100',
  info: 'border-l-4 border-l-blue-500 border-gray-100',
}
const SEVERITY_DOT = {
  critical: 'bg-red-500',
  warning: 'bg-yellow-500',
  info: 'bg-blue-500',
}

export default function SuggestionsPage() {
  const [suggestions, setSuggestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [actingId, setActingId] = useState(null)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const { data } = await api.get('/suggestions/', { params: { status: 'pending' } })
      setSuggestions((Array.isArray(data) ? data : data.results) ?? [])
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function handleAction(id, status) {
    setActingId(id)
    try {
      await api.patch(`/suggestions/${id}/`, { status })
      setSuggestions((prev) => prev.filter((s) => s.id !== id))
    } catch (err) {
      setError(err)
    } finally {
      setActingId(null)
    }
  }

  if (loading) {
    return (
      <div className="p-8 animate-pulse space-y-6">
        <div className="h-8 w-56 bg-gray-200 rounded" />
        <div className="h-40 bg-gray-100 rounded-xl" />
        <div className="h-56 bg-gray-100 rounded-xl" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-6 text-sm">
          Couldn&apos;t load suggestions. Please try again.
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">AI Suggestions</h1>
          <p className="text-sm text-gray-500 mt-1">
            Improve your AI assistant using automatically detected recommendations.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-amber-50 text-amber-700 text-sm px-3 py-1.5 rounded-full border border-amber-200 w-fit">
          <Lightbulb className="w-4 h-4 text-amber-500" />
          <span>{suggestions.length} pending</span>
        </div>
      </div>

      {/* AI Hero */}
      <div className="mb-8 rounded-xl border border-gray-100 bg-white p-6">
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
            <Lightbulb className="h-6 w-6 text-blue-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">
            {suggestions.length > 0
              ? `Your AI found ${suggestions.length} improvement${suggestions.length === 1 ? '' : 's'}`
              : 'No pending suggestions'}
          </h2>
          <p className="mt-2 max-w-xl text-sm text-gray-500">
            Apply these recommendations to improve your chatbot&apos;s answers,
            reduce fallback requests and provide better customer support.
          </p>
        </div>
      </div>

      {/* Suggestions */}
      {suggestions.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 bg-white p-10 text-center text-sm text-gray-400">
          You&apos;re all caught up — Wiz will surface new suggestions as it learns from conversations.
        </div>
      ) : (
        <div className="space-y-4">
          {suggestions.map((item) => {
            const severity = severityFromConfidence(item.confidence_score)
            const automatic = item.suggestion_type === 'auto_content'
            return (
              <div key={item.id} className={`rounded-xl border bg-white p-6 transition hover:shadow-sm ${SEVERITY_BORDER[severity]}`}>
                {/* Card Header */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <div className={`h-2.5 w-2.5 rounded-full ${SEVERITY_DOT[severity]}`} />
                      <h2 className="text-base font-semibold text-gray-900">{item.suggestion_type}</h2>
                      <span className="text-xs text-gray-400">
                        · {formatDistanceToNow(new Date(item.created), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium w-fit ${
                    automatic ? 'bg-blue-50 text-blue-700' : 'bg-yellow-50 text-yellow-700'
                  }`}>
                    {automatic ? 'Automatic' : 'Manual'}
                  </span>
                </div>

                {/* Body */}
                <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-4">
                  <div className="space-y-4 lg:col-span-3">
                    <div>
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">Context</h3>
                      <p className="mt-1.5 text-sm text-gray-700">{item.context}</p>
                    </div>
                    {item.fallback && (
                      <div>
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">Source Ticket</h3>
                        <div className="mt-1.5">
                          <span className="text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-700">
                            #{item.fallback}
                          </span>
                        </div>
                      </div>
                    )}
                    <div>
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">Recommendation</h3>
                      <p className="mt-1.5 text-sm text-gray-700">{item.recommendation}</p>
                      {item.reason && (
                        <p className="mt-1 text-xs text-gray-400">{item.reason}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => handleAction(item.id, 'approved')}
                      disabled={actingId === item.id}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2.5 rounded-lg font-medium transition disabled:opacity-50"
                    >
                      {actingId === item.id ? 'Applying…' : 'Apply Suggestion'}
                    </button>
                    <button
                      onClick={() => handleAction(item.id, 'rejected')}
                      disabled={actingId === item.id}
                      className="border border-gray-200 text-gray-600 text-sm px-4 py-2.5 rounded-lg font-medium hover:bg-gray-50 transition disabled:opacity-50"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}