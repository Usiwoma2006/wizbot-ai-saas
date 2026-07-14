'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  BookOpen,
  MessageSquare,
  Ticket,
  Lightbulb,
  Code2,
  Settings,
  X,
} from 'lucide-react'

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Knowledge Base', href: '/knowledge-base', icon: BookOpen },
  { label: 'Chat Logs', href: '/chat-logs', icon: MessageSquare },
  { label: 'Tickets', href: '/tickets', icon: Ticket },
  { label: 'Suggestions', href: '/suggestions', icon: Lightbulb },
  { label: 'Embed Widget', href: '/embed-widget', icon: Code2 },
  { label: 'Settings', href: '/settings', icon: Settings },
]

export default function Sidebar({ sidebarOpen, setSidebarOpen }) {
  const pathname = usePathname()

  // Lock body scroll when sidebar is open on mobile
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [sidebarOpen])

  // Close sidebar on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && sidebarOpen) {
        setSidebarOpen(false)
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [sidebarOpen, setSidebarOpen])

  return (
    <>
      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={`
          fixed lg:sticky
          top-0
          h-screen
          w-64
          bg-white
          border-r border-gray-100
          flex flex-col
          z-50
          transform
          transition-transform
          duration-300
          ease-in-out
          ${
            sidebarOpen
              ? 'translate-x-0'
              : '-translate-x-full lg:translate-x-0'
          }
        `}
        role="navigation"
        aria-label="Main navigation"
      >
        {/* Logo - Fixed at top */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
              <span className="text-white font-bold text-sm">
                W
              </span>
            </div>

            <div>
              <div className="font-semibold text-gray-900 text-sm leading-tight">
                Wiz AI
              </div>

              <div className="text-xs text-gray-400 leading-tight">
                Support Copilot
              </div>
            </div>
          </div>

          <button
            className="lg:hidden p-1 rounded-md hover:bg-gray-100 transition-colors"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <X size={20} className="text-gray-600" />
          </button>
        </div>

        {/* Navigation - Scrollable middle section */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              const isActivePath = pathname?.startsWith(item.href + '/')

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => {
                    if (window.innerWidth < 1024) {
                      setSidebarOpen(false)
                    }
                  }}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                    isActive || isActivePath
                      ? 'bg-blue-50 text-blue-600 font-medium'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                  aria-current={isActive || isActivePath ? 'page' : undefined}
                >
                  <Icon size={18} className="shrink-0" />
                  <span className="truncate">{item.label}</span>
                </Link>
              )
            })}
          </div>
        </nav>

        {/* User - Fixed at bottom */}
        <div className="px-4 py-4 border-t border-gray-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center shrink-0">
              <span className="text-white text-xs font-medium">
                AK
              </span>
            </div>

            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium text-gray-900 truncate">
                Alex Kim
              </div>

              <div className="text-xs text-gray-400 truncate">
                alex@brightbrew.co
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}