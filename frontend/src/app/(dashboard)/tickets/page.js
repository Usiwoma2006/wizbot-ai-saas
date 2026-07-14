'use client'

import { useEffect, useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import api from '@/lib/api'

const STATUS_STYLES = {
  new: 'bg-blue-50 text-blue-700',
  in_progress: 'bg-purple-50 text-purple-700',
  awaiting_customer: 'bg-orange-50 text-orange-700',
  closed: 'bg-green-50 text-green-700',
}

const STATUS_LABELS = {
  new: 'New',
  in_progress: 'In Progress',
  awaiting_customer: 'Awaiting Customer',
  closed: 'Closed',
}

const PRIORITY_STYLES = {
  urgent: 'bg-red-50 text-red-700 border-red-100',
  medium: 'bg-amber-50 text-amber-700 border-amber-100',
  low: 'bg-gray-50 text-gray-600 border-gray-200',
}

export default function TicketsPage() {
  const [tickets, setTickets] = useState([])
  const [counts, setCounts] = useState({ new: 0, in_progress: 0, awaiting_customer: 0, closed: 0 })
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [updatingId, setUpdatingId] = useState(null)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const params = priorityFilter === 'all' ? {} : { priority: priorityFilter }
      const { data } = await api.get('/tickets/', { params })
      const list = (Array.isArray(data) ? data : data.results) ?? []
      setTickets(list)
      setCounts({
        new: list.filter((t) => t.ticket_status === 'new').length,
        in_progress: list.filter((t) => t.ticket_status === 'in_progress').length,
        awaiting_customer: list.filter((t) => t.ticket_status === 'awaiting_customer').length,
        closed: list.filter((t) => t.ticket_status === 'closed').length,
      })
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [priorityFilter])

  async function handleStatusChange(ticket, newStatus) {
    setUpdatingId(ticket.id)
    try {
      await api.patch(`/tickets/${ticket.id}/`, { ticket_status: newStatus })
      await load()
    } catch (err) {
      setError(err)
    } finally {
      setUpdatingId(null)
    }
  }

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 animate-pulse space-y-6">
        <div className="h-8 w-40 bg-gray-200 rounded" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="h-28 bg-gray-100 rounded-xl" />
          <div className="h-28 bg-gray-100 rounded-xl" />
          <div className="h-28 bg-gray-100 rounded-xl" />
          <div className="h-28 bg-gray-100 rounded-xl" />
        </div>
        <div className="h-72 bg-gray-100 rounded-xl" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-6 text-sm">
          Couldn&apos;t load tickets. Please try again.
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Tickets</h1>
        <p className="text-sm text-gray-500 mt-1">
          Escalations and support conversations from your customers.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        <div className="bg-white rounded-xl border border-gray-100 p-4 sm:p-5">
          <p className="text-xs sm:text-sm text-gray-500">New</p>
          <p className="text-2xl sm:text-3xl font-semibold text-gray-900 mt-1 sm:mt-2">{counts.new}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 sm:p-5">
          <p className="text-xs sm:text-sm text-gray-500">In Progress</p>
          <p className="text-2xl sm:text-3xl font-semibold text-gray-900 mt-1 sm:mt-2">{counts.in_progress}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 sm:p-5">
          <p className="text-xs sm:text-sm text-gray-500">Awaiting Customer</p>
          <p className="text-2xl sm:text-3xl font-semibold text-gray-900 mt-1 sm:mt-2">{counts.awaiting_customer}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 sm:p-5">
          <p className="text-xs sm:text-sm text-gray-500">Closed</p>
          <p className="text-2xl sm:text-3xl font-semibold text-gray-900 mt-1 sm:mt-2">{counts.closed}</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-gray-900">All Tickets</h2>
          <p className="text-sm text-gray-400 mt-1">Filter by priority.</p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {['all', 'urgent', 'medium', 'low'].map((p) => (
            <button
              key={p}
              onClick={() => setPriorityFilter(p)}
              className={`text-xs sm:text-sm px-2.5 sm:px-3 py-1.5 rounded-lg font-medium capitalize ${
                priorityFilter === p
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="mt-6 bg-white rounded-xl border border-gray-100 overflow-hidden">
        {tickets.length === 0 ? (
          <div className="py-12 text-center text-sm text-gray-400">No tickets match this filter.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] lg:min-w-[800px]">
              <thead>
                <tr className="text-xs text-gray-400 uppercase border-b border-gray-100">
                  <th className="text-left pb-3 sm:pb-4 pt-3 sm:pt-4 pl-4 sm:pl-5 pr-2 sm:pr-3 font-medium">Ticket</th>
                  <th className="text-left pb-3 sm:pb-4 pt-3 sm:pt-4 px-2 sm:px-3 font-medium hidden sm:table-cell">Priority</th>
                  <th className="text-left pb-3 sm:pb-4 pt-3 sm:pt-4 px-2 sm:px-3 font-medium">Subject</th>
                  <th className="text-left pb-3 sm:pb-4 pt-3 sm:pt-4 px-2 sm:px-3 font-medium hidden md:table-cell">Client</th>
                  <th className="text-left pb-3 sm:pb-4 pt-3 sm:pt-4 px-2 sm:px-3 font-medium">Status</th>
                  <th className="text-left pb-3 sm:pb-4 pt-3 sm:pt-4 px-2 sm:px-3 font-medium hidden md:table-cell">Created</th>
                  <th className="text-right pb-3 sm:pb-4 pt-3 sm:pt-4 pl-2 sm:pl-3 pr-4 sm:pr-5 font-medium hidden lg:table-cell">Due</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((ticket) => (
                  <tr key={ticket.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                    <td className="py-3 sm:py-4 pl-4 sm:pl-5 pr-2 sm:pr-3 text-sm font-medium text-gray-700">
                      {ticket.ticket_number}
                    </td>
                    <td className="py-3 sm:py-4 px-2 sm:px-3 hidden sm:table-cell">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium border capitalize ${PRIORITY_STYLES[ticket.priority]}`}>
                        {ticket.priority}
                      </span>
                    </td>
                    <td className="py-3 sm:py-4 px-2 sm:px-3 text-sm text-gray-700 max-w-[120px] sm:max-w-[180px] md:max-w-[220px] truncate">
                      {ticket.subject}
                    </td>
                    <td className="py-3 sm:py-4 px-2 sm:px-3 text-sm text-gray-500 hidden md:table-cell">
                      <div className="text-gray-700">{ticket.customer_name || '—'}</div>
                      <div className="text-xs text-gray-400 truncate max-w-[120px]">{ticket.customer_email}</div>
                    </td>
                    <td className="py-3 sm:py-4 px-2 sm:px-3">
                      <select
                        value={ticket.ticket_status}
                        onChange={(e) => handleStatusChange(ticket, e.target.value)}
                        disabled={updatingId === ticket.id}
                        className={`text-xs px-1.5 sm:px-2.5 py-1 sm:py-1.5 rounded-full font-medium border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 ${STATUS_STYLES[ticket.ticket_status]}`}
                      >
                        {Object.entries(STATUS_LABELS).map(([value, label]) => (
                          <option key={value} value={value}>{label}</option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3 sm:py-4 px-2 sm:px-3 text-sm text-gray-400 hidden md:table-cell">
                      {formatDistanceToNow(new Date(ticket.created_at), { addSuffix: true })}
                    </td>
                    <td className="py-3 sm:py-4 pl-2 sm:pl-3 pr-4 sm:pr-5 text-sm text-gray-400 text-right hidden lg:table-cell">
                      {formatDistanceToNow(new Date(ticket.due_date), { addSuffix: true })}
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