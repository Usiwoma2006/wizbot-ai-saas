'use client'

import { useState } from 'react'
import { Menu } from 'lucide-react'
import Sidebar from '@/components/Sidebar'

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50 lg:flex">
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      <div className="flex-1 flex flex-col min-w-0">

        {/* Mobile Header */}
        <header className="sticky top-0 z-30 flex items-center justify-between bg-white border-b border-gray-100 px-4 py-4 lg:hidden">

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">W</span>
            </div>

            <div>
              <p className="font-semibold text-gray-900 text-sm">
                Wiz AI
              </p>
              <p className="text-xs text-gray-400">
                Support Copilot
              </p>
            </div>
          </div>

          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            <Menu size={22} />
          </button>

        </header>

        <main className="flex-1 overflow-x-hidden">
          {children}
        </main>

      </div>
    </div>
  )
}