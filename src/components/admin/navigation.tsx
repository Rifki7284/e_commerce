"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { Avatar } from "../ui/avatar"
import { LayoutGrid } from "lucide-react"
import { ThemeToggle } from "./theme-toggle"

const navigationItems = [
  {
    name: "Dashboard",
    href: "/admin",
    icon: <LayoutGrid className="h-5 w-5" />,
  },
  {
    name: "Products",
    href: "/admin/products",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m0 0v10l8 4"
        />
      </svg>
    ),
  },
  {
    name: "Category",
    href: "/admin/category",
    icon: (
      <svg
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4 6h16M4 12h8m-8 6h16"
        />
      </svg>
    ),
  },
  {
    name: "Orders",
    href: "/admin/orders",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
    ),
  },
  {
    name: "Analytics",
    href: "/admin/analytics",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
        />
      </svg>
    ),
  },
  {
    name: "Settings",
    href: "/admin/settings",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
        />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
]

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const [currentTime, setCurrentTime] = useState("")

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setCurrentTime(now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }))
    }
    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <>
      {/* Top Navbar for Mobile */}
      <div className="fixed top-0 left-0 right-0 z-50 border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md md:hidden shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Hamburger Menu */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="relative rounded-xl bg-linear-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 p-2.5 text-white transition-all hover:from-blue-600 hover:to-blue-700 dark:hover:from-blue-700 dark:hover:to-blue-800 hover:shadow-lg active:scale-95 group overflow-hidden"
            aria-label="Toggle menu"
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            <svg className="h-5 w-5 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
              />
            </svg>
          </button>

          {/* Logo and Time in Navbar */}
          <div className="flex flex-col items-center">
            <h1 className="text-lg font-bold bg-linear-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
              StoreHub
            </h1>
            <div className="flex items-center gap-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse"></div>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{currentTime}</p>
            </div>
          </div>

          {/* User Profile */}
          <ThemeToggle />
        </div>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 border-r-2 border-gray-200 dark:border-gray-700 transform bg-white dark:bg-gray-800 transition-all duration-300 ease-out md:relative md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:mt-0 mt-16 shadow-2xl md:shadow-none`}
      >
        <div className="flex h-full flex-col">
          {/* Logo Header - Desktop Only */}
          <div className="hidden border-b border-gray-100 dark:border-gray-700 px-6 py-6 md:block bg-linear-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-800 dark:via-gray-800 dark:to-gray-800 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-blue-200/30 to-purple-200/30 dark:from-blue-500/10 dark:to-purple-500/10 rounded-full blur-3xl"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-linear-to-br from-blue-500 to-purple-600 dark:from-blue-600 dark:to-purple-700 flex items-center justify-center shadow-md">
                    <LayoutGrid className="h-4 w-4 text-white" />
                  </div>
                  <h1 className="text-2xl font-bold bg-linear-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                    StoreHub
                  </h1>
                </div>
           
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium ml-10">Admin Panel</p>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 space-y-1.5 px-3 py-6 overflow-y-auto">
            {navigationItems.map((item, index) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="group relative flex items-center gap-3 rounded-xl px-4 py-3.5 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all hover:bg-linear-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-gray-700 dark:hover:to-gray-700 active:scale-[0.98] overflow-hidden"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Hover Effect Background */}
                <div className="absolute inset-0 bg-linear-to-r from-blue-100/0 via-purple-100/50 to-pink-100/0 dark:from-blue-500/0 dark:via-blue-500/10 dark:to-purple-500/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>

                {/* Icon Container */}
                <Avatar className="relative rounded-xl p-2.5 flex items-center justify-center shadow-sm transition-all bg-gray-100 dark:bg-gray-700 group-hover:bg-linear-to-br group-hover:from-blue-500 group-hover:to-purple-600 dark:group-hover:from-blue-600 dark:group-hover:to-purple-700 group-hover:shadow-md group-hover:scale-110">
                  <span className="text-gray-600 dark:text-gray-300 group-hover:text-white transition-colors">
                    {item.icon}
                  </span>
                </Avatar>

                {/* Navigation Text */}
                <span className="font-semibold relative z-10">{item.name}</span>

                {/* Arrow Indicator */}
                <svg
                  className="ml-auto h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-blue-600 dark:text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ))}
          </nav>

          {/* User Profile Section */}
          <div className="border-t border-gray-100 dark:border-gray-700 px-4 py-4 bg-linear-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-800 dark:via-gray-800 dark:to-gray-800 relative overflow-hidden">
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-linear-to-br from-blue-200/20 to-purple-200/20 dark:from-blue-500/5 dark:to-purple-500/5 rounded-full blur-2xl"></div>
            <div className="relative z-10 flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/80 dark:hover:bg-gray-700/80 backdrop-blur-sm transition-all cursor-pointer group">
              <div className="relative">
                <div className="h-11 w-11 rounded-full bg-linear-to-br from-blue-500 to-purple-600 dark:from-blue-600 dark:to-purple-700 shadow-md group-hover:shadow-lg transition-all group-hover:scale-105"></div>
                <div className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-green-500 border-2 border-white dark:border-gray-800 shadow-sm"></div>
              </div>
              <div className="flex-1 text-sm">
                <p className="font-semibold text-gray-800 dark:text-gray-100">Admin User</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-500"></span>
                  admin@store.com
                </p>
              </div>
              {/* Dropdown Arrow */}
              <svg
                className="h-4 w-4 text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-linear-to-br from-black/60 via-blue-900/20 to-purple-900/20 dark:from-black/80 dark:via-blue-900/30 dark:to-purple-900/30 backdrop-blur-sm md:hidden transition-opacity animate-in fade-in duration-300"
          onClick={() => setIsOpen(false)}
        ></div>
      )}
    </>
  )
}