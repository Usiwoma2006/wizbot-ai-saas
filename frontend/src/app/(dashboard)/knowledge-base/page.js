'use client'

import { useEffect, useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import api from '@/lib/api'

const STATUS_STYLES = {
  success: 'bg-green-50 text-green-700',
  pending: 'bg-amber-50 text-amber-600',
  failed: 'bg-red-50 text-red-600',
}

const STATUS_LABEL = {
  success: 'Crawled',
  pending: 'Pending',
  failed: 'Failed',
}

export default function KnowledgeBase() {
  const [website, setWebsite] = useState(null)
  const [pages, setPages] = useState([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [error, setError] = useState(null)

  async function loadWebsite() {
    setLoading(true)
    setError(null)
    try {
      const { data } = await api.get('/websites/')
      const primary = Array.isArray(data) ? data[0] : data.results?.[0]
      setWebsite(primary ?? null)
      setPages(primary?.crawled_pages ?? [])
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadWebsite()
  }, [])

  async function handleResync() {
    if (!website) return
    setSyncing(true)
    try {
      await api.post(`/websites/${website.id}/sync/`)
      await loadWebsite()
    } catch (err) {
      setError(err)
    } finally {
      setSyncing(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8 animate-pulse space-y-6">
        <div className="h-8 w-56 bg-gray-200 rounded" />
        <div className="h-40 bg-gray-100 rounded-xl" />
        <div className="h-64 bg-gray-100 rounded-xl" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-6 text-sm">
          Couldn&apos;t load your knowledge base. Please try again.
        </div>
      </div>
    )
  }

  if (!website) {
    return (
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">Knowledge Base</h1>
          <p className="text-sm text-gray-500 mt-1">What Wiz knows about your store.</p>
        </div>
        <div className="bg-white rounded-xl border border-dashed border-gray-200 p-10 text-center">
          <p className="text-sm text-gray-500 mb-4">You haven&apos;t connected a website yet.</p>
          <a href="/websites/new" className="inline-block text-sm px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Connect a store
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Knowledge Base</h1>
        <p className="text-sm text-gray-500 mt-1">What Wiz knows about your store.</p>
      </div>

      {/* Connected Store Card */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-sm font-medium text-gray-900">{website.url}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full border ${
                website.status === 'connected'
                  ? 'bg-green-50 text-green-700 border-green-200'
                  : 'bg-gray-50 text-gray-500 border-gray-200'
              }`}>
                {website.status === 'connected' ? 'Ready' : website.status}
              </span>
            </div>
            <p className="text-xs text-gray-400">
              {website.platform}
              {website.last_scraped && ` · last synced ${formatDistanceToNow(new Date(website.last_scraped), { addSuffix: true })}`}
            </p>
          </div>
          <button
            onClick={handleResync}
            disabled={syncing}
            className="flex items-center justify-center gap-2 text-sm px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed w-fit"
          >
            {syncing ? 'Syncing…' : 'Resync'}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-6 pt-6 border-t border-gray-100">
          <div>
            <p className="text-xs text-gray-400">Pages crawled</p>
            <p className="text-2xl font-semibold text-gray-900 mt-1">{website.pages_count ?? pages.length}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Chunks indexed</p>
            <p className="text-2xl font-semibold text-gray-900 mt-1">{website.chunks_count ?? '—'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Platform</p>
            <p className="text-2xl font-semibold text-gray-900 mt-1">{website.platform}</p>
          </div>
        </div>
      </div>

      {/* Crawled Pages Table */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <div className="mb-4">
          <h2 className="text-base font-semibold text-gray-900">Crawled Pages</h2>
          <p className="text-sm text-gray-400">All pages Wiz has indexed.</p>
        </div>

        {pages.length === 0 ? (
          <div className="py-12 text-center text-sm text-gray-400">
            No pages crawled yet. Run a sync to get started.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px]">
              <thead>
                <tr className="text-xs text-gray-400 uppercase border-b border-gray-100">
                  <th className="text-left pb-3">Page Title</th>
                  <th className="text-left pb-3">URL</th>
                  <th className="text-right pb-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {pages.map((page) => (
                  <tr key={page.id} className="border-b border-gray-50 last:border-0">
                    <td className="py-3 text-sm text-gray-700">{page.title || 'Untitled'}</td>
                    <td className="py-3 text-sm text-gray-400 font-mono truncate max-w-[240px]">{page.url}</td>
                    <td className="py-3 text-right">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_STYLES[page.status] ?? 'bg-gray-50 text-gray-600'}`}>
                        {STATUS_LABEL[page.status] ?? page.status}
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