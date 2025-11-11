"use client"
import type { ReactNode } from "react"
import { useEffect } from "react"
import Navigation from "./navigation"
import { ThemeToggle } from "./theme-toggle"


interface AdminLayoutProps {
  children: ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  // Update clock function
  useEffect(() => {
    const updateClock = () => {
      const now = new Date()
      const hours = String(now.getHours()).padStart(2, '0')
      const minutes = String(now.getMinutes()).padStart(2, '0')
      const seconds = String(now.getSeconds()).padStart(2, '0')
      const clockElement = document.getElementById('clock')
      if (clockElement) {
        clockElement.textContent = `${hours}:${minutes}:${seconds}`
      }
    }
    
    updateClock() // Initial call
    const interval = setInterval(updateClock, 1000)
    
    return () => clearInterval(interval) // Cleanup
  }, [])

  return (
    <div className="flex h-screen flex-col bg-gray-50 dark:bg-gray-900 md:flex-row">
      {/* Navigation with Hamburger & Navbar */}
      <Navigation />
      
      {/* Main Content - Add top padding for mobile navbar */}
      <main className="flex-1 overflow-auto pt-16 md:pt-0">
        {/* Topbar */}
        <header className="sticky top-0 z-10 border-b border-gray-200 dark:border-gray-700 backdrop-blur-md bg-white/80 dark:bg-gray-800/80 hidden md:block">
          <div className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between gap-4">
            {/* Search Bar */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent text-sm transition bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                  aria-label="Search products"
                />
                <svg 
                  className="w-5 h-5 text-gray-400 dark:text-gray-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Right side widgets */}
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Clock - Hidden on small screens */}
              <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <time className="text-sm font-medium text-gray-700 dark:text-gray-200 tabular-nums" id="clock">00:00:00</time>
              </div>

              {/* Theme Toggle */}
              <ThemeToggle/>

              {/* Notifications */}
              <button 
                className="relative p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                aria-label="Notifications"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" aria-label="Unread notifications"></span>
              </button>

              {/* User Menu */}
              <button 
                className="flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                aria-label="User menu"
              >
                <div className="w-8 h-8 bg-indigo-600 dark:bg-indigo-500 rounded-full flex items-center justify-center">
                  <span className="text-xs font-medium text-white">AU</span>
                </div>
              </button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  )
}