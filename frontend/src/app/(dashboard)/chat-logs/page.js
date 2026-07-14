'use client'

import { useEffect, useState, useCallback } from 'react'
import { formatDistanceToNow } from 'date-fns'
import api from '@/lib/api'

function deriveSessionStatus(messages) {
  if (messages.some((m) => m.status === 'escalated')) return 'escalated'
  if (messages.some((m) => m.status === 'needs_human')) return 'needs_human'
  return 'answered'
}

const STATUS_STYLES = {
  answered: 'bg-green-50 text-green-700',
  needs_human: 'bg-amber-50 text-amber-600',
  escalated: 'bg-red-50 text-red-600',
  no_response: 'bg-gray-100 text-gray-500',
}
const STATUS_LABEL = {
  answered: 'Answered',
  needs_human: 'Needs Human',
  escalated: 'Escalated',
  no_response: 'No Reply',
}

export default function ChatLogs() {
  const [sessions, setSessions] = useState([])
  const [selected, setSelected] = useState(null)
  const [conversation, setConversation] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [loadingConversation, setLoadingConversation] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const { data } = await api.get('/chat-sessions/', { params: { search } })
        if (cancelled) return
        const list = (Array.isArray(data) ? data : data.results) ?? []
        setSessions(list)
        if (list.length > 0) setSelected((prev) => prev ?? list[0])
      } catch (err) {
        if (!cancelled) setError(err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    const timeout = setTimeout(load, search ? 300 : 0) // debounce search
    return () => { cancelled = true; clearTimeout(timeout) }
  }, [search])

  const loadConversation = useCallback(async (session) => {
    if (!session) return
    setLoadingConversation(true)
    try {
      const { data } = await api.get(`/chat-sessions/${session.id}/messages/`)
      setConversation(data ?? [])
    } catch (err) {
      setError(err)
    } finally {
      setLoadingConversation(false)
    }
  }, [])

  useEffect(() => {
    if (selected) loadConversation(selected)
  }, [selected, loadConversation])

  if (loading) {
    return (
      <div className="p-8 animate-pulse space-y-6">
        <div className="h-8 w-56 bg-gray-200 rounded" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-96 bg-gray-100 rounded-xl" />
          <div className="h-96 bg-gray-100 rounded-xl" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-6 text-sm">
          Couldn&apos;t load chat logs. Please try again.
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Chat Logs</h1>
        <p className="text-sm text-gray-500 mt-1">
          Every conversation Wiz has had with your customers.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Session List */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search sessions..."
              className="w-full text-sm px-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-blue-400"
            />
          </div>

          {sessions.length === 0 ? (
            <div className="py-12 text-center text-sm text-gray-400">No sessions found.</div>
          ) : (
            <div className="max-h-[520px] overflow-y-auto">
              {sessions.map((session) => {
                const status = session.status ?? deriveSessionStatus(session.messages_preview ?? [])
                return (
                  <div
                    key={session.id}
                    onClick={() => setSelected(session)}
                    className={`flex items-center justify-between px-4 py-4 border-b border-gray-50 cursor-pointer hover:bg-gray-50 ${
                      selected?.id === session.id ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{session.session_token}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {formatDistanceToNow(new Date(session.created), { addSuffix: true })} · {session.message_count ?? 0} messages
                      </p>
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium shrink-0 ml-3 ${STATUS_STYLES[status]}`}>
                      {STATUS_LABEL[status]}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Conversation View */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          {!selected ? (
            <div className="py-12 text-center text-sm text-gray-400">Select a session to view the conversation.</div>
          ) : (
            <>
              <p className="text-xs text-gray-400 mb-1">Session</p>
              <p className="text-sm font-semibold text-gray-900 mb-6 truncate">{selected.session_token}</p>

              {loadingConversation ? (
                <div className="space-y-3 animate-pulse">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className={`h-10 rounded-2xl bg-gray-100 ${i % 2 ? 'ml-auto w-2/3' : 'w-2/3'}`} />
                  ))}
                </div>
              ) : (
                <div className="space-y-4 max-h-[440px] overflow-y-auto">
                  {conversation.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.role === 'assistant' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[85%] sm:max-w-xs text-sm px-4 py-2.5 rounded-2xl ${
                        msg.role === 'customer'
                          ? 'bg-gray-100 text-gray-800 rounded-tl-sm'
                          : 'bg-blue-600 text-white rounded-tr-sm'
                      }`}>
                        {msg.content}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

      </div>
    </div>
  )
}